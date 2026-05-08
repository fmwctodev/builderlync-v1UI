import { supabase } from '../../../shared/lib/supabase';
import type { AttributionRecord, ChannelType } from '../types/marketing';
import { isStagingMode } from '../../../shared/utils/stagingAuth';
import { DEMO_CONTACTS } from '../../../shared/utils/demoFixtures';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

// Build attribution records from existing demo contacts so the Leads &
// Attribution table has proper rows. Each contact is treated as one
// attribution record using their tags as the channel signal.
const tagToChannel: Record<string, ChannelType> = {
  'google-ads': 'google_ads' as ChannelType,
  'facebook-ads': 'meta_ads' as ChannelType,
  'google-organic': 'organic' as ChannelType,
  referral: 'referral' as ChannelType,
  'storm-canvassing': 'door_knock' as ChannelType,
  'hailstorm-2026': 'door_knock' as ChannelType,
  'insurance-claim': 'organic' as ChannelType,
};

const buildStagingAttribution = (): AttributionRecord[] =>
  DEMO_CONTACTS.map((c, idx) => {
    const channelTag = c.tags?.find((t: string) => tagToChannel[t]);
    const channel = channelTag ? tagToChannel[channelTag] : ('unknown' as ChannelType);
    const status = c.type === 'customer' ? 'won' : 'in_progress';
    return {
      id: `attr_${c.id}`,
      org_id: DEMO_ORG_ID,
      contact_id: String(c.id),
      contact_name: c.full_name,
      opportunity_id: undefined,
      channel,
      campaign_id: undefined,
      campaign_name: channel === 'google_ads' ? 'Roofing — Plano (Search)' : channel === 'meta_ads' ? 'Lead Gen — Roofing Quote' : undefined,
      ad_group: undefined,
      keyword: channel === 'google_ads' ? 'roof replacement plano tx' : undefined,
      landing_page: channel === 'google_ads' || channel === 'meta_ads' ? '/free-inspection' : undefined,
      form_id: c.tags?.includes('insurance-claim') ? 'form_2' : 'form_1',
      utm_source: channel === 'google_ads' ? 'google' : channel === 'meta_ads' ? 'facebook' : undefined,
      utm_medium: channel === 'google_ads' ? 'cpc' : channel === 'meta_ads' ? 'cpc' : undefined,
      utm_campaign: channel === 'google_ads' ? 'roofing-plano-2026q2' : undefined,
      utm_content: undefined,
      first_touch: c.created_at,
      last_touch: c.updated_at,
      assigned_rep: ['Maria Lopez', 'Sam Chen', 'Jess Walker'][idx % 3],
      appointment_status: c.type === 'customer' ? 'completed' as any : 'scheduled' as any,
      estimate_status: c.type === 'customer' ? 'sent' as any : 'none' as any,
      proposal_status: c.type === 'customer' ? 'signed' as any : 'none' as any,
      job_status: c.type === 'customer' ? status as any : 'none' as any,
      revenue_value: c.type === 'customer' ? 18000 + (idx * 1500) : 0,
      service_type: c.tags?.includes('commercial') ? 'commercial' as any : 'residential' as any,
      city: c.address?.split(',')[1]?.trim(),
      zip: c.address?.split(' ').pop(),
      is_repeat_customer: c.tags?.includes('repeat-customer') || false,
    };
  });

