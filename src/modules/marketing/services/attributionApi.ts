import { supabase } from '../../../shared/lib/supabase';
import type { AttributionRecord, ChannelType } from '../types/marketing';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

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
