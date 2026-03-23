import { supabase } from '../../../shared/lib/supabase';
import type { Campaign, CampaignStatus, ChannelType, GoalType, ServiceType } from '../types/marketing';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

function rowToCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    name: row.name as string,
    goal: row.goal as GoalType,
    service_type: row.service_type as ServiceType,
    geography: row.geography as string,
    budget_daily: (row.budget_daily as number) ?? 0,
    budget_monthly: (row.budget_monthly as number) ?? 0,
    offer_type: row.offer_type as string,
    destination: row.destination as string,
    channels: (row.channels as ChannelType[]) ?? [],
    status: row.status as CampaignStatus,
    spend: (row.spend as number) ?? 0,
    leads: (row.leads as number) ?? 0,
    appointments: (row.appointments as number) ?? 0,
    estimates: (row.estimates as number) ?? 0,
    jobs_won: (row.jobs_won as number) ?? 0,
    revenue: (row.revenue as number) ?? 0,
    cpl: (row.cpl as number) ?? 0,
    cpa: (row.cpa as number) ?? 0,
    close_rate: (row.close_rate as number) ?? 0,
    created_at: row.created_at as string,
    generated_assets: row.generated_assets as Campaign['generated_assets'],
  };
}

export const marketingCampaignsApi = {
  async getCampaigns(orgId: string | null): Promise<Campaign[]> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToCampaign);
  },

  async getCampaignById(id: string, orgId: string | null): Promise<Campaign | null> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCampaign(data) : null;
  },

  async createCampaign(
    payload: Partial<Campaign>,
    orgId: string | null
  ): Promise<Campaign> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert([{
        organization_id: organizationId,
        name: payload.name || 'Untitled Campaign',
        goal: payload.goal || 'form_leads',
        service_type: payload.service_type || 'residential_roofing',
        geography: payload.geography || null,
        budget_daily: payload.budget_daily ?? 0,
        budget_monthly: payload.budget_monthly ?? 0,
        offer_type: payload.offer_type || null,
        destination: payload.destination || null,
        channels: payload.channels || [],
        status: 'draft',
        generated_assets: payload.generated_assets || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return rowToCampaign(data);
  },

  async updateCampaign(
    id: string,
    updates: Partial<Campaign>,
    orgId: string | null
  ): Promise<Campaign> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToCampaign(data);
  },

  async updateStatus(
    id: string,
    status: CampaignStatus,
    orgId: string | null
  ): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },

  async duplicateCampaign(id: string, orgId: string | null): Promise<Campaign> {
    const original = await this.getCampaignById(id, orgId);
    if (!original) throw new Error('Campaign not found');
    return this.createCampaign(
      { ...original, name: `${original.name} (Copy)`, status: 'draft' },
      orgId
    );
  },
};
