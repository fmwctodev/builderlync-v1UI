import { useState, useEffect, useCallback } from 'react';
import { Upload, Folder as FolderIcon, Search, Filter } from 'lucide-react';
import { backendFilesApi, FileRecord, FolderRecord } from '../../../../shared/services/backendFilesApi';
import FolderNavigation from './FolderNavigation';
import FileGrid from './FileGrid';
import CreateFolderModal from './CreateFolderModal';
import FileUploadZone from './FileUploadZone';
import SearchAndFilterBar from './SearchAndFilterBar';
import FilterSortDrawer from './FilterSortDrawer';

export default function LocalFilesTab() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: number, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(false);

  useEffect(() => {
    loadFolderContents();
    if (currentFolderId) {
      loadBreadcrumbs();
    } else {
      setBreadcrumbs([]);
    }
  }, [currentFolderId]);

  const loadFolderContents = async () => {
    try {
      setIsLoading(true);
      console.log('Loading folder contents for currentFolderId:', currentFolderId);
      const { folders: loadedFolders, files: loadedFiles } = await backendFilesApi.getFolderContents(currentFolderId);
      console.log('Loaded folders:', loadedFolders);
      console.log('Loaded files:', loadedFiles);
      setFolders(loadedFolders);
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading folder contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBreadcrumbs = async () => {
    if (!currentFolderId) return;

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

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleUploadComplete = () => {
    loadFolderContents();
    setShowUploadZone(false);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await backendFilesApi.searchFiles(term);
        setFiles(results);
        setFolders([]);
      } catch (error) {
        console.error('Error searching files:', error);
      }
    } else {
      loadFolderContents();
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters);
    setIsFilterDrawerOpen(false);
  };

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
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => handleBreadcrumbClick(null)}
            className="hover:text-gray-900 dark:hover:text-white hover:underline"
          >
            Home
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center">
              <span className="mx-2">/</span>
              <button
                onClick={() => handleBreadcrumbClick(crumb.id)}
                className={`hover:text-gray-900 dark:hover:text-white hover:underline ${
                  index === breadcrumbs.length - 1 ? 'font-medium text-gray-900 dark:text-white' : ''
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
              handleBreadcrumbClick(parentBreadcrumb ? parentBreadcrumb.id : null);
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ← Back
          </button>
        )}
      </div>

      {folders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Folders</h3>
          <FolderNavigation
            folders={folders.map(f => ({ id: f.id.toString(), name: f.name }))}
            onFolderClick={(id) => handleFolderClick(parseInt(id))}
            onDeleteFolder={async (id) => {
              try {
                await backendFilesApi.deleteFolder(parseInt(id));
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
                      await backendFilesApi.uploadFile(file, parseInt(folderId));
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
        </div>
      )}

      {files.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Files</h3>
          <FileGrid
            files={files.map(f => ({
              id: f.id,
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
        </div>
      ) : !isLoading && folders.length === 0 && (
        <div className="text-center py-12">
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
        </div>
      )}

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
    </div>
  );
}
