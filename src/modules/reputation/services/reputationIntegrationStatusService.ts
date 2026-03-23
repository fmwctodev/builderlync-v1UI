import { supabase } from '../../../shared/lib/supabase';
import type { ReputationIntegrationStatus } from '../types';

export async function getIntegrationStatus(orgId: string): Promise<ReputationIntegrationStatus | null> {
  const { data, error } = await supabase
    .from('reputation_integration_status')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch integration status: ${error.message}`);
  }

  return data as ReputationIntegrationStatus | null;
}

export async function writeIntegrationStatus(
  orgId: string,
  fields: Partial<Omit<ReputationIntegrationStatus, 'id' | 'org_id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('reputation_integration_status')
    .upsert(
      {
        org_id: orgId,
        ...fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id' }
    );

  if (error) {
    throw new Error(`Failed to write integration status: ${error.message}`);
  }
}

export async function getSyncHealthLast7Days(
  orgId: string
): Promise<{ total: number; successful: number; rate: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('reputation_actions_audit')
    .select('metadata')
    .eq('org_id', orgId)
    .eq('action', 'sync_reviews')
    .gte('created_at', sevenDaysAgo);

  if (error) {
    return { total: 0, successful: 0, rate: 0 };
  }

  const rows = data ?? [];
  const total = rows.length;
  const successful = rows.filter((r) => {
    const meta = r.metadata as Record<string, unknown> | null;
    return !meta?.error && (meta?.failed_accounts as unknown[])?.length === 0;
  }).length;

  return {
    total,
    successful,
    rate: total > 0 ? Math.round((successful / total) * 100) : 0,
  };
}
