import { supabase } from '../../../shared/lib/supabase';
import type { MarketingFunnel } from '../types/marketing';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

function rowToFunnel(row: Record<string, unknown>): MarketingFunnel {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    name: row.name as string,
    funnel_type: row.funnel_type as string,
    headline: row.headline as string,
    offer: row.offer as string,
    form_id: row.form_id as string | undefined,
    automation_id: row.automation_id as string | undefined,
    submissions: (row.submissions as number) ?? 0,
    appointments_booked: (row.appointments_booked as number) ?? 0,
    close_rate: (row.close_rate as number) ?? 0,
    status: (row.status as MarketingFunnel['status']) ?? 'draft',
  };
}

export const funnelsApi = {
  async getFunnels(orgId: string | null): Promise<MarketingFunnel[]> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_funnels')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToFunnel);
  },

  async createFunnel(
    payload: Partial<MarketingFunnel>,
    orgId: string | null
  ): Promise<MarketingFunnel> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_funnels')
      .insert([{
        organization_id: organizationId,
        name: payload.name || 'New Funnel',
        funnel_type: payload.funnel_type || 'free_inspection',
        headline: payload.headline || '',
        offer: payload.offer || '',
        form_id: payload.form_id || null,
        automation_id: payload.automation_id || null,
        status: 'draft',
      }])
      .select()
      .single();
    if (error) throw error;
    return rowToFunnel(data);
  },

  async updateFunnel(
    id: string,
    updates: Partial<MarketingFunnel>,
    orgId: string | null
  ): Promise<MarketingFunnel> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_funnels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToFunnel(data);
  },

  async deleteFunnel(id: string, orgId: string | null): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_funnels')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },
};
