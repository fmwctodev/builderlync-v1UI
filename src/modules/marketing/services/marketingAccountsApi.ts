import { supabase } from '../../../shared/lib/supabase';
import type { MarketingAccount, ChannelType } from '../types/marketing';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

export const marketingAccountsApi = {
  async getAccounts(orgId: string | null): Promise<MarketingAccount[]> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      org_id: row.organization_id,
      channel: row.channel as ChannelType,
      account_name: row.account_name,
      account_id: row.account_id,
      status: row.status,
      spend_mtd: row.spend_mtd ?? 0,
      leads_mtd: row.leads_mtd ?? 0,
      jobs_won: row.jobs_won ?? 0,
      last_sync: row.last_sync,
      pixel_status: row.pixel_status,
      issues: row.issues ?? [],
    }));
  },

  async syncAccount(id: string, orgId: string | null): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_accounts')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },

  async updateAccountStatus(
    id: string,
    status: MarketingAccount['status'],
    orgId: string | null
  ): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_accounts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },
};
