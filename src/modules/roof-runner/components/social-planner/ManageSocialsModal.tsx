import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { socialMediaApi, SocialPlatform } from '../../../../shared/services/socialMediaApi';

interface ManageSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlatformConnection {
  id: SocialPlatform;
  name: string;
  color: string;
  icon: string;
  connected: boolean;
  accountName?: string;
  connectedAt?: string;
}

export default function ManageSocialsModal({ isOpen, onClose }: ManageSocialsModalProps) {
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([
    { id: 'google_business', name: 'Google Business', color: '#4285F4', icon: '🔷', connected: false },
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘', connected: true, accountName: 'My Business Page', connectedAt: '2024-01-15' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📸', connected: true, accountName: '@mybusiness', connectedAt: '2024-01-15' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', connected: false },
    { id: 'twitter', name: 'Twitter', color: '#1DA1F2', icon: '🐦', connected: false },
    { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '🎵', connected: false },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️', connected: false },
  ]);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const handleConnect = async (platformId: SocialPlatform) => {
    setIsConnecting(true);
    setConnectingPlatform(platformId);

    try {
      alert(`OAuth connection for ${platformId} would be initiated here. This requires OAuth credentials to be configured.`);

      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId
            ? { ...p, connected: true, accountName: 'Connected Account', connectedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Failed to connect platform');
    } finally {
      setIsConnecting(false);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: SocialPlatform) => {
    if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) {
      return;
    }

    try {
      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId
            ? { ...p, connected: false, accountName: undefined, connectedAt: undefined }
            : p
        )
      );
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      alert('Failed to disconnect platform');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Social Accounts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Connect your social media accounts to schedule and publish posts directly from the platform.
          </p>

          <div className="space-y-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{platform.icon}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {platform.name}
                    </h3>
                    {platform.connected ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {platform.accountName}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Not connected
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {platform.connected ? (
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isConnecting}
                      className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {connectingPlatform === platform.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">OAuth Configuration Required</p>
                <p>
                  To enable social media connections, OAuth credentials must be configured for each platform.
                  Contact your administrator or configure the OAuth settings in your environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
