import { useState, useEffect } from 'react';
import { Cloud, HardDrive, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import LocalFilesTab from '../components/file-manager/LocalFilesTab';
import SearchAndFilterBar from '../components/file-manager/SearchAndFilterBar';
import FolderNavigation from '../components/file-manager/FolderNavigation';
import FileGrid from '../components/file-manager/FileGrid';
import CreateFolderModal from '../components/file-manager/CreateFolderModal';
import FilterSortDrawer from '../components/file-manager/FilterSortDrawer';
import ConnectCloudDriveModal from '../components/file-manager/ConnectCloudDriveModal';
import UploadProgressModal from '../components/file-manager/UploadProgressModal';
import FileManagerDashboard from '../components/file-manager/FileManagerDashboard';
import { backendFilesApi, FileRecord, FolderRecord } from '../../../shared/services/backendFilesApi';
import { UploadProgress } from '../../../shared/services/fileManagerApi';
import { cloudDriveApi, CloudDriveConnection } from '../../../shared/services/cloudDriveApi';

export default function FileManager() {
  const [activeTab, setActiveTab] = useState<'my-cloud' | 'local-files'>('local-files');
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFilterSortDrawerOpen, setIsFilterSortDrawerOpen] = useState(false);
  const [isCloudDriveModalOpen, setIsCloudDriveModalOpen] = useState(false);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [connection, setConnection] = useState<CloudDriveConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error' | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ pdf: boolean; image: boolean }>({ pdf: false, image: false });
  const [sortBy, setSortBy] = useState('uploadDateNewest');
  const [showDashboard, setShowDashboard] = useState(true);
  const [targetFolderId, setTargetFolderId] = useState<string | number | undefined>();
  const [folderPath, setFolderPath] = useState<Array<{ id: string | number, name: string }>>([]);
  const [nextFilePageToken, setNextFilePageToken] = useState<string | undefined>();
  const [nextFolderPageToken, setNextFolderPageToken] = useState<string | undefined>();
  const [isLoadingMoreFiles, setIsLoadingMoreFiles] = useState(false);
  const [isLoadingMoreFolders, setIsLoadingMoreFolders] = useState(false);

  const tabs = [
    { id: 'my-cloud' as const, label: 'My Cloud', icon: Cloud },
    { id: 'local-files' as const, label: 'Local Files', icon: HardDrive },
  ];

  const handleCreateFolder = async (folderName: string) => {
    try {
      const parentId = targetFolderId || currentFolderId;
      const newFolder = await backendFilesApi.createFolder({
        name: folderName,
        parentId: parentId,
        cloudProvider: 'google'
      });
      setFolders([...folders, newFolder]);
      setIsCreateFolderModalOpen(false);
      setTargetFolderId(undefined);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

  const handleFolderClick = (folderId: string | number) => {
    const folder = folders.find(f => f.id.toString() === folderId.toString());
    if (folder) {
      setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    }
    setCurrentFolderId(folderId);
  };

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      setCurrentFolderId(parentId);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    const folderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    setCurrentFolderId(folderId);
  };

  const handleHomeClick = () => {
    setFolderPath([]);
    setCurrentFolderId(null);
  };

  const handleCreateSubfolder = (parentId: string | number) => {
    setTargetFolderId(parentId);
    setIsCreateFolderModalOpen(true);
  };

  const handleUploadToFolder = (folderId: string | number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          handleFileUploadToFolder(file, folderId);
        });
      }
    };
    input.click();
  };

  const handleFileUploadToFolder = async (file: File, folderId: string | number) => {
    try {
      setUploadFileName(file.name);
      setUploadStatus('uploading');
      setUploadError(null);

      const uploadedFile = await backendFilesApi.uploadFile(
        file,
        folderId,
        (progress) => {
          setUploadProgress({ loaded: 0, total: 0, percentage: progress });
        }
      );

      setFiles([...files, uploadedFile]);
      setUploadStatus('success');

      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    if (newFilters.sortBy) setSortBy(newFilters.sortBy);
    if (newFilters.fileTypes) setFilters(newFilters.fileTypes);
    setIsFilterSortDrawerOpen(false);
  };

  const getFilteredAndSortedFiles = () => {
    let result = [...files];

    // Search
    if (searchTerm) {
      result = result.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file as any).original_filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filters.pdf || filters.image) {
      result = result.filter(file => {
        if (filters.pdf && file.mime_type?.includes('pdf')) return true;
        if (filters.image && file.mime_type?.includes('image')) return true;
        return false;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'fileSizeLargest':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'fileSizeSmallest':
          return (a.file_size || 0) - (b.file_size || 0);
        case 'uploadDateNewest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'uploadDateOldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'fileNameAZ':
          return a.filename.localeCompare(b.filename);
        case 'fileNameZA':
          return b.filename.localeCompare(a.filename);
        default:
          return 0;
      }
    });

    return result;
  };

  const getFilteredFolders = () => {
    if (searchTerm) {
      return folders.filter(folder => folder.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return folders;
  };

  const displayedFiles = getFilteredAndSortedFiles();
  const displayedFolders = getFilteredFolders();

  const loadData = async (fileToken?: string, folderToken?: string, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      // Check cloud drive connection first
      const conn = await cloudDriveApi.getCurrentUserConnection();
      setConnection(conn);

      if (conn) {
        // Load folders and files
        const result = await backendFilesApi.getFolderContents(currentFolderId, fileToken, folderToken);

        if (append) {
          if (fileToken) {
            setFiles(prev => [...prev, ...result.files]);
            setNextFilePageToken(result.nextFilePageToken);
          }
          if (folderToken) {
            setFolders(prev => [...prev, ...result.folders]);
            setNextFolderPageToken(result.nextFolderPageToken);
          }
        } else {
          setFolders(result.folders);
          setFiles(result.files);
          setNextFilePageToken(result.nextFilePageToken);
          setNextFolderPageToken(result.nextFolderPageToken);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load files and folders');
    } finally {
      setLoading(false);
      setIsLoadingMoreFiles(false);
      setIsLoadingMoreFolders(false);
    }
  };

  const handleLoadMoreFiles = () => {
    if (nextFilePageToken && !isLoadingMoreFiles) {
      setIsLoadingMoreFiles(true);
      loadData(nextFilePageToken, undefined, true);
    }
  };

  const handleLoadMoreFolders = () => {
    if (nextFolderPageToken && !isLoadingMoreFolders) {
      setIsLoadingMoreFolders(true);
      loadData(undefined, nextFolderPageToken, true);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadFileName(file.name);
      setUploadStatus('uploading');
      setUploadError(null);

      const uploadedFile = await backendFilesApi.uploadFile(
        file,
        currentFolderId,
        (progress) => {
          setUploadProgress({ loaded: 0, total: 0, percentage: progress });
        }
      );

      setFiles([...files, uploadedFile]);
      setUploadStatus('success');

      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleDeleteFile = async (fileId: string | number) => {
    try {
      await backendFilesApi.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleDeleteFolder = async (folderId: string | number) => {
    try {
      await backendFilesApi.deleteFolder(folderId);
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

  if (!connection && (activeTab === 'my-cloud' || activeTab === 'local-files')) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">File Manager</h1>
          </div>

          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
                    : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
                    }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
          provider={null}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">File Manager</h1>
        </div>

        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id
                  ? 'bg-primary-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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

      <div className="flex-1 overflow-auto">
        {activeTab === 'my-cloud' && connection && (
          <div className="p-6">
            {showDashboard ? (
              <FileManagerDashboard
                connection={connection}
                onRefresh={loadData}
              />
            ) : (
              <>
                <SearchAndFilterBar
                  onSearch={setSearchTerm}
                  onFilterSortClick={() => setIsFilterSortDrawerOpen(true)}
                />

                {/* Breadcrumb Navigation */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    onClick={handleHomeClick}
                    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                  {folderPath.map((folder, index) => (
                    <div key={folder.id} className="flex items-center gap-2">
                      <span>/</span>
                      <button
                        onClick={() => handleBreadcrumbClick(index)}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {folder.name}
                      </button>
                    </div>
                  ))}
                  {folderPath.length > 0 && (
                    <button
                      onClick={handleBackClick}
                      className="ml-4 flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}
                </div>

                <FolderNavigation
                  folders={displayedFolders.map(f => ({ id: f.id.toString(), name: f.name }))}
                  onFolderClick={handleFolderClick}
                  onDeleteFolder={handleDeleteFolder}
                  onCreateSubfolder={handleCreateSubfolder}
                  onUploadToFolder={handleUploadToFolder}
                />
                {nextFolderPageToken && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleLoadMoreFolders}
                      disabled={isLoadingMoreFolders}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm disabled:opacity-50"
                    >
                      {isLoadingMoreFolders ? 'Loading...' : 'Load More Folders'}
                    </button>
                  </div>
                )}

                <FileGrid
                  files={displayedFiles.map(f => ({
                    id: f.id as any,
                    name: f.filename,
                    type: f.mime_type ? f.mime_type.split('/')[1] || 'file' : 'file',
                    pages: 1,
                    thumbnail: f.file_path,
                    mime_type: f.mime_type || '',
                    file_size: f.file_size || 0,
                    filename: f.filename,
                    file_path: f.file_path,
                    created_at: f.created_at
                  }))}
                  onDeleteFile={(id) => handleDeleteFile(id)}
                />
                {nextFilePageToken && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleLoadMoreFiles}
                      disabled={isLoadingMoreFiles}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm disabled:opacity-50"
                    >
                      {isLoadingMoreFiles ? 'Loading...' : 'Load More Files'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {activeTab === 'local-files' && <LocalFilesTab isCloudConnected={!!connection} />}
      </div>

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
        provider={null}
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
