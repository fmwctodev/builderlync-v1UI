import { useState } from 'react';
import { X, Cloud } from 'lucide-react';
import { cloudDriveService } from '../../../../shared/services/cloudDriveService';

interface ConnectCloudDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google_drive' | 'onedrive' | null;
  onConnected?: () => void;
}

export default function ConnectCloudDriveModal({ isOpen, onClose, provider, onConnected }: ConnectCloudDriveModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!provider) return;

    setIsConnecting(true);
    setError(null);

    try {
      let authUrl: string;
      if (provider === 'google_drive') {
        authUrl = cloudDriveService.initiateGoogleDriveAuth();
      } else {
        authUrl = cloudDriveService.initiateOneDriveAuth();
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        authUrl,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success') {
          window.removeEventListener('message', handleMessage);
          onConnected?.();
          onClose();
        } else if (event.data.type === 'oauth-error') {
          window.removeEventListener('message', handleMessage);
          setError(event.data.error || 'Failed to connect');
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('Error connecting:', err);
      setError('Failed to initiate connection');
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

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect {getProviderName()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will be redirected to {getProviderName()} to authorize the connection. After authorization, you'll be able to access and sync your files.
          </p>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              By connecting, you authorize BuilderLynk to access your {getProviderName()} files. You can disconnect at any time.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : `Connect ${getProviderName()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
