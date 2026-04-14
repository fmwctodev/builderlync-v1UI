import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Loader2, Clock, TrendingUp, Search, Filter, X,
  Sparkles, Phone, Calendar, BarChart3, ChevronDown,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

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

const TYPE_CONFIG: Record<ReportType, { label: string; color: string; icon: React.ReactNode }> = {
  ai: {
    label: 'AI Report',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  call: {
    label: 'Calls',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <Phone className="w-3.5 h-3.5" />,
  },
  appointment: {
    label: 'Appointments',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
  lead_source: {
    label: 'Lead Sources',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  google_ads: {
    label: 'Google Ads',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
  meta_ads: {
    label: 'Meta Ads',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300',
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
  const { currentOrganization, currentOrganizationSlug } = useCurrentOrganization();

  const [reports, setReports] = useState<UnifiedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');

  const load = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock unified list
    setReports([
      {
        id: 'r1',
        name: 'Weekly Sales Analysis',
        type: 'ai',
        dateRange: 'Oct 01 – Oct 07, 2024',
        createdAt: new Date().toISOString(),
        status: 'complete',
        navigateTo: `/org/${currentOrganizationSlug}/reporting/r1`
      },
      {
        id: 'call-summary',
        name: 'Full Call Report',
        type: 'call',
        dateRange: 'Year to Date',
        createdAt: new Date().toISOString(),
        status: 'available',
        switchTab: 'call-report'
      },
      {
        id: 'google-ads-summary',
        name: 'Google Ads Performance',
        type: 'google_ads',
        dateRange: 'Last 30 Days',
        createdAt: new Date().toISOString(),
        status: 'available',
        switchTab: 'google-ads'
      },
      {
        id: 'appointment-summary',
        name: 'Appointment Overview',
        type: 'appointment',
        dateRange: 'Next 30 Days',
        createdAt: new Date().toISOString(),
        status: 'available',
        switchTab: 'appointment'
      }
    ]);

    setLoading(false);
  }, [currentOrganization, currentOrganizationSlug]);

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

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-cyan-500" />}
          iconBg="bg-cyan-500/10"
          label="Total Reports"
          value={reports.length}
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
          label="AI Insights"
          value={reports.filter(r => r.type === 'ai').length}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
          label="Conversion Rate"
          value="12.4%"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
          label="Avg. Gen Time"
          value="45s"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ReportType | '')}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              <option value="ai">AI Reports</option>
              <option value="call">Calls</option>
              <option value="google_ads">Google Ads</option>
              <option value="meta_ads">Meta Ads</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-900 dark:text-white font-medium">No reports matches your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filtered.map((report) => {
                  const typeConf = TYPE_CONFIG[report.type];
                  const statusStyle = STATUS_STYLES[report.status];
                  return (
                    <tr
                      key={report.id}
                      onClick={() => handleRowClick(report)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500">
                            {typeConf.icon}
                          </div>
                          <span className="text-sm font-medium">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{report.dateRange}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}>
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
