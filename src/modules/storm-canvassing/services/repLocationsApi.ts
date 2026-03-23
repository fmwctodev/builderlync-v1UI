import { supabase } from '../../../shared/lib/supabase';
import type { RepLocation, TeamMemberLocation } from '../types';

export async function updateRepLocation(
  organizationId: string,
  userId: string,
  lat: number,
  lng: number,
  accuracy?: number,
  turfId?: string
): Promise<void> {
  const { error } = await supabase
    .from('rep_locations')
    .upsert({
      organization_id: organizationId,
      user_id: userId,
      lat,
      lng,
      accuracy,
      current_turf_id: turfId,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,user_id' });

  if (error) throw new Error(`Failed to update rep location: ${error.message}`);
}

export async function deactivateRepLocation(
  organizationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('rep_locations')
    .update({ is_active: false })
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to deactivate rep location: ${error.message}`);
}

export async function getActiveRepLocations(
  organizationId: string
): Promise<RepLocation[]> {
  const staleCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('rep_locations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .gte('updated_at', staleCutoff);

  if (error) throw new Error(`Failed to fetch rep locations: ${error.message}`);
  return data || [];
}

export async function getTeamLocationsWithStats(
  organizationId: string
): Promise<TeamMemberLocation[]> {
  const repLocations = await getActiveRepLocations(organizationId);
  if (repLocations.length === 0) return [];

  const userIds = repLocations.map((r) => r.user_id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: visits } = await supabase
    .from('canvass_visits')
    .select('user_id')
    .eq('organization_id', organizationId)
    .in('user_id', userIds)
    .gte('occurred_at', todayStart.toISOString());

  const visitCounts: Record<string, number> = {};
  for (const v of visits || []) {
    visitCounts[v.user_id] = (visitCounts[v.user_id] || 0) + 1;
  }

  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id, profiles:user_id(email, full_name)')
    .eq('organization_id', organizationId)
    .in('user_id', userIds);

  const memberMap: Record<string, { email: string; full_name?: string }> = {};
  for (const m of members || []) {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    memberMap[m.user_id] = {
      email: profile?.email || '',
      full_name: profile?.full_name,
    };
  }

  return repLocations.map((loc) => ({
    user_id: loc.user_id,
    email: memberMap[loc.user_id]?.email || '',
    full_name: memberMap[loc.user_id]?.full_name,
    lat: loc.lat,
    lng: loc.lng,
    updated_at: loc.updated_at,
    current_turf_id: loc.current_turf_id,
    today_visits: visitCounts[loc.user_id] || 0,
  }));
}
