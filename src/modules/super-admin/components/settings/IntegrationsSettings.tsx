import React, { useState, useEffect } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { getIntegrations } from '../../services/settings-integrations-service';
import { disconnectIntegration as disconnectIntegrationAPI } from '../../services/integrations-api-service';
import { SuperAdminIntegration } from '../../types/settings';
import { SUPER_ADMIN_INTEGRATIONS, getCategoryColor } from '../../constants/integrations';
import { IntegrationCredentialsModal } from './IntegrationCredentialsModal';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  connectedInfo?: string;
  learnMoreUrl?: string;
  setupInstructionsUrl?: string;
  loading: boolean;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onManage: (id: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  description,
  category,
  connected,
  connectedInfo,
  learnMoreUrl,
  setupInstructionsUrl,
  loading,
  onConnect,
  onDisconnect,
  onManage,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
            {connected && (
              <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                <Check className="w-3 h-3" />
                <span>Connected</span>
              </span>
            )}
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">
        {description}
      </p>

      {connected && connectedInfo && (
        <p className="text-xs text-green-600 dark:text-green-400 mb-4">
          {connectedInfo}
        </p>
      )}

      <div className="flex flex-col space-y-2">
        {connected ? (
          <>
            <button
              onClick={() => onManage(id)}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
            >
              + Manage
            </button>
            <button
              onClick={() => onDisconnect(id)}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Disconnect'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onConnect(id)}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Connect'}
            </button>
            {(learnMoreUrl || setupInstructionsUrl) && (
              <div className="flex items-center space-x-3 pt-1">
                {learnMoreUrl && (
                  <a
                    href={learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Learn more</span>
                  </a>
                )}
                {setupInstructionsUrl && (
                  <a
                    href={setupInstructionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Setup instructions</span>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const IntegrationsSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Record<string, SuperAdminIntegration>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState<{
    integrationId: 'twilio' | 'stripe' | 'jira' | 'google_workspace';
    integrationName: string;
  } | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await getIntegrations();
      if (response.success && response.data) {
        const integrationsMap: Record<string, SuperAdminIntegration> = {};
        response.data.forEach((integration) => {
          integrationsMap[integration.integration_name] = integration;
        });
        setIntegrations(integrationsMap);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      setToast({ message: 'Failed to load integrations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (id: string) => {
    const integration = SUPER_ADMIN_INTEGRATIONS.find(i => i.id === id);
    if (integration) {
      setShowCredentialsModal({
        integrationId: id as 'twilio' | 'stripe' | 'jira' | 'google_workspace',
        integrationName: integration.name,
      });
    }
  };

  const handleDisconnect = async (id: string) => {
    const integration = SUPER_ADMIN_INTEGRATIONS.find(i => i.id === id);
    if (!confirm(`Are you sure you want to disconnect ${integration?.name || id}?`)) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await disconnectIntegrationAPI(id);
      if (response.success) {
        setToast({ message: `${integration?.name || id} disconnected successfully`, type: 'success' });
        loadIntegrations();
      } else {
        setToast({ message: response.error || 'Failed to disconnect', type: 'error' });
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setToast({ message: 'Failed to disconnect integration', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleManage = (id: string) => {
    const integration = SUPER_ADMIN_INTEGRATIONS.find(i => i.id === id);
    if (integration) {
      setShowCredentialsModal({
        integrationId: id as 'twilio' | 'stripe' | 'jira' | 'google_workspace',
        integrationName: integration.name,
      });
    }
  };

  const handleCredentialsSuccess = () => {
    setToast({ message: 'Integration connected successfully', type: 'success' });
    loadIntegrations();
  };

  const getConnectedInfo = (id: string): string | undefined => {
    const integration = integrations[id];
    if (!integration || integration.status !== 'connected') return undefined;

    if (integration.last_sync_at) {
      return `Last synced: ${new Date(integration.last_sync_at).toLocaleString()}`;
    }
    return 'Connected';
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect and manage platform-wide integrations for all accounts
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUPER_ADMIN_INTEGRATIONS.map((config) => {
            const integration = integrations[config.id];
            const connected = integration?.status === 'connected';
            const connectedInfo = getConnectedInfo(config.id);

            return (
              <IntegrationCard
                key={config.id}
                id={config.id}
                name={config.name}
                description={config.description}
                category={config.category}
                connected={connected}
                connectedInfo={connectedInfo}
                learnMoreUrl={config.learnMoreUrl}
                setupInstructionsUrl={config.setupInstructionsUrl}
                loading={processingId === config.id}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onManage={handleManage}
              />
            );
          })}
        </div>
      )}

      {showCredentialsModal && (
        <IntegrationCredentialsModal
          integrationId={showCredentialsModal.integrationId}
          integrationName={showCredentialsModal.integrationName}
          onClose={() => setShowCredentialsModal(null)}
          onSuccess={handleCredentialsSuccess}
        />
      )}
    </div>
  );
};
