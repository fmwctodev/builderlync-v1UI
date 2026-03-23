import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, X, ArrowRight, Loader2 } from 'lucide-react';
import { GlobalFilterBar } from '../../components/sierra/GlobalFilterBar';
import { attributionApi } from '../../services/attributionApi';
import type { AttributionRecord } from '../../types/marketing';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const statusBadge = (status: string) => {
  const colorMap: Record<string, string> = {
    none: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  const label = status === 'none' ? '—' : status.replace(/_/g, ' ');
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[status] ?? colorMap.none}`}>
      {label}
    </span>
  );
};

const channelLabel: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  local_services_ads: 'Local Services',
  referral: 'Referral',
  direct: 'Direct',
  call_tracking: 'Call Track',
  tiktok_ads: 'TikTok Ads',
  microsoft_ads: 'Microsoft Ads',
  youtube: 'YouTube',
  gbp: 'GBP',
  organic_social: 'Organic Social',
  email: 'Email',
  sms: 'SMS',
  unknown: 'Unknown',
};

interface AttributionDrawerProps {
  lead: AttributionRecord;
  onClose: () => void;
}

const AttributionDrawer: React.FC<AttributionDrawerProps> = ({ lead, onClose }) => {
  const steps = [
    { label: 'Lead Created', value: lead.first_touch ? new Date(lead.first_touch).toLocaleDateString() : '—', done: true },
    { label: 'Appointment', value: lead.appointment_status !== 'none' ? lead.appointment_status : 'Not booked', done: lead.appointment_status !== 'none' },
    { label: 'Estimate', value: lead.estimate_status !== 'none' ? lead.estimate_status : 'Not sent', done: lead.estimate_status !== 'none' },
    { label: 'Proposal', value: lead.proposal_status !== 'none' ? lead.proposal_status : 'Not sent', done: lead.proposal_status !== 'none' },
    { label: 'Job', value: lead.job_status !== 'none' ? lead.job_status : 'Not won', done: lead.job_status === 'won' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{lead.contact_name}</h3>
          <p className="text-xs text-gray-500">{channelLabel[lead.channel] ?? lead.channel} • {lead.city}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Attribution</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="font-medium text-gray-900 dark:text-white capitalize">{lead.channel.replace(/_/g, ' ')}</span></div>
            {lead.campaign_name && <div className="flex justify-between"><span className="text-gray-500">Campaign</span><span className="font-medium text-gray-900 dark:text-white">{lead.campaign_name}</span></div>}
            {lead.utm_campaign && <div className="flex justify-between"><span className="text-gray-500">UTM Campaign</span><span className="font-medium text-gray-900 dark:text-white">{lead.utm_campaign}</span></div>}
            {lead.keyword && <div className="flex justify-between"><span className="text-gray-500">Keyword</span><span className="font-medium text-gray-900 dark:text-white">{lead.keyword}</span></div>}
            {lead.landing_page && <div className="flex justify-between"><span className="text-gray-500">Landing Page</span><span className="font-medium text-gray-900 dark:text-white">{lead.landing_page}</span></div>}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Lifecycle</p>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{step.label}</p>
                  <p className="text-xs text-gray-500 capitalize">{step.value.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {lead.revenue_value > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Revenue Won</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.revenue_value)}
            </p>
          </div>
        )}
        {lead.assigned_rep && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Assigned Rep</span>
            <span className="font-medium text-gray-900 dark:text-white">{lead.assigned_rep}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChannelPerformanceRow {
  channel: string;
  leads: number;
  jobs_won: number;
  revenue: number;
  close_rate: number;
}

export const LeadsAttributionTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [dateRange, setDateRange] = useState('30d');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'all' | 'source' | 'revenue' | 'close_rate'>('all');
  const [selectedLead, setSelectedLead] = useState<AttributionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [records, setRecords] = useState<AttributionRecord[]>([]);
  const [channelPerf, setChannelPerf] = useState<ChannelPerformanceRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, perf] = await Promise.all([
        attributionApi.getRecords(orgId, { search }),
        attributionApi.getChannelPerformance(orgId),
      ]);
      setRecords(recs);
      setChannelPerf(perf);
    } catch {
      addToast('error', 'Failed to load attribution data');
    } finally {
      setLoading(false);
    }
  }, [orgId, search]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await attributionApi.exportCsv(orgId);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attribution_export.csv';
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Export downloaded');
    } catch {
      addToast('error', 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalRevenue = records.reduce((s, l) => s + l.revenue_value, 0);
  const wonCount = records.filter((l) => l.job_status === 'won').length;

  return (
    <div className="space-y-6 relative">
      <GlobalFilterBar dateRange={dateRange} onDateRangeChange={setDateRange} onChannelChange={() => {}} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: loading ? '—' : records.length.toString() },
          { label: 'Attributed', value: loading ? '—' : records.filter((l) => l.channel !== 'unknown').length.toString() },
          { label: 'Jobs Won', value: loading ? '—' : wonCount.toString() },
          { label: 'Revenue Influenced', value: loading ? '—' : `$${(totalRevenue / 1000).toFixed(0)}K` },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(['all', 'source', 'revenue', 'close_rate'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${view === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {v === 'all' ? 'All Leads' : v === 'source' ? 'Source Performance' : v === 'revenue' ? 'Revenue by Source' : 'Close Rate'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button className="flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
          <Filter size={14} />
          Filters
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors ml-auto disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : view === 'all' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">No attribution records found.</td>
                  </tr>
                ) : records.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.contact_name}</p>
                        {lead.is_repeat_customer && <span className="text-xs text-blue-600 dark:text-blue-400">Repeat</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {channelLabel[lead.channel] ?? lead.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[140px] truncate">
                      {lead.campaign_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{lead.assigned_rep ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(lead.appointment_status)}</td>
                    <td className="px-4 py-3">{statusBadge(lead.estimate_status)}</td>
                    <td className="px-4 py-3">{statusBadge(lead.job_status)}</td>
                    <td className="px-4 py-3 text-right">
                      {lead.revenue_value > 0 ? (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.revenue_value)}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{lead.city}{lead.zip ? `, ${lead.zip}` : ''}</td>
                    <td className="px-4 py-3">
                      <ArrowRight size={14} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jobs Won</th>
                  {(view === 'revenue' || view === 'source') && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  )}
                  {(view === 'close_rate' || view === 'source') && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Close Rate</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {channelPerf.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">No data available.</td>
                  </tr>
                ) : channelPerf
                    .sort((a, b) => view === 'close_rate' ? b.close_rate - a.close_rate : b.revenue - a.revenue)
                    .map((row) => (
                  <tr key={row.channel} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {channelLabel[row.channel] ?? row.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{row.leads}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{row.jobs_won}</td>
                    {(view === 'revenue' || view === 'source') && (
                      <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(row.revenue)}
                      </td>
                    )}
                    {(view === 'close_rate' || view === 'source') && (
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold ${row.close_rate >= 30 ? 'text-green-600 dark:text-green-400' : row.close_rate >= 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {row.close_rate}%
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedLead && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedLead(null)} />
          <AttributionDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </>
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
