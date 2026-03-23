import { supabase } from '../shared/lib/supabase';

export interface FacebookAdsAccount {
  id: string;
  organization_id: string;
  account_id: string;
  account_name: string | null;
  currency: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
}

export interface FacebookAdsCampaign {
  id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
}

export interface FacebookAdsKPIs {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  roas: number;
  campaignCount: number;
}

export interface FacebookAdsCampaignSummary {
  campaignId: string;
  campaignName: string;
  status: string;
  objective: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export async function getFacebookAdsAccount(organizationId: string): Promise<FacebookAdsAccount | null> {
  const { data, error } = await supabase
    .from('facebook_ads_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as FacebookAdsAccount | null;
}

export async function getFacebookAdsKPIs(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<FacebookAdsKPIs> {
  const { data, error } = await supabase
    .from('facebook_ads_metrics')
    .select('impressions, clicks, spend, reach, conversions, conversion_value, ctr, cpc, cpm, roas')
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  const rows = data ?? [];
  const totalSpend = rows.reduce((s, r) => s + (r.spend ?? 0), 0);
  const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0);
  const totalClicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const totalReach = rows.reduce((s, r) => s + (r.reach ?? 0), 0);
  const totalConversions = rows.reduce((s, r) => s + (r.conversions ?? 0), 0);
  const totalConvValue = rows.reduce((s, r) => s + (r.conversion_value ?? 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const roas = totalSpend > 0 ? totalConvValue / totalSpend : 0;

  const { data: campaigns } = await supabase
    .from('facebook_ads_campaigns')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalReach,
    totalConversions,
    avgCtr,
    avgCpc,
    avgCpm,
    roas,
    campaignCount: (campaigns as any)?.length ?? 0,
  };
}

export async function getFacebookAdsCampaignSummaries(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<FacebookAdsCampaignSummary[]> {
  const { data, error } = await supabase
    .from('facebook_ads_metrics')
    .select(`
      campaign_id,
      impressions,
      clicks,
      spend,
      reach,
      conversions,
      conversion_value,
      ctr,
      cpc,
      cpm,
      roas,
      facebook_ads_campaigns!inner(campaign_name, campaign_status, objective)
    `)
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  const grouped: Record<string, {
    name: string;
    status: string;
    objective: string | null;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    conversions: number;
    convValue: number;
  }> = {};

  for (const row of data ?? []) {
    const cId = row.campaign_id;
    const camp = row.facebook_ads_campaigns as any;
    if (!grouped[cId]) {
      grouped[cId] = {
        name: camp?.campaign_name ?? 'Unknown',
        status: camp?.campaign_status ?? 'unknown',
        objective: camp?.objective ?? null,
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        conversions: 0,
        convValue: 0,
      };
    }
    grouped[cId].spend += row.spend ?? 0;
    grouped[cId].impressions += row.impressions ?? 0;
    grouped[cId].clicks += row.clicks ?? 0;
    grouped[cId].reach += row.reach ?? 0;
    grouped[cId].conversions += row.conversions ?? 0;
    grouped[cId].convValue += row.conversion_value ?? 0;
  }

  return Object.entries(grouped).map(([cId, g]) => ({
    campaignId: cId,
    campaignName: g.name,
    status: g.status,
    objective: g.objective,
    spend: g.spend,
    impressions: g.impressions,
    clicks: g.clicks,
    reach: g.reach,
    conversions: g.conversions,
    ctr: g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0,
    cpc: g.clicks > 0 ? g.spend / g.clicks : 0,
    cpm: g.impressions > 0 ? (g.spend / g.impressions) * 1000 : 0,
    roas: g.spend > 0 ? g.convValue / g.spend : 0,
  })).sort((a, b) => b.spend - a.spend);
}

export async function getFacebookAdsDailySpend(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; spend: number; clicks: number; impressions: number; reach: number }[]> {
  const { data, error } = await supabase
    .from('facebook_ads_metrics')
    .select('date, spend, clicks, impressions, reach')
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  const grouped: Record<string, { spend: number; clicks: number; impressions: number; reach: number }> = {};
  for (const row of data ?? []) {
    if (!grouped[row.date]) grouped[row.date] = { spend: 0, clicks: 0, impressions: 0, reach: 0 };
    grouped[row.date].spend += row.spend ?? 0;
    grouped[row.date].clicks += row.clicks ?? 0;
    grouped[row.date].impressions += row.impressions ?? 0;
    grouped[row.date].reach += row.reach ?? 0;
  }

  return Object.entries(grouped).map(([date, v]) => ({ date, ...v }));
}
