import { Folder, Upload } from 'lucide-react';

interface FileManagerHeaderProps {
  onCreateFolder: () => void;
}

export default function FileManagerHeader({ onCreateFolder }: FileManagerHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">File Manager</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateFolder}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Folder className="h-4 w-4 mr-2 text-[#dc2626]" />
            Create a folder
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#dc2626] hover:bg-red-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload files
          </button>
        </div>
      </div>
    </header>
  );
}