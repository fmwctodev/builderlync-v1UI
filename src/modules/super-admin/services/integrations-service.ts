import { supabase, handleSupabaseError } from './supabase-client';
import { IntegrationHealth } from '../types';

export const getIntegrationHealth = async (): Promise<IntegrationHealth[]> => {
  try {
    const { data, error } = await supabase
      .from('integration_health')
      .select('*')
      .order('provider');

    if (error) throw error;

    return (data || []).map(health => ({
      id: health.id,
      provider: health.provider,
      status: health.status,
      lastCheckAt: health.last_check_at,
      lastIncidentAt: health.last_incident_at,
      message: health.message,
      affectedAccounts: health.affected_accounts,
      metadata: health.metadata,
    }));
  } catch (error) {
    console.error('Error fetching integration health:', error);
    throw new Error(handleSupabaseError(error));
  }
};