function rowToRecord(row: Record<string, unknown>): AttributionRecord {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    contact_id: row.contact_id as string,
    contact_name: (row.contact_name as string) || 'Unknown',
    opportunity_id: row.opportunity_id as string | undefined,
    channel: (row.channel as ChannelType) || 'unknown',
    campaign_id: row.campaign_id as string | undefined,
    campaign_name: row.campaign_name as string | undefined,
    ad_group: row.ad_group as string | undefined,
    keyword: row.keyword as string | undefined,
    landing_page: row.landing_page as string | undefined,
    form_id: row.form_id as string | undefined,
    utm_source: row.utm_source as string | undefined,
    utm_medium: row.utm_medium as string | undefined,
    utm_campaign: row.utm_campaign as string | undefined,
    utm_content: row.utm_content as string | undefined,
    first_touch: row.first_touch as string,
    last_touch: row.last_touch as string,
    assigned_rep: row.assigned_rep as string | undefined,
    appointment_status: (row.appointment_status as AttributionRecord['appointment_status']) || 'none',
    estimate_status: (row.estimate_status as AttributionRecord['estimate_status']) || 'none',
    proposal_status: (row.proposal_status as AttributionRecord['proposal_status']) || 'none',
    job_status: (row.job_status as AttributionRecord['job_status']) || 'none',
    revenue_value: (row.revenue_value as number) ?? 0,
    service_type: row.service_type as AttributionRecord['service_type'],
    city: row.city as string | undefined,
    zip: row.zip as string | undefined,
    is_repeat_customer: (row.is_repeat_customer as boolean) ?? false,
  };
}

export interface AttributionFilters {
  search?: string;
  channel?: ChannelType | '';
  dateFrom?: string;
  dateTo?: string;
}

export const attributionApi = {
  async getRecords(
    orgId: string | null,
    filters?: AttributionFilters
  ): Promise<AttributionRecord[]> {
    if (isStagingMode()) {
      let list = buildStagingAttribution();
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((r) => r.contact_name.toLowerCase().includes(q));
      }
      if (filters?.channel) list = list.filter((r) => r.channel === filters.channel);
      if (filters?.dateFrom) list = list.filter((r) => r.first_touch >= filters.dateFrom!);
      if (filters?.dateTo) list = list.filter((r) => r.first_touch <= filters.dateTo!);
      return list;
    }
    const organizationId = resolveOrgId(orgId);
    let query = supabase
      .from('marketing_attribution_records')
      .select('*')
      .eq('organization_id', organizationId)
      .order('first_touch', { ascending: false });

    if (filters?.channel) {
      query = query.eq('channel', filters.channel);
    }
    if (filters?.dateFrom) {
      query = query.gte('first_touch', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('first_touch', filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    let records = (data || []).map(rowToRecord);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.contact_name.toLowerCase().includes(s) ||
          r.channel.includes(s) ||
          (r.campaign_name || '').toLowerCase().includes(s)
      );
    }

    return records;
  },

  async getChannelPerformance(orgId: string | null) {
    const records = await this.getRecords(orgId);
    const map = new Map<string, { leads: number; jobs_won: number; revenue: number }>();

    for (const r of records) {
      const ch = r.channel;
      if (!map.has(ch)) map.set(ch, { leads: 0, jobs_won: 0, revenue: 0 });
      const entry = map.get(ch)!;
      entry.leads++;
      if (r.job_status === 'won') {
        entry.jobs_won++;
        entry.revenue += r.revenue_value;
      }
    }

    return Array.from(map.entries()).map(([channel, stats]) => ({
      channel,
      ...stats,
      close_rate: stats.leads > 0 ? Math.round((stats.jobs_won / stats.leads) * 100) : 0,
    }));
  },

  async exportCsv(orgId: string | null): Promise<string> {
    const records = await this.getRecords(orgId);
    const headers = [
      'Contact', 'Channel', 'Campaign', 'Rep', 'Appointment', 'Estimate', 'Job Status', 'Revenue', 'City', 'Date'
    ];
    const rows = records.map((r) => [
      `"${r.contact_name}"`,
      r.channel,
      `"${r.campaign_name || ''}"`,
      `"${r.assigned_rep || ''}"`,
      r.appointment_status,
      r.estimate_status,
      r.job_status,
      r.revenue_value,
      `"${r.city || ''}"`,
      new Date(r.first_touch).toLocaleDateString(),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  },
};
