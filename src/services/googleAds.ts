import { supabase } from '../shared/lib/supabase';

export interface GoogleAdsAccount {
  id: string;
  organization_id: string;
  account_id: string;
  account_name: string | null;
  currency_code: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
}

export interface GoogleAdsCampaign {
  id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  campaign_type: string | null;
  budget_amount: number;
  start_date: string | null;
  end_date: string | null;
}

export interface GoogleAdsMetricRow {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  ctr: number;
  average_cpc: number;
  average_cpm: number;
  conversion_rate: number;
  cost_per_conversion: number;
  campaign?: GoogleAdsCampaign;
}

export interface GoogleAdsKPIs {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  roas: number;
  campaignCount: number;
}

export interface GoogleAdsCampaignSummary {
  campaignId: string;
  campaignName: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export async function getGoogleAdsAccount(organizationId: string): Promise<GoogleAdsAccount | null> {
  const { data, error } = await supabase
    .from('google_ads_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as GoogleAdsAccount | null;
}

export async function getGoogleAdsKPIs(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleAdsKPIs> {
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select('impressions, clicks, cost, conversions, conversion_value, ctr, average_cpc')
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  const rows = data ?? [];
  const totalSpend = rows.reduce((s, r) => s + (r.cost ?? 0), 0);
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0);
  const totalClicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const totalConversions = rows.reduce((s, r) => s + (r.conversions ?? 0), 0);
  const totalConvValue = rows.reduce((s, r) => s + (r.conversion_value ?? 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const roas = totalSpend > 0 ? totalConvValue / totalSpend : 0;

  const { data: campaigns } = await supabase
    .from('google_ads_campaigns')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCtr,
    avgCpc,
    roas,
    campaignCount: (campaigns as any)?.length ?? 0,
  };
}

export async function getGoogleAdsCampaignSummaries(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleAdsCampaignSummary[]> {
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select(`
      campaign_id,
      impressions,
      clicks,
      cost,
      conversions,
      conversion_value,
      ctr,
      average_cpc,
      google_ads_campaigns!inner(campaign_name, campaign_status)
    `)
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  const grouped: Record<string, {
    name: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    convValue: number;
  }> = {};

  for (const row of data ?? []) {
    const cId = row.campaign_id;
    const camp = row.google_ads_campaigns as any;
    if (!grouped[cId]) {
      grouped[cId] = {
        name: camp?.campaign_name ?? 'Unknown',
        status: camp?.campaign_status ?? 'unknown',
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        convValue: 0,
      };
    }
    grouped[cId].spend += row.cost ?? 0;
    grouped[cId].impressions += row.impressions ?? 0;
    grouped[cId].clicks += row.clicks ?? 0;
    grouped[cId].conversions += row.conversions ?? 0;
    grouped[cId].convValue += row.conversion_value ?? 0;
  }

  return Object.entries(grouped).map(([cId, g]) => ({
    campaignId: cId,
    campaignName: g.name,
    status: g.status,
    spend: g.spend,
    impressions: g.impressions,
    clicks: g.clicks,
    conversions: g.conversions,
    ctr: g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0,
    cpc: g.clicks > 0 ? g.spend / g.clicks : 0,
    roas: g.spend > 0 ? g.convValue / g.spend : 0,
  })).sort((a, b) => b.spend - a.spend);
}

export async function getGoogleAdsDailySpend(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; spend: number; clicks: number; impressions: number }[]> {
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select('date, cost, clicks, impressions')
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  const grouped: Record<string, { spend: number; clicks: number; impressions: number }> = {};
  for (const row of data ?? []) {
    if (!grouped[row.date]) grouped[row.date] = { spend: 0, clicks: 0, impressions: 0 };
    grouped[row.date].spend += row.cost ?? 0;
    grouped[row.date].clicks += row.clicks ?? 0;
    grouped[row.date].impressions += row.impressions ?? 0;
  }

  return Object.entries(grouped).map(([date, v]) => ({ date, ...v }));
}
