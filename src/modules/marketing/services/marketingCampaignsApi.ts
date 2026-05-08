import { supabase } from '../../../shared/lib/supabase';
import type { Campaign, CampaignStatus, ChannelType, GoalType, ServiceType } from '../types/marketing';
import { isStagingMode } from '../../../shared/utils/stagingAuth';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

// Sierra Marketing Campaign Studio — rich seed campaigns covering the full
// dashboard (active + paused + ended, multiple goals/channels/services).
const STAGING_CAMPAIGNS: Campaign[] = [
  { id: 'mcamp_1', org_id: DEMO_ORG_ID, name: 'Roofing — Plano (Search)', goal: 'leads' as GoalType, service_type: 'residential' as ServiceType, geography: 'Plano, TX + 25mi', budget_daily: 110, budget_monthly: 3300, offer_type: 'free_inspection', destination: '/free-inspection', channels: ['google_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 3210, leads: 38, appointments: 18, estimates: 12, jobs_won: 5, revenue: 92_400, cpl: 84.47, cpa: 178.33, close_rate: 0.42, created_at: new Date(Date.now() - 30 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_2', org_id: DEMO_ORG_ID, name: 'Storm Restoration (Search)', goal: 'leads' as GoalType, service_type: 'residential' as ServiceType, geography: 'DFW Metro', budget_daily: 95, budget_monthly: 2850, offer_type: 'insurance_help', destination: '/insurance-claim', channels: ['google_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 2890, leads: 31, appointments: 19, estimates: 14, jobs_won: 8, revenue: 196_000, cpl: 93.23, cpa: 152.11, close_rate: 0.57, created_at: new Date(Date.now() - 14 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_3', org_id: DEMO_ORG_ID, name: 'Brand (Search)', goal: 'leads' as GoalType, service_type: 'residential' as ServiceType, geography: 'DFW Metro', budget_daily: 40, budget_monthly: 1200, offer_type: 'brand', destination: '/', channels: ['google_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 1180, leads: 18, appointments: 14, estimates: 12, jobs_won: 7, revenue: 142_800, cpl: 65.56, cpa: 84.29, close_rate: 0.58, created_at: new Date(Date.now() - 90 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_4', org_id: DEMO_ORG_ID, name: 'Lead Gen — Roofing Quote (Meta)', goal: 'leads' as GoalType, service_type: 'residential' as ServiceType, geography: 'DFW Metro', budget_daily: 85, budget_monthly: 2550, offer_type: 'free_inspection', destination: '/free-inspection', channels: ['meta_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 2490, leads: 41, appointments: 16, estimates: 9, jobs_won: 4, revenue: 71_200, cpl: 60.73, cpa: 155.63, close_rate: 0.44, created_at: new Date(Date.now() - 21 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_5', org_id: DEMO_ORG_ID, name: 'Awareness — Storm Damage (Meta)', goal: 'awareness' as GoalType, service_type: 'residential' as ServiceType, geography: 'Storm-affected ZIPs', budget_daily: 38, budget_monthly: 1140, offer_type: 'storm_alert', destination: '/storm-response', channels: ['meta_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 1140, leads: 18, appointments: 6, estimates: 4, jobs_won: 2, revenue: 34_800, cpl: 63.33, cpa: 190.00, close_rate: 0.50, created_at: new Date(Date.now() - 5 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_6', org_id: DEMO_ORG_ID, name: 'Reels — Crew Spotlight (Meta)', goal: 'awareness' as GoalType, service_type: 'residential' as ServiceType, geography: 'DFW Metro', budget_daily: 19, budget_monthly: 580, offer_type: 'brand', destination: '/about', channels: ['meta_ads' as ChannelType], status: 'active' as CampaignStatus, spend: 580, leads: 8, appointments: 2, estimates: 1, jobs_won: 0, revenue: 0, cpl: 72.50, cpa: 290.00, close_rate: 0.0, created_at: new Date(Date.now() - 18 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_7', org_id: DEMO_ORG_ID, name: 'Display Retargeting', goal: 'leads' as GoalType, service_type: 'residential' as ServiceType, geography: 'Site visitors past 30 days', budget_daily: 38, budget_monthly: 1140, offer_type: 'free_inspection', destination: '/free-inspection', channels: ['google_ads' as ChannelType], status: 'paused' as CampaignStatus, spend: 1140, leads: 7, appointments: 1, estimates: 0, jobs_won: 0, revenue: 0, cpl: 162.86, cpa: 1140.00, close_rate: 0.0, created_at: new Date(Date.now() - 60 * 86400000).toISOString(), generated_assets: undefined },
  { id: 'mcamp_8', org_id: DEMO_ORG_ID, name: 'Commercial Roofing — LinkedIn', goal: 'leads' as GoalType, service_type: 'commercial' as ServiceType, geography: 'DFW Metro · Property Mgrs', budget_daily: 0, budget_monthly: 0, offer_type: 'brand', destination: '/commercial', channels: ['linkedin' as ChannelType], status: 'draft' as CampaignStatus, spend: 0, leads: 0, appointments: 0, estimates: 0, jobs_won: 0, revenue: 0, cpl: 0, cpa: 0, close_rate: 0, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), generated_assets: undefined },
];

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
    if (isStagingMode()) return STAGING_CAMPAIGNS;
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
    if (isStagingMode()) return STAGING_CAMPAIGNS.find((c) => c.id === id) || null;
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
