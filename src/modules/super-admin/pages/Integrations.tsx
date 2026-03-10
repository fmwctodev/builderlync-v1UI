import React, { useState, useEffect } from 'react';
import { Cable, RefreshCw, Building2, KeyRound, Webhook, Settings2 } from 'lucide-react';
import { apiClient } from '../services/supabase-client';
import {
  IntegrationProvider,
  AccountIntegration,
  ApiKey,
  WebhookEndpoint,
  IntegrationStats,
} from '../types/integrations';
import {
  getProviderIcon,
  getStatusColor,
  getStatusIcon,
  getCategoryColor,
  formatLastCheck,
  maskApiKey,
  formatScopes,
} from '../utils/integration-utils';
import { clsx } from 'clsx';

type Tab = 'overview' | 'accounts' | 'api-keys' | 'webhooks';

export const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [accountIntegrations, setAccountIntegrations] = useState<AccountIntegration[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState<IntegrationStats>({
    total: 0,
    healthy: 0,
    warning: 0,
    error: 0,
    unknown: 0,
    enabled: 0,
    disabled: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/super-admin/integrations/config');
      if (response && response.data) {
        const { accounts, apiKeys: keys, webhooks: hooks, overview } = response.data;
        setProviders(accounts || []);
        setAccountIntegrations(accounts || []);
        setApiKeys(keys || []);
        setWebhooks(hooks || []);
        if (overview) setStats(overview);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccountIntegrations = accountIntegrations.filter((ai) => {
    const accountName = (ai as any).enterprise_accounts?.name || ai.provider || '';
    return accountName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredApiKeys = apiKeys.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWebhooks = webhooks.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cable className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations & API</h1>
            <p className="text-gray-600 mt-1">Monitor provider health, account connections, and API access (System Managed)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'overview'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <Settings2 className="w-4 h-4" />
              Overview
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {providers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'accounts'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <Building2 className="w-4 h-4" />
              Accounts
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {accountIntegrations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'api-keys'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <KeyRound className="w-4 h-4" />
              API Keys
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {apiKeys.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'webhooks'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <Webhook className="w-4 h-4" />
              Webhooks
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {webhooks.length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'overview' ? 'providers' : activeTab === 'accounts' ? 'accounts' : activeTab === 'api-keys' ? 'API keys' : 'webhooks'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard label="Total Integrations" value={stats.total} color="gray" />
                <StatCard label="Healthy & Active" value={stats.healthy} color="green" />
                <StatCard label="Warning / Issues" value={stats.warning} color="amber" />
                <StatCard label="Not Configured" value={stats.error} color="red" />
                <StatCard label="Unknown Status" value={stats.unknown} color="gray" />
              </div>
              <ProvidersGrid providers={filteredProviders} loading={loading} />
            </>
          )}

          {activeTab === 'accounts' && (
            <AccountIntegrationsTable
              integrations={filteredAccountIntegrations}
              loading={loading}
            />
          )}

          {activeTab === 'api-keys' && (
            <ApiKeysTable
              apiKeys={filteredApiKeys}
              loading={loading}
            />
          )}

          {activeTab === 'webhooks' && (
            <WebhooksTable
              webhooks={filteredWebhooks}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  color: 'gray' | 'green' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    gray: 'text-gray-900 bg-gray-50',
    green: 'text-green-700 bg-green-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
  };

  return (
    <div className={clsx('rounded-xl p-5 border border-transparent shadow-sm transition-all hover:shadow-md', colorClasses[color])}>
      <div className="text-sm font-medium opacity-70 mb-2 truncate">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

interface ProvidersGridProps {
  providers: IntegrationProvider[];
  loading: boolean;
}

const ProvidersGrid: React.FC<ProvidersGridProps> = ({ providers, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500">Scanning integration status...</span>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <Cable className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No integration providers found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">Create providers in the database to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => {
        const Icon = getProviderIcon(provider.key);
        const StatusIcon = getStatusIcon(provider.status);

        return (
          <div
            key={provider.id}
            className="flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-red-500 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
                  <Icon className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{provider.name}</h3>
                  <span className={clsx('inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-1 border', getCategoryColor(provider.category))}>
                    {provider.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2', getStatusColor(provider.status))}>
                <StatusIcon className="w-3.5 h-3.5" />
                {provider.status.toUpperCase()}
              </span>
              <span className={clsx('px-3 py-1 rounded-full text-xs font-bold border-2', provider.is_enabled ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100')}>
                {provider.is_enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Managed via Server .env</span>
              <span className="text-[10px] font-medium text-gray-500">
                Check: {formatLastCheck(provider.last_check_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface AccountIntegrationsTableProps {
  integrations: AccountIntegration[];
  loading: boolean;
}

const AccountIntegrationsTable: React.FC<AccountIntegrationsTableProps> = ({ integrations, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No connected accounts yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">Connected third-party accounts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target Account</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Integration Provider</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Connection Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Last Sync Event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {integrations.map((integration) => {
              const account = (integration as any).enterprise_accounts;
              return (
                <tr key={integration.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                        {account?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{account?.name || 'System Default'}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{account?.plan || 'Enterprise'} Plan</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-700">{integration.provider || integration.provider_key || 'Global Config'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border-2', integration.connected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100')}>
                      {integration.connected ? 'ACTIVE CONNECTION' : 'NOT CONNECTED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs font-medium text-gray-600">{formatLastCheck(integration.last_sync_at)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  loading: boolean;
}

const ApiKeysTable: React.FC<ApiKeysTableProps> = ({ apiKeys, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <KeyRound className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No system API keys found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">API keys defined in server environment will show here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name / Owner</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Masked API Key</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Granted Scopes</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Access Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-bold text-gray-900">{apiKey.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{apiKey.owner_type}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="px-2 py-1 bg-gray-100 rounded text-[11px] font-mono text-gray-600 inline-block border border-gray-200">
                    {maskApiKey(apiKey.key)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {apiKey.scopes.map(scope => (
                      <span key={scope} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold uppercase border border-gray-200 rounded">
                        {scope}
                      </span>
                    ))}
                    {apiKey.scopes.length === 0 && <span className="text-xs text-gray-400">Default Access</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border', apiKey.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100')}>
                    {apiKey.is_active ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-red-600/60 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">System Read-Only</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface WebhooksTableProps {
  webhooks: WebhookEndpoint[];
  loading: boolean;
}

const WebhooksTable: React.FC<WebhooksTableProps> = ({ webhooks, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <Webhook className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No webhooks configured</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">Webhooks listening for system events will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hook Destination</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Endpoint URL</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subscribed Events</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Live Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Config Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{webhook.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] text-gray-600 font-mono truncate max-w-xs bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">{webhook.url}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {webhook.events.slice(0, 3).map(event => (
                      <span key={event} className="px-1.5 py-0.5 bg-red-50/50 text-red-600 text-[9px] font-bold uppercase border border-red-100 rounded">
                        {event}
                      </span>
                    ))}
                    {webhook.events.length > 3 && (
                      <span className="text-[10px] font-bold text-gray-400">+{webhook.events.length - 3} MORE</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border-2', webhook.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100')}>
                    {webhook.is_active ? 'LISTENING' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Server ENV</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Integrations;
