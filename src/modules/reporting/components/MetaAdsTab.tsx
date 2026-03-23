import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, MousePointerClick, Eye, DollarSign, BarChart3, Loader2, RefreshCw, Settings, Users } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import {
  getFacebookAdsAccount,
  getFacebookAdsKPIs,
  getFacebookAdsCampaignSummaries,
  getFacebookAdsDailySpend,
} from '../../../services/facebookAds';
import type { FacebookAdsKPIs, FacebookAdsCampaignSummary, FacebookAdsAccount } from '../../../services/facebookAds';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface KPICardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
}

function KPICard({ icon, iconBg, label, value, sub }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
      {status}
    </span>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}

function formatNum(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toString();
}

function formatPct(val: number) {
  return `${val.toFixed(2)}%`;
}

const PRESET_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 12 months', days: 365 },
];

export function MetaAdsTab() {
  const { currentOrganization } = useCurrentOrganization();
  const [account, setAccount] = useState<FacebookAdsAccount | null | undefined>(undefined);
  const [kpis, setKpis] = useState<FacebookAdsKPIs | null>(null);
  const [campaigns, setCampaigns] = useState<FacebookAdsCampaignSummary[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; spend: number; clicks: number; reach: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRange, setSelectedRange] = useState(30);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - selectedRange);

  const load = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [acc, kpisData, campaignData, daily] = await Promise.all([
        getFacebookAdsAccount(currentOrganization.id),
        getFacebookAdsKPIs(currentOrganization.id, startDate, endDate),
        getFacebookAdsCampaignSummaries(currentOrganization.id, startDate, endDate),
        getFacebookAdsDailySpend(currentOrganization.id, startDate, endDate),
      ]);
      setAccount(acc);
      setKpis(kpisData);
      setCampaigns(campaignData);
      setDailyData(daily);
    } catch (err) {
      console.error('Failed to load Meta Ads data:', err);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, selectedRange]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = campaigns.filter(c =>
    c.campaignName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (account === null) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Meta Ads Account Connected</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Connect your Meta Ads (Facebook) account to view real-time campaign performance, spend, reach, and conversion data.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Connect Meta Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {account && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account: <span className="font-medium text-gray-700 dark:text-gray-300">{account.account_name ?? account.account_id}</span>
              {account.last_sync_at && (
                <span className="ml-2 text-xs text-gray-400">
                  Last synced {new Date(account.last_sync_at).toLocaleDateString()}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {PRESET_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setSelectedRange(r.days)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedRange === r.days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-500/10"
            label="Total Spend"
            value={formatCurrency(kpis.totalSpend)}
          />
          <KPICard
            icon={<Users className="w-5 h-5 text-sky-500" />}
            iconBg="bg-sky-500/10"
            label="Reach"
            value={formatNum(kpis.totalReach)}
            sub={`Impressions: ${formatNum(kpis.totalImpressions)}`}
          />
          <KPICard
            icon={<MousePointerClick className="w-5 h-5 text-teal-500" />}
            iconBg="bg-teal-500/10"
            label="Clicks"
            value={formatNum(kpis.totalClicks)}
            sub={`CTR: ${formatPct(kpis.avgCtr)}`}
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            label="Conversions"
            value={kpis.totalConversions.toFixed(0)}
            sub={`ROAS: ${kpis.roas.toFixed(2)}x`}
          />
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {kpis && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg CPC</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.avgCpc)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg CPM</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.avgCpm)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Campaigns</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.campaignCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ROAS</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis.roas.toFixed(2)}x</p>
            </div>
          </>
        )}
      </div>

      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Spend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Spend']}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <Bar dataKey="spend" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Campaign Performance</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No campaign data for the selected period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Objective</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spend</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reach</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clicks</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CTR</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPM</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Conversions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((c) => (
                  <tr key={c.campaignId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{c.campaignName}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{c.objective ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(c.spend)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatNum(c.reach)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatNum(c.clicks)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatPct(c.ctr)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(c.cpm)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{c.conversions.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{c.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
