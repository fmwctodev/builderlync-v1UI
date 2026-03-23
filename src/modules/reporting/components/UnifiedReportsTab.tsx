import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Loader2, Clock, TrendingUp, Search, Filter, X,
  Sparkles, Phone, Calendar, BarChart3, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getAIReports, getAIReportStats } from '../../../services/aiReports';
import type { AIReportStats } from '../../../types/aiReports';

type ReportType = 'ai' | 'call' | 'appointment' | 'lead_source' | 'google_ads' | 'meta_ads';

interface UnifiedReport {
  id: string;
  name: string;
  type: ReportType;
  dateRange: string;
  createdAt: string;
  status: 'complete' | 'running' | 'failed' | 'available';
  navigateTo?: string;
  switchTab?: string;
}

interface CombinedStats {
  total: number;
  running: number;
  scheduled: number;
  lastGenerated: string | null;
}

const TYPE_CONFIG: Record<ReportType, { label: string; color: string; icon: React.ReactNode }> = {
  ai: {
    label: 'AI Report',
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  call: {
    label: 'Calls',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <Phone className="w-3.5 h-3.5" />,
  },
  appointment: {
    label: 'Appointments',
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
  lead_source: {
    label: 'Lead Sources',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  google_ads: {
    label: 'Google Ads',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
  meta_ads: {
    label: 'Meta Ads',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  complete: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Complete' },
  running: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Running' },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Failed' },
  available: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-300', label: 'Available' },
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}

function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

interface Props {
  onSwitchTab: (tabId: string) => void;
}

export function UnifiedReportsTab({ onSwitchTab }: Props) {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();

  const [reports, setReports] = useState<UnifiedReport[]>([]);
  const [stats, setStats] = useState<CombinedStats>({ total: 0, running: 0, scheduled: 0, lastGenerated: null });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const formatDateRange = (start: Date, end: Date) => {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const load = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const orgId = currentOrganization.id;
      const yearStart = new Date(`${selectedYear}-01-01`);
      const yearEnd = new Date(`${selectedYear}-12-31`);

      const [aiReportsData, aiStatsData, callData, appointmentData, attributionData, googleData, metaData] = await Promise.all([
        getAIReports(orgId, {}).catch(() => []),
        getAIReportStats(orgId).catch(() => ({ totalReports: 0, runningReports: 0, scheduledReports: 0, lastGeneratedDate: null } as AIReportStats)),
        supabase
          .from('call_logs')
          .select('id, started_at, ended_at, status')
          .eq('organization_id', orgId)
          .gte('started_at', yearStart.toISOString())
          .lte('started_at', yearEnd.toISOString())
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r.data),
        supabase
          .from('appointments')
          .select('id, start_time, end_time, status')
          .eq('organization_id', orgId)
          .gte('start_time', yearStart.toISOString())
          .lte('start_time', yearEnd.toISOString())
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r.data),
        supabase
          .from('lead_source_attribution')
          .select('id, created_at')
          .eq('organization_id', orgId)
          .gte('created_at', yearStart.toISOString())
          .lte('created_at', yearEnd.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r.data),
        supabase
          .from('google_ads_metrics')
          .select('id, date')
          .eq('organization_id', orgId)
          .gte('date', yearStart.toISOString().split('T')[0])
          .lte('date', yearEnd.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r.data),
        supabase
          .from('facebook_ads_metrics')
          .select('id, date')
          .eq('organization_id', orgId)
          .gte('date', yearStart.toISOString().split('T')[0])
          .lte('date', yearEnd.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r.data),
      ]);

      const unified: UnifiedReport[] = [];

      for (const r of aiReportsData as any[]) {
        const yearMatch = r.created_at && new Date(r.created_at).getFullYear().toString() === selectedYear;
        if (!yearMatch) continue;
        unified.push({
          id: r.id,
          name: r.report_name,
          type: 'ai',
          dateRange: r.timeframe_start && r.timeframe_end
            ? `${formatDate(r.timeframe_start)} – ${formatDate(r.timeframe_end)}`
            : 'Custom range',
          createdAt: r.created_at,
          status: r.status as UnifiedReport['status'],
          navigateTo: `/reporting/${r.id}`,
        });
      }

      if (callData) {
        unified.push({
          id: 'call-summary',
          name: `Call Report — ${selectedYear}`,
          type: 'call',
          dateRange: formatDateRange(new Date(`${selectedYear}-01-01`), new Date(`${selectedYear}-12-31`)),
          createdAt: new Date().toISOString(),
          status: 'available',
          switchTab: 'call-report',
        });
      }

      if (appointmentData) {
        unified.push({
          id: 'appointment-summary',
          name: `Appointment Report — ${selectedYear}`,
          type: 'appointment',
          dateRange: formatDateRange(new Date(`${selectedYear}-01-01`), new Date(`${selectedYear}-12-31`)),
          createdAt: new Date().toISOString(),
          status: 'available',
          switchTab: 'appointment',
        });
      }

      if (attributionData) {
        unified.push({
          id: 'attribution-summary',
          name: `Lead Sources Report — ${selectedYear}`,
          type: 'lead_source',
          dateRange: formatDateRange(new Date(`${selectedYear}-01-01`), new Date(`${selectedYear}-12-31`)),
          createdAt: new Date().toISOString(),
          status: 'available',
          switchTab: 'attribution-report',
        });
      }

      if (googleData) {
        unified.push({
          id: 'google-ads-summary',
          name: `Google Ads Report — ${selectedYear}`,
          type: 'google_ads',
          dateRange: formatDateRange(new Date(`${selectedYear}-01-01`), new Date(`${selectedYear}-12-31`)),
          createdAt: new Date().toISOString(),
          status: 'available',
          switchTab: 'google-ads',
        });
      }

      if (metaData) {
        unified.push({
          id: 'meta-ads-summary',
          name: `Meta Ads Report — ${selectedYear}`,
          type: 'meta_ads',
          dateRange: formatDateRange(new Date(`${selectedYear}-01-01`), new Date(`${selectedYear}-12-31`)),
          createdAt: new Date().toISOString(),
          status: 'available',
          switchTab: 'facebook-ads',
        });
      }

      unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const nonAiCount = [callData, appointmentData, attributionData, googleData, metaData].filter(Boolean).length;
      const combinedStats: CombinedStats = {
        total: (aiStatsData.totalReports ?? 0) + nonAiCount,
        running: aiStatsData.runningReports ?? 0,
        scheduled: aiStatsData.scheduledReports ?? 0,
        lastGenerated: aiStatsData.lastGeneratedDate,
      };

      setReports(unified);
      setStats(combinedStats);
    } catch (err) {
      console.error('Failed to load unified reports:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, selectedYear]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRowClick = (report: UnifiedReport) => {
    if (report.navigateTo) {
      navigate(report.navigateTo);
    } else if (report.switchTab) {
      onSwitchTab(report.switchTab);
    }
  };

  const filtered = reports.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasFilters = !!(typeFilter || search);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          iconBg="bg-primary-500/20"
          label="Total Reports"
          value={stats.total}
        />
        <StatCard
          icon={<Loader2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
          iconBg="bg-amber-500/20"
          label="Running"
          value={stats.running}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-teal-500 dark:text-teal-400" />}
          iconBg="bg-teal-500/20"
          label="Scheduled"
          value={stats.scheduled}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
          iconBg="bg-emerald-500/20"
          label="Last Generated"
          value={stats.lastGenerated
            ? new Date(stats.lastGenerated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '-'}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  typeFilter
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="px-5 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReportType | '')}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
            >
              <option value="">All Types</option>
              {(Object.keys(TYPE_CONFIG) as ReportType[]).map((t) => (
                <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={() => { setTypeFilter(''); setSearch(''); }}
                className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-500 text-sm"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-900 dark:text-white font-medium">No reports found</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {hasFilters ? 'Try adjusting your filters' : 'Generate an AI report or data will appear as activity is recorded'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Report</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date Range</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Generated</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filtered.map((report) => {
                  const typeConf = TYPE_CONFIG[report.type];
                  const statusStyle = STATUS_STYLES[report.status] ?? STATUS_STYLES.available;
                  return (
                    <tr
                      key={report.id}
                      onClick={() => handleRowClick(report)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-slate-400">
                            {typeConf.icon}
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConf.color}`}>
                          {typeConf.icon}
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-slate-400">{report.dateRange}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {report.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
