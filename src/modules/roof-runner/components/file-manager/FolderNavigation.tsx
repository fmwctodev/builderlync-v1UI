import { useState, useEffect, useRef } from 'react';
import { Folder, MoreHorizontal, Trash2, FolderPlus, Upload } from 'lucide-react';
import { FolderItem } from '../../../../shared/services/fileManagerApi';

interface FolderNavigationProps {
  folders: FolderItem[];
  onFolderClick: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onCreateSubfolder?: (parentId: string) => void;
  onUploadToFolder?: (folderId: string) => void;
}

export default function FolderNavigation({ 
  folders, 
  onFolderClick, 
  onDeleteFolder,
  onCreateSubfolder,
  onUploadToFolder
}: FolderNavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number}>({top: 0, left: 0});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{[key: string]: HTMLButtonElement}>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  const handleDropdownToggle = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeDropdown === folderId) {
      setActiveDropdown(null);
    } else {
      const button = buttonRefs.current[folderId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.right - 192 + window.scrollX // 192px = w-48
        });
      }
      setActiveDropdown(folderId);
    }
  };

  const handleAction = (action: string, folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'delete':
        if (confirm('Are you sure you want to delete this folder?')) {
          onDeleteFolder(folderId);
        }
        break;
      case 'subfolder':
        onCreateSubfolder?.(folderId);
        break;
      case 'upload':
        onUploadToFolder?.(folderId);
        break;
    }
  };

  return (
    <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="relative flex-shrink-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onFolderClick(folder.id)}
        >
          <div className="flex items-center">
            <Folder className="h-5 w-5 text-[#dc2626] mr-2" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{folder.name}</span>
          </div>
          
          <button 
            ref={(el) => {
              if (el) buttonRefs.current[folder.id] = el;
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => handleDropdownToggle(folder.id, e)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>


        </div>
      ))}
      
      {/* Fixed positioned dropdown */}
      {activeDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          <div className="py-1">
            <button
              onClick={(e) => handleAction('subfolder', activeDropdown, e)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Create Subfolder
            </button>
            <button
              onClick={(e) => handleAction('upload', activeDropdown, e)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload to Folder
            </button>
            <button
              onClick={(e) => handleAction('delete', activeDropdown, e)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}