import React from 'react';
import { Camera, Search, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

const JobCamHeader: React.FC<Props> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  onRefresh,
  actions,
}) => (
  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Camera size={24} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
        {actions}
      </div>
    </div>
    {onSearchChange !== undefined && (
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchValue ?? ''}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    )}
  </div>
);

export default JobCamHeader;
