import { useState, useEffect } from 'react';
import { X, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import { cloudDriveApi, CloudDriveConnection } from '../../../../shared/services/cloudDriveApi';
import { cloudAuthService, CloudProvider } from '../../../../shared/services/cloudAuthService';



interface ConnectCloudDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    name: 'OneDrive Personal',
    description: 'Connect your personal OneDrive account',
    icon: '🔵',
    color: 'sky',
  },
  {
    id: 'onedrive_business' as CloudProvider,
    dbId: 'onedrive_business' as const,
    name: 'OneDrive Business',
    description: 'Connect your OneDrive for Business account',
    icon: '💼',
    color: 'indigo',
  },
];

export default function ConnectCloudDriveModal({ isOpen, onClose }: ConnectCloudDriveModalProps) {
  const [existingConnection, setExistingConnection] = useState<CloudDriveConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
      setError('Failed to check existing connection');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId: CloudProvider) => {
    setIsConnecting(true);
    setError(null);

    try {
      if (existingConnection) {
        setError('You already have a cloud drive connected. Please disconnect it first.');
        setIsConnecting(false);
        return;
      }

      await cloudAuthService.initiateOAuth(providerId);
    } catch (err) {
      console.error('Error connecting:', err);
      setError('Failed to connect cloud drive');
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
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect cloud drive');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect Cloud Drive</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : null}

          {existingConnection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {PROVIDERS.find(p => p.dbId === existingConnection.provider)?.name} Connected
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {existingConnection.provider_email}
                  </p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose a cloud storage provider to connect with your account. You can only connect one provider at a time.
              </p>

              <div className="grid gap-4">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="text-3xl">{provider.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.description}
                      </p>
                    </div>
                    <Cloud className={`h-5 w-5 text-${provider.color}-600`} />
                  </button>
                ))}
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  By connecting a cloud drive, you authorize BuilderLynk to access and sync files from your selected cloud storage provider. You can disconnect at any time. Your files remain in your cloud storage and are not transferred to our servers.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
