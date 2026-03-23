import { supabase } from '../../../shared/lib/supabase';
import type { SyncResult } from '../types';

export async function syncNow(
  orgId: string,
  platform?: 'facebook' | 'googlebusiness',
  cursor?: string
): Promise<SyncResult> {
  const { data, error } = await supabase.functions.invoke('reputation-sync', {
    body: { orgId, platform, cursor },
  });

  if (error) {
    throw new Error(`Sync failed: ${error.message}`);
  }

  if (data?.code === 'LATE_NOT_CONNECTED') {
    throw new Error('LATE_NOT_CONNECTED');
  }

  if (data?.code === 'LATE_AUTH_ERROR') {
    throw new Error('LATE_AUTH_ERROR');
  }

  return data as SyncResult;
}

export async function getLateConnectionStatus(
  orgId: string
): Promise<{ connected: boolean; apiKeySet: boolean }> {
  const { data } = await supabase
    .from('integration_connections')
    .select('status, configuration')
    .eq('organization_id', orgId)
    .eq('integration_name', 'late')
    .maybeSingle();

  if (!data) return { connected: false, apiKeySet: false };

  const config = data.configuration as Record<string, string> | null;
  return {
    connected: data.status === 'connected',
    apiKeySet: Boolean(config?.api_key),
  };
}

export async function saveLateApiKey(orgId: string, apiKey: string): Promise<void> {
  const { data: existing } = await supabase
    .from('integration_connections')
    .select('id')
    .eq('organization_id', orgId)
    .eq('integration_name', 'late')
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('integration_connections')
      .update({
        status: 'connected',
        configuration: { api_key: apiKey },
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw new Error(`Failed to update Late integration: ${error.message}`);
  } else {
    const { error } = await supabase.from('integration_connections').insert({
      organization_id: orgId,
      integration_name: 'late',
      connection_type: 'api_key',
      status: 'connected',
      configuration: { api_key: apiKey },
      scopes: ['reviews'],
    });

    if (error) throw new Error(`Failed to create Late integration: ${error.message}`);
  }
}

export async function disconnectLate(orgId: string): Promise<void> {
  const { error } = await supabase
    .from('integration_connections')
    .update({ status: 'disconnected', configuration: {} })
    .eq('organization_id', orgId)
    .eq('integration_name', 'late');

  if (error) throw new Error(`Failed to disconnect Late integration: ${error.message}`);
}
