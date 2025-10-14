import { Search, Filter } from 'lucide-react';

interface SearchAndFilterBarProps {
  onFilterSortClick: () => void;
}

export default function SearchAndFilterBar({ onFilterSortClick }: SearchAndFilterBarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="relative w-96">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#dc2626] focus:ring-[#dc2626]"
          placeholder="Search files..."
        />
      </div>

      <button
        onClick={onFilterSortClick}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
        Filter & sort
      </button>
    </div>
  );
}