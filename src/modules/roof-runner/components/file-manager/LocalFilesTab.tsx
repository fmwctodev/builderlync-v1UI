import { useState, useEffect, useCallback } from 'react';
import { Upload, Folder as FolderIcon, Search, Filter, CloudOff } from 'lucide-react';
import { backendFilesApi, FileRecord, FolderRecord } from '../../../../shared/services/backendFilesApi';
import { cloudDriveApi } from '../../../../shared/services/cloudDriveApi';
import FolderNavigation from './FolderNavigation';
import FileGrid from './FileGrid';
import CreateFolderModal from './CreateFolderModal';
import FileUploadZone from './FileUploadZone';
import SearchAndFilterBar from './SearchAndFilterBar';
import FilterSortDrawer from './FilterSortDrawer';

interface LocalFilesTabProps {
  isCloudConnected?: boolean;
}

export default function LocalFilesTab({ isCloudConnected: propIsCloudConnected }: LocalFilesTabProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | number, name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ pdf: boolean; image: boolean }>({ pdf: false, image: false });
  const [sortBy, setSortBy] = useState('uploadDateNewest');
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [nextFilePageToken, setNextFilePageToken] = useState<string | undefined>();
  const [nextFolderPageToken, setNextFolderPageToken] = useState<string | undefined>();
  const [isLoadingMoreFiles, setIsLoadingMoreFiles] = useState(false);
  const [isLoadingMoreFolders, setIsLoadingMoreFolders] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(propIsCloudConnected || false);

  useEffect(() => {
    if (propIsCloudConnected !== undefined) {
      setIsCloudConnected(propIsCloudConnected);
      return;
    }

    const checkConnection = async () => {
      try {
        const conn = await cloudDriveApi.getCurrentUserConnection();
        setIsCloudConnected(!!conn);
      } catch (error) {
        console.error('Error checking cloud connection:', error);
        setIsCloudConnected(false);
      }
    };
    checkConnection();
  }, [propIsCloudConnected]);

  useEffect(() => {
    loadFolderContents();
    if (currentFolderId) {
      loadBreadcrumbs();
    } else {
      setBreadcrumbs([]);
    }
  }, [currentFolderId]);

  const loadFolderContents = async (fileToken?: string, folderToken?: string, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      }

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
    } catch (error) {
      console.error('Error loading folder contents:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMoreFiles(false);
      setIsLoadingMoreFolders(false);
    }
  };

  const handleLoadMoreFiles = () => {
    if (nextFilePageToken && !isLoadingMoreFiles) {
      setIsLoadingMoreFiles(true);
      loadFolderContents(nextFilePageToken, undefined, true);
    }
  };

  const handleLoadMoreFolders = () => {
    if (nextFolderPageToken && !isLoadingMoreFolders) {
      setIsLoadingMoreFolders(true);
      loadFolderContents(undefined, nextFolderPageToken, true);
    }
  };

  const loadBreadcrumbs = async () => {
    if (!currentFolderId) {
      setBreadcrumbs([]);
      return;
    }

    try {
      const crumbs = await backendFilesApi.getFolderBreadcrumbs(currentFolderId);
      setBreadcrumbs(crumbs.map(c => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Error loading breadcrumbs:', error);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await backendFilesApi.createFolder({
        name: folderName,
        parentId: currentFolderId,
        cloudProvider: 'google'
      });
      setIsCreateFolderModalOpen(false);
      await loadFolderContents();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleFolderClick = (folderId: string | number) => {
    setCurrentFolderId(folderId);
  };

  const handleBreadcrumbClick = (folderId: string | number | null) => {
    setCurrentFolderId(folderId);
  };

  const handleUploadComplete = () => {
    loadFolderContents();
    setShowUploadZone(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleApplyFilters = (newFilters: any) => {
    if (newFilters.sortBy) setSortBy(newFilters.sortBy);
    if (newFilters.fileTypes) setFilters(newFilters.fileTypes);
    setIsFilterDrawerOpen(false);
  };

  const filteredAndSortedFiles = useCallback(() => {
    let result = [...files];

    // Search
    if (searchTerm) {
      result = result.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.original_filename?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [files, searchTerm, filters, sortBy]);

  const filteredFolders = useCallback(() => {
    if (searchTerm) {
      return folders.filter(folder => folder.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return folders;
  }, [folders, searchTerm]);

  const displayedFiles = filteredAndSortedFiles();
  const displayedFolders = filteredFolders();

  if (isLoading && folders.length === 0 && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <SearchAndFilterBar
            onSearch={handleSearch}
            onFilterSortClick={() => setIsFilterDrawerOpen(true)}
          />
        </div>

        {isCloudConnected && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FolderIcon className="h-4 w-4 mr-2 text-[#dc2626]" />
              Create Folder
            </button>
            <button
              onClick={() => setShowUploadZone(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#dc2626] hover:bg-red-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="hover:text-gray-900 dark:hover:text-white hover:underline"
          >
            Home
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center">
              <span className="mx-2">/</span>
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`hover:text-gray-900 dark:hover:text-white hover:underline ${index === breadcrumbs.length - 1 ? 'font-medium text-gray-900 dark:text-white' : ''
                  }`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>

        {currentFolderId && (
          <button
            onClick={() => {
              const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
              setCurrentFolderId(parentBreadcrumb ? parentBreadcrumb.id : null);
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ← Back
          </button>
        )}
      </div>

      {displayedFolders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Folders</h3>
          <FolderNavigation
            folders={displayedFolders.map(f => ({ id: f.id.toString(), name: f.name }))}
            onFolderClick={handleFolderClick}
            onDeleteFolder={async (id) => {
              try {
                await backendFilesApi.deleteFolder(id);
                await loadFolderContents();
              } catch (error) {
                console.error('Error deleting folder:', error);
              }
            }}
            onCreateSubfolder={(parentId) => {
              // Add create subfolder functionality if needed
              console.log('Create subfolder in:', parentId);
            }}
            onUploadToFolder={async (folderId) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.onchange = async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  for (const file of Array.from(files)) {
                    try {
                      await backendFilesApi.uploadFile(file, folderId);
                    } catch (error) {
                      console.error('Error uploading file:', error);
                    }
                  }
                  await loadFolderContents();
                }
              };
              input.click();
            }}
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
        </div>
      )}

      {displayedFiles.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Files</h3>
          <FileGrid
            files={displayedFiles.map(f => ({
              id: f.id as any,
              name: f.filename,
              type: f.mime_type ? f.mime_type.split('/')[1] || 'file' : 'file',
              pages: 1,
              thumbnail: f.file_path || '',
              mime_type: f.mime_type || '',
              file_size: f.file_size || 0,
              filename: f.filename,
              file_path: f.file_path,
              created_at: f.created_at
            }))}
            onDeleteFile={async (id) => {
              try {
                await backendFilesApi.deleteFile(id);
                await loadFolderContents();
              } catch (error) {
                console.error('Error deleting file:', error);
              }
            }}
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
        </div>
      ) : !isLoading && folders.length === 0 && (
        <div className="text-center py-12">
          {isCloudConnected ? (
            <>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderIcon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload your first file or create a folder to get started
              </p>
              <button
                onClick={() => setShowUploadZone(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudOff className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cloud Not Connected</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please connect to cloud storage to access your files
              </p>
            </>
          )}
        </div>
      )}
      {/* 
      {isCloudConnected && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Storage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unlimited Storage Available</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Unlimited
              </span>
            </div>
          </div>
        </div>
      )} */}

      {isCloudConnected && (
        <>
          <CreateFolderModal
            isOpen={isCreateFolderModalOpen}
            onClose={() => setIsCreateFolderModalOpen(false)}
            onCreate={handleCreateFolder}
          />

          <FilterSortDrawer
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            onApply={handleApplyFilters}
          />

          {showUploadZone && (
            <FileUploadZone
              folderId={currentFolderId}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploadZone(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
