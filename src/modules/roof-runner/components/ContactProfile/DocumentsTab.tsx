import React from 'react';
import { Search, Plus } from 'lucide-react';

interface DocumentsTabProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  onAddDocument: () => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ filter, onFilterChange, onAddDocument }) => {
  const filters = ['All', 'Internal', 'Sent', 'Received'];

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Documents"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
          </div>
          <button 
            onClick={onAddDocument}
            className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {filters.map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => onFilterChange(filterOption)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === filterOption
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-2xl">📁</span>
            <span>Looks like a ghost town! No files here.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsTab;