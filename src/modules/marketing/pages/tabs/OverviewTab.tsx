import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Beaker, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { GlobalFilterBar } from '../../components/sierra/GlobalFilterBar';
import { MarketingKPIStrip } from '../../components/sierra/MarketingKPIStrip';
import { RevenueFunnelChart } from '../../components/sierra/RevenueFunnelChart';
import { SierraRecommendationCard } from '../../components/sierra/SierraRecommendationCard';
import { ChannelStatusWidget } from '../../components/sierra/ChannelStatusWidget';
import {
  seedKPIs,
  seedFunnelSteps,
  seedExperiments,
} from '../../data/marketingSeedData';
import { generateSierraSummary } from '../../services/sierraEngine';
import { sierraActionsApi } from '../../services/sierraActionsApi';
import { marketingAccountsApi } from '../../services/marketingAccountsApi';
import { attributionApi } from '../../services/attributionApi';
import type { SierraRecommendation, MarketingAccount } from '../../types/marketing';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

interface ChannelPerformanceRow {
  channel: string;
  leads: number;
  jobs_won: number;
  revenue: number;
  close_rate: number;
}

export const OverviewTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<SierraRecommendation[]>([]);
  const [channels, setChannels] = useState<MarketingAccount[]>([]);
  const [channelPerf, setChannelPerf] = useState<ChannelPerformanceRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, accts, perf] = await Promise.all([
        sierraActionsApi.getRecommendations(orgId),
        marketingAccountsApi.getAccounts(orgId),
        attributionApi.getChannelPerformance(orgId),
      ]);
      setRecommendations(recs);
      setChannels(accts);
      setChannelPerf(perf);
    } catch {
      addToast('error', 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const summary = generateSierraSummary(seedKPIs);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const alertSeverityClass = (s: string) => {
    if (s === 'critical') return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400';
    if (s === 'warning') return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-400';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      <GlobalFilterBar dateRange={dateRange} onDateRangeChange={setDateRange} onServiceTypeChange={() => {}} onChannelChange={() => {}} />

      <MarketingKPIStrip kpis={seedKPIs} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                    <Zap size={12} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sierra Recommendations</h3>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {recommendations.length} active
                </span>
              </div>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No active recommendations.</p>
                ) : recommendations.slice(0, 3).map((rec) => (
                  <SierraRecommendationCard key={rec.id} recommendation={rec} compact />
                ))}
              </div>
              {recommendations.length > 3 && (
                <button className="w-full mt-3 text-xs text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1 py-2">
                  View all recommendations <ChevronRight size={12} />
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue Funnel</h3>
              <RevenueFunnelChart steps={seedFunnelSteps} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Connected Channels</h3>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium">Manage</button>
              </div>
              <ChannelStatusWidget channels={channels} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pipeline Impact by Source</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jobs Won</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Close %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {channelPerf.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-500">No attribution data available.</td>
                      </tr>
                    ) : channelPerf.map((cp) => (
                      <tr key={cp.channel} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white capitalize">{cp.channel.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{cp.leads}</td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{cp.jobs_won}</td>
                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">{fmtCurrency(cp.revenue)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cp.close_rate >= 40 ? 'bg-green-100 text-green-700' : cp.close_rate >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {cp.close_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Alerts</h3>
                <div className="space-y-2">
                  {channels.filter((ch) => ch.issues && ch.issues.length > 0).length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-3">No active alerts.</p>
                  ) : channels.filter((ch) => ch.issues && ch.issues.length > 0).map((ch) => (
                    <div key={ch.id} className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${alertSeverityClass('warning')}`}>
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">{ch.account_name}</p>
                        <p className="opacity-80 mt-0.5">{(ch.issues as string[])[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Experiments</h3>
                <div className="space-y-2">
                  {seedExperiments.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{exp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{exp.variant_a} vs {exp.variant_b}</p>
                      </div>
                      <div className="text-right">
                        {exp.status === 'completed' && exp.winner ? (
                          <div>
                            <span className="text-xs font-bold text-green-600">Variant {exp.winner.toUpperCase()} won</span>
                            {exp.lift && <p className="text-xs text-gray-500">+{exp.lift}% lift</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <Beaker size={10} /> Running
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Sierra Daily Summary</span>
          <span className="text-xs text-gray-400 ml-auto">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
      </div>

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
