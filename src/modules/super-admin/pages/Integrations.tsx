import React, { useState, useEffect } from 'react';
import { Cable, Plus, RefreshCw, Building2, KeyRound, Webhook, Settings2 } from 'lucide-react';
import { supabase } from '../services/supabase-client';
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
  generateRandomKey,
  validateWebhookUrl,
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data, error } = await supabase
          .from('integration_providers')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        setProviders(data || []);
      } else if (activeTab === 'accounts') {
        const { data, error } = await supabase
          .from('account_integrations')
          .select(`
            *,
            enterprise_accounts:account_id (id, name, status, plan)
          `)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAccountIntegrations(data || []);
      } else if (activeTab === 'api-keys') {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setApiKeys(data || []);
      } else if (activeTab === 'webhooks') {
        const { data, error } = await supabase
          .from('webhook_endpoints')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setWebhooks(data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats: IntegrationStats = {
    total: providers.length,
    healthy: providers.filter((p) => p.status === 'healthy').length,
    warning: providers.filter((p) => p.status === 'warning').length,
    error: providers.filter((p) => p.status === 'error').length,
    unknown: providers.filter((p) => p.status === 'unknown').length,
    enabled: providers.filter((p) => p.is_enabled).length,
    disabled: providers.filter((p) => !p.is_enabled).length,
  };

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccountIntegrations = accountIntegrations.filter((ai) => {
    const accountName = (ai.enterprise_accounts as any)?.name || '';
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
            <p className="text-gray-600 mt-1">Monitor provider health, account connections, and API access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {activeTab === 'api-keys' && (
            <button
              onClick={() => {
                setEditingItem(null);
                setEditorOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </button>
          )}
          {activeTab === 'webhooks' && (
            <button
              onClick={() => {
                setEditingItem(null);
                setEditorOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'overview'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total" value={stats.total} color="gray" />
                <StatCard label="Healthy" value={stats.healthy} color="green" />
                <StatCard label="Warning" value={stats.warning} color="amber" />
                <StatCard label="Error" value={stats.error} color="red" />
                <StatCard label="Unknown" value={stats.unknown} color="gray" />
              </div>
              <ProvidersGrid providers={filteredProviders} loading={loading} onRefresh={loadData} />
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
              onEdit={(k) => {
                setEditingItem(k);
                setEditorOpen(true);
              }}
            />
          )}

          {activeTab === 'webhooks' && (
            <WebhooksTable
              webhooks={filteredWebhooks}
              loading={loading}
              onEdit={(w) => {
                setEditingItem(w);
                setEditorOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {editorOpen && activeTab === 'api-keys' && (
        <ApiKeyEditor
          apiKey={editingItem}
          onClose={() => {
            setEditorOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            setEditorOpen(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}

      {editorOpen && activeTab === 'webhooks' && (
        <WebhookEditor
          webhook={editingItem}
          onClose={() => {
            setEditorOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            setEditorOpen(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
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
    gray: 'text-gray-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={clsx('text-2xl font-bold mt-1', colorClasses[color])}>{value}</div>
    </div>
  );
};

interface ProvidersGridProps {
  providers: IntegrationProvider[];
  loading: boolean;
  onRefresh: () => void;
}

const ProvidersGrid: React.FC<ProvidersGridProps> = ({ providers, loading, onRefresh }) => {
  const handleToggle = async (provider: IntegrationProvider) => {
    try {
      const { error } = await supabase
        .from('integration_providers')
        .update({ is_enabled: !provider.is_enabled })
        .eq('id', provider.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Cable className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No providers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map((provider) => {
        const Icon = getProviderIcon(provider.key);
        const StatusIcon = getStatusIcon(provider.status);

        return (
          <div
            key={provider.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <span className={clsx('inline-block px-2 py-0.5 rounded text-xs font-medium mt-1', getCategoryColor(provider.category))}>
                    {provider.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', getStatusColor(provider.status))}>
                <StatusIcon className="w-3 h-3" />
                {provider.status}
              </span>
              <span className={clsx('px-2 py-0.5 rounded text-xs', provider.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
                {provider.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Last check: {formatLastCheck(provider.last_check_at)}
            </div>

            {provider.last_error && (
              <div className="text-xs text-red-600 mb-3 line-clamp-2" title={provider.last_error}>
                {provider.last_error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(provider)}
                className={clsx(
                  'flex-1 px-3 py-1.5 text-sm border rounded',
                  provider.is_enabled
                    ? 'text-gray-600 border-gray-300 hover:bg-gray-50'
                    : 'text-green-600 border-green-600 hover:bg-green-50'
                )}
              >
                {provider.is_enabled ? 'Disable' : 'Enable'}
              </button>
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
      <div className="text-center py-12 text-gray-500">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No account integrations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {integrations.map((integration) => {
            const account = integration.enterprise_accounts as any;
            return (
              <tr key={integration.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{account?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{account?.plan || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{integration.provider || integration.provider_key || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', integration.connected ? 'bg-green-100 text-green-800' : integration.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}>
                    {integration.connected ? 'Connected' : integration.status || 'Disconnected'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{formatLastCheck(integration.last_sync_at)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  loading: boolean;
  onEdit: (apiKey: ApiKey) => void;
}

const ApiKeysTable: React.FC<ApiKeysTableProps> = ({ apiKeys, loading, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <KeyRound className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No API keys found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scopes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{apiKey.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{apiKey.owner_type}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <code className="text-sm font-mono text-gray-600">{maskApiKey(apiKey.key)}</code>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">{formatScopes(apiKey.scopes)}</div>
              </td>
              <td className="px-6 py-4">
                <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
                  {apiKey.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(apiKey)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface WebhooksTableProps {
  webhooks: WebhookEndpoint[];
  loading: boolean;
  onEdit: (webhook: WebhookEndpoint) => void;
}

const WebhooksTable: React.FC<WebhooksTableProps> = ({ webhooks, loading, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No webhooks found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <tr key={webhook.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{webhook.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 font-mono truncate max-w-xs">{webhook.url}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">{webhook.events.slice(0, 2).join(', ')}{webhook.events.length > 2 ? ` +${webhook.events.length - 2}` : ''}</div>
              </td>
              <td className="px-6 py-4">
                <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
                  {webhook.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(webhook)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ApiKeyEditorProps {
  apiKey: ApiKey | null;
  onClose: () => void;
  onSaved: () => void;
}

const ApiKeyEditor: React.FC<ApiKeyEditorProps> = ({ apiKey, onClose, onSaved }) => {
  const isEditing = !!apiKey;
  const [formData, setFormData] = useState<any>(
    apiKey || {
      name: '',
      key: '',
      owner_type: 'internal',
      owner_id: '',
      scopes: [],
      is_active: true,
      rate_limit_per_min: null,
    }
  );
  const [scopesText, setScopesText] = useState(apiKey?.scopes.join(', ') || '');
  const [generatedKey, setGeneratedKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    const newKey = generateRandomKey();
    setGeneratedKey(newKey);
    setFormData({ ...formData, key: newKey });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const scopes = scopesText.split(',').map((s) => s.trim()).filter(Boolean);
      const data: any = {
        name: formData.name,
        key: formData.key || generateRandomKey(),
        owner_type: formData.owner_type,
        owner_id: formData.owner_id || null,
        scopes,
        is_active: formData.is_active,
        rate_limit_per_min: formData.rate_limit_per_min || null,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('api_keys')
          .update(data)
          .eq('id', apiKey.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('api_keys').insert(data);
        if (insertError) throw insertError;
      }

      onSaved();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit API Key' : 'Create API Key'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!isEditing && generatedKey && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-900 mb-2">Your API Key:</div>
              <code className="block p-3 bg-white rounded text-sm font-mono break-all">{generatedKey}</code>
              <div className="text-sm text-red-700 mt-2">Copy this key now. You won't be able to see it again.</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="My API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Type</label>
            <select
              value={formData.owner_type}
              onChange={(e) => setFormData({ ...formData, owner_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="internal">Internal</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          {formData.owner_type === 'partner' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner ID</label>
              <input
                type="text"
                value={formData.owner_id || ''}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="partner_id"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scopes (comma-separated)
            </label>
            <input
              type="text"
              value={scopesText}
              onChange={(e) => setScopesText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="accounts.read, jobs.write, contacts.read"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Limit (requests per minute)
            </label>
            <input
              type="number"
              value={formData.rate_limit_per_min || ''}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_min: parseInt(e.target.value) || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {!isEditing && (
            <button
              onClick={handleGenerate}
              type="button"
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Generate Key
            </button>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!isEditing && !formData.key)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface WebhookEditorProps {
  webhook: WebhookEndpoint | null;
  onClose: () => void;
  onSaved: () => void;
}

const WebhookEditor: React.FC<WebhookEditorProps> = ({ webhook, onClose, onSaved }) => {
  const isEditing = !!webhook;
  const [formData, setFormData] = useState<any>(
    webhook || {
      name: '',
      url: '',
      secret: '',
      is_active: true,
      events: [],
    }
  );
  const [eventsText, setEventsText] = useState(webhook?.events.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (!validateWebhookUrl(formData.url)) {
        setError('URL must be HTTPS');
        setSaving(false);
        return;
      }

      const events = eventsText.split(',').map((e) => e.trim()).filter(Boolean);
      const data: any = {
        name: formData.name,
        url: formData.url,
        secret: formData.secret || null,
        is_active: formData.is_active,
        events,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('webhook_endpoints')
          .update(data)
          .eq('id', webhook.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('webhook_endpoints').insert(data);
        if (insertError) throw insertError;
      }

      onSaved();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Webhook' : 'Add Webhook'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="My Webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (HTTPS only)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Events (comma-separated)
            </label>
            <input
              type="text"
              value={eventsText}
              onChange={(e) => setEventsText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="job.created, invoice.paid, customer.created"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret (optional)</label>
            <input
              type="text"
              value={formData.secret || ''}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="whsec_..."
            />
            <div className="text-sm text-gray-500 mt-1">Used for HMAC signature verification</div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
