import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, ArrowUpDown, Search, List } from 'lucide-react';

export default function FiltersAndSort() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 flex items-center justify-between">
      {/* Left section: Filters & Sort */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          Advanced Filters
          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200 ml-2">
            1
          </span>
          <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
        </button>

        <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          Sort
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-600 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 ml-2">
            1
          </span>
        </button>
      </div>

      {/* Right section: Search & Manage Fields */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#dc2626] focus:ring-[#dc2626]"
            placeholder="Search Opportunities"
          />
        </div>

        <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <List className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          Manage Fields
        </button>
      </div>
    </div>
  );
}