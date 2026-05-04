import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import type { MarketingAccount, ChannelPerformance } from '../../types/marketing';
import { marketingAccountsApi } from '../../services/marketingAccountsApi';
import { attributionApi } from '../../services/attributionApi';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const statusIndicator: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  connected: { icon: <CheckCircle size={14} className="text-green-500" />, label: 'Connected', color: 'text-green-600 dark:text-green-400' },
  partial: { icon: <AlertTriangle size={14} className="text-yellow-500" />, label: 'Issues', color: 'text-yellow-600 dark:text-yellow-400' },
  error: { icon: <AlertTriangle size={14} className="text-red-500" />, label: 'Error', color: 'text-red-500' },
  disconnected: { icon: <XCircle size={14} className="text-gray-400" />, label: 'Not Connected', color: 'text-gray-400' },
  pending: { icon: <Loader2 size={14} className="text-blue-400 animate-spin" />, label: 'Pending', color: 'text-blue-400' },
};

const pixelIndicator: Record<string, { label: string; color: string }> = {
  healthy: { label: 'Tracking OK', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
  issues: { label: 'Pixel Issues', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  missing: { label: 'No Tracking', color: 'text-gray-500 bg-gray-100 dark:bg-gray-700' },
  not_applicable: { label: 'N/A', color: 'text-gray-400 bg-gray-50 dark:bg-gray-800' },
};

const ChannelCard: React.FC<{
  account: MarketingAccount;
  onSync: (id: string) => void;
  syncing: boolean;
}> = ({ account, onSync, syncing }) => {
  const si = statusIndicator[account.status] ?? statusIndicator.disconnected;
  const pi = pixelIndicator[account.pixel_status] ?? pixelIndicator.not_applicable;
  const hasIssues = account.issues && account.issues.length > 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-colors ${hasIssues ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{account.account_name}</p>
            <span className="text-xs text-gray-400 capitalize">{account.channel.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {si.icon}
            <span className={`text-xs font-medium ${si.color}`}>{si.label}</span>
            {account.last_sync && (
              <span className="text-xs text-gray-400">
                · synced {new Date(account.last_sync).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pi.color}`}>{pi.label}</span>
        </div>
      </div>

      {account.status !== 'disconnected' && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-paper dark:bg-canvas rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Spend MTD</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {account.spend_mtd > 0 ? `$${account.spend_mtd.toLocaleString()}` : '—'}
            </p>
          </div>
          <div className="bg-paper dark:bg-canvas rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Leads MTD</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{account.leads_mtd}</p>
          </div>
        </div>
      )}

      {hasIssues && (
        <div className="mb-3 space-y-1">
          {account.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-2 py-1.5">
              <AlertTriangle size={10} className="shrink-0 mt-0.5" />
              {issue}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {account.status === 'disconnected' ? (
          <button className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 rounded-lg transition-colors">
            Connect
          </button>
        ) : (
          <>
            <button
              onClick={() => onSync(account.id)}
              disabled={syncing}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} /> Sync
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 rounded-lg">
              <ExternalLink size={10} /> Open
            </button>
            {account.pixel_status === 'issues' && (
              <button className="flex-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 rounded-lg transition-colors">
                Fix Tracking
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ChannelsTrackingTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [accounts, setAccounts] = useState<MarketingAccount[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<Partial<ChannelPerformance>[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'performance' | 'attribution'>('connections');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accts, perf] = await Promise.all([
        marketingAccountsApi.getAccounts(orgId),
        attributionApi.getChannelPerformance(orgId),
      ]);
      setAccounts(accts);
      setChannelPerformance(perf);
    } catch {
      addToast('error', 'Failed to load channel data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await marketingAccountsApi.syncAccount(id, orgId);
      setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, last_sync: new Date().toISOString() } : a));
      addToast('success', 'Channel synced');
    } catch {
      addToast('error', 'Failed to sync channel');
    } finally {
      setSyncingId(null);
    }
  };

  const connectedCount = accounts.filter((a) => a.status === 'connected').length;
  const issueCount = accounts.filter((a) => a.issues && a.issues.length > 0).length;
  const totalTrackedLeads = accounts.reduce((s, a) => s + a.leads_mtd, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Channels Connected', value: `${connectedCount}/${accounts.length}` },
          { label: 'Tracking Issues', value: issueCount.toString(), alert: issueCount > 0 },
          { label: 'Tracked Leads MTD', value: totalTrackedLeads.toString() },
        ].map((s) => (
          <div key={s.label} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${s.alert ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-200 dark:border-gray-700'}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.alert ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(['connections', 'performance', 'attribution'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${activeTab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {t === 'connections' ? 'Channel Connections' : t === 'performance' ? 'Performance' : 'Attribution Model'}
          </button>
        ))}
      </div>

      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.length === 0 && (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <XCircle size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No channels connected</p>
              <p className="text-xs text-gray-500">Connect your ad accounts to start tracking performance.</p>
            </div>
          )}
          {accounts.map((a) => (
            <ChannelCard
              key={a.id}
              account={a}
              onSync={handleSync}
              syncing={syncingId === a.id}
            />
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jobs Won</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Close %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {channelPerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No performance data yet</td>
                  </tr>
                )}
                {channelPerformance.map((cp) => (
                  <tr key={cp.channel} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white capitalize">{String(cp.channel).replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{cp.leads ?? 0}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">{cp.jobs_won ?? 0}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {cp.revenue ? `$${cp.revenue.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${(cp.close_rate ?? 0) >= 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {cp.close_rate ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attribution' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Attribution Model</p>
            <p className="text-xs text-gray-500 mb-4">Choose how credit is distributed across touchpoints in the customer journey.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'First Touch', description: '100% credit to first source', active: false },
                { label: 'Last Touch', description: '100% credit to last source', active: false },
                { label: 'Linear', description: 'Equal credit to all touches', active: false },
                { label: 'Data-Driven', description: 'Sierra AI weighted model', active: true },
              ].map((m) => (
                <button
                  key={m.label}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${m.active ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                  <p className={`text-sm font-semibold mb-1 ${m.active ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{m.label}</p>
                  <p className="text-xs text-gray-500">{m.description}</p>
                  {m.active && <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-1 block">Active</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">UTM Parameter Mapping</p>
            <p className="text-xs text-gray-500 mb-4">How Sierra maps UTM values to channels and campaigns.</p>
            <div className="space-y-2 text-xs">
              {[
                { source: 'google', medium: 'cpc', channel: 'Google Ads' },
                { source: 'facebook', medium: 'paid_social', channel: 'Meta Ads' },
                { source: 'google', medium: 'lsa', channel: 'Local Services Ads' },
                { source: '(direct)', medium: '(none)', channel: 'Direct / Organic' },
              ].map((row) => (
                <div key={row.source + row.medium} className="flex items-center gap-4 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="font-mono text-gray-500 w-28">{row.source}</span>
                  <span className="font-mono text-gray-500 w-32">{row.medium}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{row.channel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
