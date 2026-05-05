import { useState, useEffect } from 'react';
import { X, Cloud, CheckCircle } from 'lucide-react';
import { cloudDriveApi, CloudDriveConnection } from '../../../../shared/services/cloudDriveApi';
import { cloudAuthService, CloudProvider } from '../../../../shared/services/cloudAuthService';

interface ConnectCloudDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google_drive' | 'onedrive' | null;
  onConnected?: () => void;
}

const PROVIDERS = [
  {
    id: 'google' as CloudProvider,
    dbId: 'google_drive' as const,
    name: 'Google Drive',
    description: 'Connect your Google Drive to sync files',
    icon: '🔷',
    color: 'blue',
  },
  {
    id: 'onedrive_personal' as CloudProvider,
    dbId: 'onedrive_personal' as const,
    name: 'OneDrive',
    description: 'Connect your personal OneDrive account',
    icon: '🔵',
    color: 'sky',
  },
  // {
  //   id: 'onedrive_business' as CloudProvider,
  //   dbId: 'onedrive_business' as const,
  //   name: 'OneDrive Business',
  //   description: 'Connect your OneDrive for Business account',
  //   icon: '💼',
  //   color: 'indigo',
  // },
];

export default function ConnectCloudDriveModal({ isOpen, onClose, provider, onConnected }: ConnectCloudDriveModalProps) {
  const [existingConnection, setExistingConnection] = useState<CloudDriveConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkExistingConnection();
    }
  }, [isOpen]);

  const checkExistingConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const connection = await cloudDriveApi.getCurrentUserConnection();
      setExistingConnection(connection);
    } catch (err) {
      console.error('Error checking connection:', err);
      // Don't set error for no connection found
      if (err instanceof Error && !err.message.includes('No connection found')) {
        setError('Failed to check existing connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId: CloudProvider) => {
    setIsConnecting(true);
    setError(null);

    try {
      await cloudAuthService.initiateOAuth(providerId);
      onConnected?.();
      onClose();
    } catch (err) {
      console.error('Error connecting:', err);
      setError('Failed to connect cloud drive');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;

    try {
      setIsConnecting(true);
      setError(null);

      await cloudDriveApi.deleteConnection(existingConnection.id);
      setExistingConnection(null);
      onConnected?.(); // Refresh parent component
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect cloud drive');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  const getProviderName = () => {
    if (provider === 'google_drive') return 'Google Drive';
    if (provider === 'onedrive') return 'OneDrive';
    return 'Cloud Drive';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {existingConnection ? 'Cloud Drive Connection' : `Connect ${getProviderName()}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Checking connection...</p>
            </div>
          ) : existingConnection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {PROVIDERS.find(p => p.dbId === existingConnection.provider)?.name} Connected
                  </p>
                  {existingConnection.provider_email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {existingConnection.provider_email}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Connected on {new Date(existingConnection.connected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Only one cloud drive connection is allowed per user. To connect a different provider, you must first disconnect your current connection.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {provider ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You will be redirected to {getProviderName()} to authorize the connection. After authorization, you'll be able to access and sync your files.
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const providerId = provider === 'google_drive' ? 'google' : 'onedrive_personal';
                        handleConnect(providerId as CloudProvider);
                      }}
                      disabled={isConnecting}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? 'Connecting...' : `Connect ${getProviderName()}`}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a cloud storage provider to connect with your account. You can only connect one provider at a time.
                  </p>

                  <div className="grid gap-4">
                    {PROVIDERS.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleConnect(provider.id)}
                        disabled={isConnecting}
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">{provider.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">{provider.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{provider.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}