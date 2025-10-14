import { useState } from 'react';
import FileManagerHeader from '../components/file-manager/FileManagerHeader';
import SearchAndFilterBar from '../components/file-manager/SearchAndFilterBar';
import FolderNavigation from '../components/file-manager/FolderNavigation';
import FileGrid from '../components/file-manager/FileGrid';
import CreateFolderModal from '../components/file-manager/CreateFolderModal';
import FilterSortDrawer from '../components/file-manager/FilterSortDrawer';

const mockFolders = [
  { id: 'f1', name: 'Proposal Pages' },
  { id: 'f2', name: 'Warranty Info' },
  { id: 'f3', name: 'Shingle Brochures' },
  { id: 'f4', name: 'Completed Projects' },
  { id: 'f5', name: 'Marketing Materials' },
];

const mockFiles = [
  { id: 'file1', name: 'ESTIMATE-000796812923', type: 'pdf', pages: 9, thumbnail: '' },
  { id: 'file2', name: 'IMG_7380', type: 'image', pages: 1, thumbnail: '' },
  { id: 'file3', name: 'IMG_7379', type: 'image', pages: 1, thumbnail: '' },
  { id: 'file4', name: 'IMG_7376', type: 'image', pages: 1, thumbnail: '' },
  { id: 'file5', name: 'IMG_6980', type: 'image', pages: 1, thumbnail: '' },
];

export default function FileManager() {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isFilterSortDrawerOpen, setIsFilterSortDrawerOpen] = useState(false);
  const [folders, setFolders] = useState(mockFolders);
  const [files, setFiles] = useState(mockFiles);

  const handleCreateFolder = (folderName: string) => {
    setFolders([...folders, { id: `f${Date.now()}`, name: folderName }]);
    setIsCreateFolderModalOpen(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    setIsFilterSortDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <FileManagerHeader onCreateFolder={() => setIsCreateFolderModalOpen(true)} />

      <main className="flex-grow p-6">
        <SearchAndFilterBar onFilterSortClick={() => setIsFilterSortDrawerOpen(true)} />
        <FolderNavigation folders={folders} />
        <FileGrid files={files} />
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
    </div>
  );
}