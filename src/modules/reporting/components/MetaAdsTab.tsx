import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, MousePointerClick, Eye, DollarSign, BarChart3, Loader2, RefreshCw, Settings, Users } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock types and services
interface FacebookAdsAccount {
  id: string;
  account_id: string;
  account_name: string | null;
  last_sync_at: string | null;
}

interface FacebookAdsKPIs {
  totalSpend: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  roas: number;
  campaignCount: number;
}

interface FacebookAdsCampaignSummary {
  campaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  roas: number;
}

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
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
];

export function MetaAdsTab() {
  const { currentOrganization } = useCurrentOrganization();
  const [account, setAccount] = useState<FacebookAdsAccount | null>(null);
  const [kpis, setKpis] = useState<FacebookAdsKPIs | null>(null);
  const [campaigns, setCampaigns] = useState<FacebookAdsCampaignSummary[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRange, setSelectedRange] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setAccount({
      id: '1',
      account_id: 'act_1020304050',
      account_name: 'BuilderLync Social',
      last_sync_at: new Date().toISOString()
    });

    setKpis({
      totalSpend: 8420.75,
      totalImpressions: 620000,
      totalReach: 310000,
      totalClicks: 9400,
      totalConversions: 142,
      avgCtr: 1.52,
      avgCpc: 0.90,
      avgCpm: 13.58,
      roas: 5.6,
      campaignCount: 8
    });

    setCampaigns([
      {
        campaignId: 'm1',
        campaignName: 'Retargeting - Recent Visitors',
        status: 'active',
        objective: 'CONVERSIONS',
        spend: 2100.50,
        impressions: 120000,
        reach: 45000,
        clicks: 3200,
        conversions: 84,
        ctr: 2.67,
        cpm: 17.50,
        roas: 7.2
      },
      {
        campaignId: 'm2',
        campaignName: 'Prospecting - Lookalike Audience',
        status: 'active',
        objective: 'LEAD_GENERATION',
        spend: 4500.25,
        impressions: 400000,
        reach: 220000,
        clicks: 5100,
        conversions: 48,
        ctr: 1.28,
        cpm: 11.25,
        roas: 4.8
      },
      {
        campaignId: 'm3',
        campaignName: 'Awareness - Brand Video',
        status: 'paused',
        objective: 'AWARENESS',
        spend: 1820.00,
        impressions: 100000,
        reach: 85000,
        clicks: 1100,
        conversions: 10,
        ctr: 1.1,
        cpm: 18.20,
        roas: 1.2
      }
    ]);

    setDailyData(
      Array.from({ length: 14 }).map((_, i) => ({
        date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spend: 200 + Math.random() * 300,
        clicks: 60 + Math.random() * 80
      }))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = campaigns.filter(c =>
    c.campaignName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Meta Ads Connected</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Connect your Meta Ads account to see campaign insights.</p>
          <button className="mt-6 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium">Connect Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Account: <span className="font-medium text-gray-900 dark:text-white">{account.account_name} ({account.account_id})</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {PRESET_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setSelectedRange(r.days)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedRange === r.days
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            icon={<DollarSign className="w-5 h-5 text-cyan-600" />}
            iconBg="bg-cyan-100 dark:bg-cyan-900/30"
            label="Total Spend"
            value={formatCurrency(kpis.totalSpend)}
          />
          <KPICard
            icon={<Users className="w-5 h-5 text-sky-600" />}
            iconBg="bg-sky-100 dark:bg-sky-900/30"
            label="Reach"
            value={formatNum(kpis.totalReach)}
            sub={`Impr: ${formatNum(kpis.totalImpressions)}`}
          />
          <KPICard
            icon={<MousePointerClick className="w-5 h-5 text-teal-600" />}
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            label="Clicks"
            value={formatNum(kpis.totalClicks)}
            sub={`CTR: ${formatPct(kpis.avgCtr)}`}
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            label="Conversions"
            value={kpis.totalConversions.toString()}
            sub={`ROAS: ${kpis.roas}x`}
          />
        </div>
      )}

      {dailyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(d) => d.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip />
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
              className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objective</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spend</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reach</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conv.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map((c) => (
                <tr key={c.campaignId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{c.campaignName}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{c.objective.toLowerCase().replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(c.spend)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNum(c.reach)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNum(c.clicks)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatPct(c.ctr)}</td>
                  <td className="px-4 py-3 text-sm text-right">{c.conversions}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{c.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
