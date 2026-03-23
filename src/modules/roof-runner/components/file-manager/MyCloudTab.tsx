import { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Download, Folder as FolderIcon } from 'lucide-react';
import { cloudDriveService, CloudConnection, CloudFile } from '../../../../shared/services/cloudDriveService';
import ConnectCloudDriveModal from './ConnectCloudDriveModal';

export default function MyCloudTab() {
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<CloudFile[]>([]);
  const [oneDriveFiles, setOneDriveFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google_drive' | 'onedrive' | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const allConnections = await cloudDriveService.getAllConnections();
      setConnections(allConnections);

      const googleConnection = allConnections.find(c => c.provider === 'google_drive');
      const onedriveConnection = allConnections.find(c => c.provider === 'onedrive');

      if (googleConnection) {
        await loadGoogleDriveFiles();
      }

      if (onedriveConnection) {
        await loadOneDriveFiles();
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleDriveFiles = async () => {
    try {
      const files = await cloudDriveService.listGoogleDriveFiles();
      setGoogleDriveFiles(files);
    } catch (error) {
      console.error('Error loading Google Drive files:', error);
    }
  };

  const loadOneDriveFiles = async () => {
    try {
      const files = await cloudDriveService.listOneDriveFiles();
      setOneDriveFiles(files);
    } catch (error) {
      console.error('Error loading OneDrive files:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const googleConnection = connections.find(c => c.provider === 'google_drive');
      const onedriveConnection = connections.find(c => c.provider === 'onedrive');

      if (googleConnection) {
        await loadGoogleDriveFiles();
        await cloudDriveService.updateLastSync('google_drive');
      }

      if (onedriveConnection) {
        await loadOneDriveFiles();
        await cloudDriveService.updateLastSync('onedrive');
      }

      await loadConnections();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = (provider: 'google_drive' | 'onedrive') => {
    setSelectedProvider(provider);
    setIsConnectModalOpen(true);
  };

  const handleDisconnect = async (provider: 'google_drive' | 'onedrive') => {
    try {
      await cloudDriveService.disconnectProvider(provider);
      await loadConnections();

      if (provider === 'google_drive') {
        setGoogleDriveFiles([]);
      } else {
        setOneDriveFiles([]);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const googleConnection = connections.find(c => c.provider === 'google_drive');
  const onedriveConnection = connections.find(c => c.provider === 'onedrive');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cloud connections...</p>
        </div>
      </div>
    );
  }

  const hasAnyConnection = googleConnection || onedriveConnection;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cloud Storage Connections</h2>
        {hasAnyConnection && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
              <Cloud className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Google Drive</h3>
              {googleConnection && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{googleConnection.account_email}</p>
              )}
            </div>
          </div>

          {googleConnection ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Status: <span className="text-green-600 dark:text-green-400 font-medium">Connected</span></p>
                {googleConnection.last_sync_at && (
                  <p>Last sync: {new Date(googleConnection.last_sync_at).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => handleDisconnect('google_drive')}
                className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnect('google_drive')}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Connect Google Drive
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
              <Cloud className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">OneDrive</h3>
              {onedriveConnection && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{onedriveConnection.account_email}</p>
              )}
            </div>
          </div>

          {onedriveConnection ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Status: <span className="text-green-600 dark:text-green-400 font-medium">Connected</span></p>
                {onedriveConnection.last_sync_at && (
                  <p>Last sync: {new Date(onedriveConnection.last_sync_at).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => handleDisconnect('onedrive')}
                className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnect('onedrive')}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Connect OneDrive
            </button>
          )}
        </div>
      </div>

      {hasAnyConnection && (
        <div className="space-y-6">
          {googleConnection && googleDriveFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Google Drive Files</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {googleDriveFiles.slice(0, 12).map((file) => (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      {file.isFolder ? (
                        <FolderIcon className="h-8 w-8 text-red-600" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Cloud className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        GDrive
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onedriveConnection && oneDriveFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">OneDrive Files</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {oneDriveFiles.slice(0, 12).map((file) => (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      {file.isFolder ? (
                        <FolderIcon className="h-8 w-8 text-red-600" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Cloud className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        OneDrive
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasAnyConnection && (
        <div className="text-center py-12">
          <Cloud className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cloud Storage Connected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your Google Drive or OneDrive to access your cloud files
          </p>
        </div>
      )}

      <ConnectCloudDriveModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onConnected={loadConnections}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
