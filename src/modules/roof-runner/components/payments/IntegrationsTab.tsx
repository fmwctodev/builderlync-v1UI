import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';
import { fetchPaymentIntegrations, updatePaymentIntegration, PaymentIntegration } from '../../../../shared/store/services/paymentsApi';
import { connectQuickBooks, disconnectQuickBooks } from '../../../../shared/store/services/quickbooksApi';

const IntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<PaymentIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      if (provider === 'quickbooks') {
        const response = await connectQuickBooks();
        if (response.success && response.data.authUrl) {
          window.location.href = response.data.authUrl;
        }
      } else if (provider === 'stripe') {
        console.log('Connect to Stripe');
      }
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    setConnecting(provider);
    try {
      if (provider === 'quickbooks') {
        await disconnectQuickBooks();
        await updatePaymentIntegration(provider, {
          is_connected: false,
          credentials: {},
        });
      } else if (provider === 'stripe') {
        await updatePaymentIntegration(provider, {
          is_connected: false,
          credentials: {},
        });
      }
      await loadIntegrations();
    } catch (error) {
      console.error(`Error disconnecting from ${provider}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async (provider: string) => {
    console.log(`Syncing ${provider}...`);
    try {
      await updatePaymentIntegration(provider, {
        last_sync_at: new Date().toISOString(),
      });
      await loadIntegrations();
    } catch (error) {
      console.error(`Error syncing ${provider}:`, error);
    }
  };

  const getIntegrationInfo = (provider: string) => {
    switch (provider) {
      case 'quickbooks':
        return {
          name: 'QuickBooks',
          description: 'Sync invoices, payments, and customer data with QuickBooks Online',
          logo: '💼',
        };
      case 'stripe':
        return {
          name: 'Stripe',
          description: 'Accept online payments and manage transactions with Stripe',
          logo: '💳',
        };
      default:
        return {
          name: provider,
          description: 'Payment integration',
          logo: '⚡',
        };
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Integrations
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your payment providers to sync data and process payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const info = getIntegrationInfo(integration.provider);
            const isConnecting = connecting === integration.provider;

            return (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{info.logo}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {info.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {integration.is_connected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Connected
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Not connected
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {integration.is_connected && (
                    <button
                      onClick={() => handleSync(integration.provider)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Sync now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {info.description}
                </p>

                {integration.is_connected && integration.last_sync_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Last synced: {new Date(integration.last_sync_at).toLocaleString()}
                  </p>
                )}

                <div className="flex items-center space-x-3">
                  {integration.is_connected ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(integration.provider)}
                        disabled={isConnecting}
                        className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.provider)}
                      disabled={isConnecting}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Need help with integrations?
          </h4>
          <p className="text-sm text-primary-800 dark:text-blue-200 mb-4">
            Check our documentation or contact support for assistance setting up your payment
            integrations.
          </p>
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
            View Documentation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;
