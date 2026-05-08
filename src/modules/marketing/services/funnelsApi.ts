import { supabase } from '../../../shared/lib/supabase';
import type { MarketingFunnel } from '../types/marketing';
import { isStagingMode } from '../../../shared/utils/stagingAuth';
import { DEMO_FUNNELS } from '../../../shared/utils/demoFixtures';

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

// localStorage key for visitor-edited funnels in staging
const STAGING_FUNNELS_KEY = 'builderlync.demo.funnels';
const loadStagingFunnels = (): MarketingFunnel[] => {
  if (typeof window === 'undefined') return DEMO_FUNNELS as unknown as MarketingFunnel[];
  try {
    const raw = window.localStorage.getItem(STAGING_FUNNELS_KEY);
    if (raw) return JSON.parse(raw) as MarketingFunnel[];
  } catch { /* fall through */ }
  return DEMO_FUNNELS as unknown as MarketingFunnel[];
};
const saveStagingFunnels = (list: MarketingFunnel[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STAGING_FUNNELS_KEY, JSON.stringify(list));
};

export const funnelsApi = {
  async getFunnels(orgId: string | null): Promise<MarketingFunnel[]> {
    if (isStagingMode()) return loadStagingFunnels();
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
    if (isStagingMode()) {
      const list = loadStagingFunnels();
      const created: MarketingFunnel = {
        id: `funnel_${Date.now()}`,
        org_id: resolveOrgId(orgId),
        name: payload.name || 'New Funnel',
        funnel_type: payload.funnel_type || 'free_inspection',
        headline: payload.headline || '',
        offer: payload.offer || '',
        form_id: payload.form_id,
        automation_id: payload.automation_id,
        submissions: 0,
        appointments_booked: 0,
        close_rate: 0,
        status: 'draft',
      };
      saveStagingFunnels([created, ...list]);
      return created;
    }
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
    if (isStagingMode()) {
      const list = loadStagingFunnels();
      const idx = list.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error('Funnel not found');
      const merged = { ...list[idx], ...updates };
      list[idx] = merged;
      saveStagingFunnels(list);
      return merged;
    }
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
    if (isStagingMode()) {
      const list = loadStagingFunnels();
      saveStagingFunnels(list.filter((f) => f.id !== id));
      return;
    }
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_funnels')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },
};
