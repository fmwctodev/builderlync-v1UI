import { Folder, MoreHorizontal } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
}

interface FolderNavigationProps {
  folders: Folder[];
  onFolderClick?: (folderId: string) => void;
}

export default function FolderNavigation({ folders, onFolderClick }: FolderNavigationProps) {
  return (
    <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => onFolderClick?.(folder.id)}
          className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <Folder className="h-5 w-5 text-[#dc2626] mr-2" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{folder.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}