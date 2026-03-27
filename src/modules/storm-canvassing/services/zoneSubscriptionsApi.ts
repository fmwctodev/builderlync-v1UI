import { supabase } from '../../../shared/lib/supabase';
import type { NWSSeverity } from './nwsApiService';

export interface ZoneAlertSubscription {
  id: string;
  organization_id: string;
  user_id: string;
  zone_code: string;
  zone_name: string;
  state_code: string;
  zone_type: string;
  min_severity: NWSSeverity;
  event_types: string[];
  notify_email: boolean;
  notify_push: boolean;
  is_active: boolean;
  last_notified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateZoneSubscriptionInput {
  zone_code: string;
  zone_name: string;
  state_code: string;
  zone_type?: string;
  min_severity?: NWSSeverity;
  event_types?: string[];
  notify_email?: boolean;
  notify_push?: boolean;
}

export async function getZoneSubscriptions(
  organizationId: string,
  userId: string
): Promise<ZoneAlertSubscription[]> {
  const { data, error } = await supabase
    .from('zone_alert_subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ZoneAlertSubscription[];
}

export async function createZoneSubscription(
  organizationId: string,
  userId: string,
  input: CreateZoneSubscriptionInput
): Promise<ZoneAlertSubscription> {
  const { data, error } = await supabase
    .from('zone_alert_subscriptions')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      zone_code: input.zone_code,
      zone_name: input.zone_name,
      state_code: input.state_code,
      zone_type: input.zone_type || 'Z',
      min_severity: input.min_severity || 'Severe',
      event_types: input.event_types || ['Severe Thunderstorm Warning', 'Tornado Warning'],
      notify_email: input.notify_email || false,
      notify_push: input.notify_push !== false,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ZoneAlertSubscription;
}

export async function updateZoneSubscription(
  id: string,
  updates: Partial<Omit<ZoneAlertSubscription, 'id' | 'organization_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ZoneAlertSubscription> {
  const { data, error } = await supabase
    .from('zone_alert_subscriptions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ZoneAlertSubscription;
}

export async function deleteZoneSubscription(id: string): Promise<void> {
  const { error } = await supabase.from('zone_alert_subscriptions').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleZoneSubscription(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('zone_alert_subscriptions')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
