import { useState, useEffect } from 'react';
import { AlertCircle, Cloud } from 'lucide-react';
import FileManagerHeader from '../components/file-manager/FileManagerHeader';
import SearchAndFilterBar from '../components/file-manager/SearchAndFilterBar';
import FolderNavigation from '../components/file-manager/FolderNavigation';
import FileGrid from '../components/file-manager/FileGrid';
import CreateFolderModal from '../components/file-manager/CreateFolderModal';
import FilterSortDrawer from '../components/file-manager/FilterSortDrawer';
import ConnectCloudDriveModal from '../components/file-manager/ConnectCloudDriveModal';
import UploadProgressModal from '../components/file-manager/UploadProgressModal';
import FileManagerDashboard from '../components/file-manager/FileManagerDashboard';
import { fileManagerApi, FileItem, FolderItem, UploadProgress } from '../../../shared/services/fileManagerApi';
import { cloudDriveApi, CloudDriveConnection } from '../../../shared/services/cloudDriveApi';



export default function FileManager() {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFilterSortDrawerOpen, setIsFilterSortDrawerOpen] = useState(false);
  const [isCloudDriveModalOpen, setIsCloudDriveModalOpen] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [connection, setConnection] = useState<CloudDriveConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error' | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);

  const handleCreateFolder = async (folderName: string) => {
    try {
      const newFolder = await fileManagerApi.createFolder(folderName, currentFolderId);
      setFolders([...folders, newFolder]);
      setIsCreateFolderModalOpen(false);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    setIsFilterSortDrawerOpen(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cloud drive connection
      const conn = await cloudDriveApi.getCurrentUserConnection();
      setConnection(conn);

      if (conn) {
        // Load folders and files
        const [foldersData, filesData] = await Promise.all([
          fileManagerApi.getFolders(currentFolderId),
          fileManagerApi.getFiles(currentFolderId)
        ]);
        
        setFolders(foldersData);
        setFiles(filesData.files);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load files and folders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadFileName(file.name);
      setUploadStatus('uploading');
      setUploadError(null);
      
      const uploadedFile = await fileManagerApi.uploadFile(
        file,
        currentFolderId,
        undefined,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      setFiles([...files, uploadedFile]);
      setUploadStatus('success');
      
      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileManagerApi.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await fileManagerApi.deleteFolder(folderId);
      setFolders(folders.filter(f => f.id !== folderId));
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Failed to delete folder');
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <FileManagerHeader
          onCreateFolder={() => setIsCreateFolderModalOpen(true)}
          onConnectCloudDrive={() => setIsCloudDriveModalOpen(true)}
        />
        
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Cloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Connect Your Cloud Drive
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To start managing your files, please connect a cloud storage provider like Google Drive or OneDrive.
            </p>
            <button
              onClick={() => setIsCloudDriveModalOpen(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Connect Cloud Drive
            </button>
          </div>
        </main>
        
        <ConnectCloudDriveModal
          isOpen={isCloudDriveModalOpen}
          onClose={() => setIsCloudDriveModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <FileManagerHeader
        onCreateFolder={() => setIsCreateFolderModalOpen(true)}
        onConnectCloudDrive={() => setIsCloudDriveModalOpen(true)}
        onFileUpload={handleFileUpload}
        showDashboard={showDashboard}
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
      />

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      <main className="flex-grow">
        {showDashboard ? (
          <FileManagerDashboard 
            connection={connection} 
            onRefresh={loadData}
          />
        ) : (
          <div className="p-6">
            <SearchAndFilterBar onFilterSortClick={() => setIsFilterSortDrawerOpen(true)} />
            <FolderNavigation 
              folders={folders} 
              onFolderClick={setCurrentFolderId}
              onDeleteFolder={handleDeleteFolder}
            />
            <FileGrid 
              files={files} 
              onDeleteFile={handleDeleteFile}
            />
          </div>
        )}
      </main>

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

      <FilterSortDrawer
        isOpen={isFilterSortDrawerOpen}
        onClose={() => setIsFilterSortDrawerOpen(false)}
        onApply={handleApplyFilters}
      />

      <ConnectCloudDriveModal
        isOpen={isCloudDriveModalOpen}
        onClose={() => {
          setIsCloudDriveModalOpen(false);
          loadData(); // Reload data after connecting
        }}
      />
      
      <UploadProgressModal
        isOpen={uploadStatus !== null}
        onClose={() => setUploadStatus(null)}
        fileName={uploadFileName}
        progress={uploadProgress.percentage}
        status={uploadStatus || 'uploading'}
        error={uploadError || undefined}
      />
    </div>
  );
}