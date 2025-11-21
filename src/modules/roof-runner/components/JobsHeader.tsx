import React from 'react';
import { Search, Filter, Plus, Grid, List, Settings, Building2 } from 'lucide-react';

interface JobsHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedJobType: string;
  setSelectedJobType: (type: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  selectedJobType,
  setSelectedJobType,
  showFilters,
  setShowFilters,
  onNewJob
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
        <button
          onClick={onNewJob}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Job</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 mb-4">
        {/* Job Type Dropdown */}
        <div className="relative">
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="input min-w-[180px] pr-8 appearance-none cursor-pointer"
          >
            <option value="all">All Jobs</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <button
          onClick={() => setActiveView('board')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            activeView === 'board'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Board View</span>
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            activeView === 'list'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          <span>List View</span>
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            activeView === 'settings'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="w-96 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="input min-w-[200px]"
        >
          <option value="default">Default</option>
          <option value="awaiting">Awaiting Adjuster Inspection</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
};

export default JobsHeader;