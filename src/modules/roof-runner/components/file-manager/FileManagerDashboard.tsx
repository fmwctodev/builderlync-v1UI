import { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  FileText,
  Folder,
  RefreshCw,
  BarChart3,
  Unplug
} from 'lucide-react';
import { cloudDriveApi, CloudDriveConnection } from '../../../../shared/services/cloudDriveApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

interface StorageStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  usedStorage: number;
  filesByType: Record<string, number>;
  recentActivity: Array<{
    type: 'upload' | 'download' | 'delete' | 'share';
    fileName: string;
    timestamp: string;
  }>;
}

interface FileManagerDashboardProps {
  connection: CloudDriveConnection;
  onRefresh: () => void;
}

export default function FileManagerDashboard({ connection, onRefresh }: FileManagerDashboardProps) {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch storage statistics
      const response = await fetch(`${API_BASE_URL}/file-manager/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/file-manager/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync files');
      }

      const result = await response.json();

      if (result.data.errors.length > 0) {
        setError(`Sync completed with ${result.data.errors.length} errors`);
      }

      // Reload stats after sync
      await loadStats();
      onRefresh();
    } catch (err) {
      console.error('Error syncing files:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync files');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      setError(null);

      await cloudDriveApi.disconnectCurrentUser();

      // Close confirmation dialog
      setShowDisconnectConfirm(false);

      // Refresh to show the connect screen
      onRefresh();
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect cloud drive');
      setShowDisconnectConfirm(false);
    } finally {
      setDisconnecting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google_drive':
        return '🔷';
      case 'onedrive_personal':
        return '🔵';
      case 'onedrive_business':
        return '💼';
      default:
        return '☁️';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google_drive':
        return 'Google Drive';
      case 'onedrive_personal':
        return 'OneDrive Personal';
      case 'onedrive_business':
        return 'OneDrive Business';
      default:
        return 'Cloud Storage';
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File Manager</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connected to {getProviderIcon(connection.provider)} {getProviderName(connection.provider)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Files'}
          </button>

          <button
            onClick={() => setShowDisconnectConfirm(true)}
            disabled={disconnecting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Unplug className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Folder className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Folders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFolders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Used Storage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatFileSize(stats.usedStorage)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.filesByType).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Types Breakdown */}
      {stats && Object.keys(stats.filesByType).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Files by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.filesByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-primary-600">{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {/* {stats && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  {activity.type === 'upload' && <Upload className="h-4 w-4 text-primary-600" />}
                  {activity.type === 'download' && <Download className="h-4 w-4 text-primary-600" />}
                  {activity.type === 'share' && <Share2 className="h-4 w-4 text-primary-600" />}
                  {activity.type === 'delete' && <Trash2 className="h-4 w-4 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.fileName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}ed on{' '}
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Connection Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Provider</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {getProviderIcon(connection.provider)} {getProviderName(connection.provider)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{connection.provider_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(connection.connected_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {connection.last_synced_at
                ? new Date(connection.last_synced_at).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Unplug className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Disconnect Cloud Drive
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to disconnect your {getProviderName(connection.provider)} account?
              You will need to reconnect to access your cloud files again.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={disconnecting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {disconnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unplug className="h-4 w-4" />
                    Disconnect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}