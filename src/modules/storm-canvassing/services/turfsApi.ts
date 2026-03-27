import { supabase } from '../../../shared/lib/supabase';
import type { Turf, TurfAssignment, TurfProgress, TurfStatus } from '../types';

export interface TurfFilters {
  status?: TurfStatus;
  stormEventId?: string;
  assignedUserId?: string;
  search?: string;
}

export async function getTurfs(
  organizationId: string,
  filters?: TurfFilters
): Promise<Turf[]> {
  let query = supabase
    .from('turfs')
    .select(`
      *,
      turf_assignments(
        id,
        user_id,
        status,
        assigned_at
      ),
      storm_events(id, name)
    `)
    .eq('organization_id', organizationId)
    .neq('status', 'ARCHIVED')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.stormEventId) {
    query = query.eq('storm_event_id', filters.stormEventId);
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch turfs: ${error.message}`);
  }

  let turfs = (data || []).map((row) => ({
    ...row,
    geometry: row.geometry,
    assignments: row.turf_assignments || [],
  }));

  if (filters?.assignedUserId) {
    turfs = turfs.filter((turf) =>
      turf.assignments.some((a: TurfAssignment) => a.user_id === filters.assignedUserId)
    );
  }

  return turfs;
}

export async function getMyTurfs(
  organizationId: string,
  userId: string
): Promise<Turf[]> {
  return getTurfs(organizationId, { assignedUserId: userId });
}

export async function getTurfById(
  organizationId: string,
  turfId: string
): Promise<Turf | null> {
  const { data, error } = await supabase
    .from('turfs')
    .select(`
      *,
      turf_assignments(
        id,
        user_id,
        status,
        assigned_at,
        assigned_by,
        started_at,
        completed_at
      ),
      storm_events(id, name)
    `)
    .eq('organization_id', organizationId)
    .eq('id', turfId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch turf: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    geometry: data.geometry,
    assignments: data.turf_assignments || [],
  };
}

export async function createTurf(
  organizationId: string,
  turfData: {
    name: string;
    description?: string;
    geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
    stormEventId?: string;
    color?: string;
  },
  userId?: string
): Promise<Turf> {
  const geometryForDB =
    turfData.geometry.type === 'Polygon'
      ? { type: 'MultiPolygon', coordinates: [turfData.geometry.coordinates] }
      : turfData.geometry;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('turfs')
    .insert({
      organization_id: organizationId,
      user_id: user.id,
      name: turfData.name,
      description: turfData.description,
      geometry: geometryForDB,
      storm_event_id: turfData.stormEventId,
      color: turfData.color || '#3B82F6',
      status: 'NOT_STARTED',
      total_doors: 0,
      visited_doors: 0,
      created_by: userId || user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create turf: ${error.message}`);
  }

  return data;
}

export async function updateTurf(
  organizationId: string,
  turfId: string,
  updates: Partial<Pick<Turf, 'name' | 'description' | 'status' | 'color' | 'storm_event_id'>>
): Promise<Turf> {
  const { data, error } = await supabase
    .from('turfs')
    .update({
      name: updates.name,
      description: updates.description,
      status: updates.status,
      color: updates.color,
      storm_event_id: updates.storm_event_id,
    })
    .eq('organization_id', organizationId)
    .eq('id', turfId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update turf: ${error.message}`);
  }

  return data;
}

export async function deleteTurf(
  organizationId: string,
  turfId: string,
  hardDelete: boolean = false
): Promise<void> {
  if (hardDelete) {
    const { error } = await supabase
      .from('turfs')
      .delete()
      .eq('organization_id', organizationId)
      .eq('id', turfId);

    if (error) {
      throw new Error(`Failed to delete turf: ${error.message}`);
    }
  } else {
    await updateTurf(organizationId, turfId, { status: 'ARCHIVED' });
  }
}

export async function assignUsersToTurf(
  organizationId: string,
  turfId: string,
  userIds: string[],
  assignedBy?: string
): Promise<TurfAssignment[]> {
  const assignments = userIds.map((userId) => ({
    organization_id: organizationId,
    turf_id: turfId,
    user_id: userId,
    status: 'ASSIGNED' as const,
    assigned_by: assignedBy,
  }));

  const { data, error } = await supabase
    .from('turf_assignments')
    .upsert(assignments, {
      onConflict: 'turf_id,user_id',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Failed to assign users to turf: ${error.message}`);
  }

  return data || [];
}

export async function unassignUserFromTurf(
  organizationId: string,
  turfId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('turf_assignments')
    .delete()
    .eq('organization_id', organizationId)
    .eq('turf_id', turfId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to unassign user from turf: ${error.message}`);
  }
}

export async function updateTurfAssignmentStatus(
  organizationId: string,
  turfId: string,
  userId: string,
  status: 'ASSIGNED' | 'ACTIVE' | 'DONE'
): Promise<TurfAssignment> {
  const updates: Record<string, unknown> = { status };

  if (status === 'ACTIVE') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'DONE') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('turf_assignments')
    .update(updates)
    .eq('organization_id', organizationId)
    .eq('turf_id', turfId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update assignment status: ${error.message}`);
  }

  return data;
}

export async function getTurfProgress(
  organizationId: string,
  turfId: string
): Promise<TurfProgress> {
  const { data, error } = await supabase.rpc('calculate_turf_progress', {
    p_turf_id: turfId,
  });

  if (error) {
    throw new Error(`Failed to calculate turf progress: ${error.message}`);
  }

  return data as TurfProgress;
}

export async function getTurfAssignments(
  organizationId: string,
  turfId: string
): Promise<TurfAssignment[]> {
  const { data, error } = await supabase
    .from('turf_assignments')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('turf_id', turfId);

  if (error) {
    throw new Error(`Failed to fetch turf assignments: ${error.message}`);
  }

  return data || [];
}

export async function generateDoorsInTurf(
  organizationId: string,
  turfId: string,
  count: number = 100
): Promise<number> {
  const { data, error } = await supabase.rpc('generate_doors_in_turf', {
    p_turf_id: turfId,
    p_count: count,
  });

  if (error) {
    throw new Error(`Failed to generate doors: ${error.message}`);
  }

  return Array.isArray(data) ? data.length : 0;
}
