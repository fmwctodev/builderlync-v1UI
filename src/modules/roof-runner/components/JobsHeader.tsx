import React from 'react';
import { Search, Filter, Grid, List, Settings, Building2 } from 'lucide-react';
import NewButtonDropdown from './NewButtonDropdown';
import { hasPermission } from '../../../shared/utils/permissions';

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
  onNewReport: () => void;
  onNewCustomer: () => void;
  /** Total count from API for the current filter (used in the All Jobs label) */
  totalJobs?: number;
  /** Cumulative counts per stage from the backend */
  jobCounts?: any;
  /** Dynamic stages from the default pipeline */
  pipelineStages?: any[];
  /** List of available pipelines */
  pipelines?: any[];
  /** Currently selected pipeline ID */
  selectedPipelineId?: string;
  /** Handler to change the pipeline */
  setSelectedPipelineId?: (id: string) => void;
}

// Basic global filters that aren't specific to a pipeline stage
const BASE_FILTERS = [
  { value: 'all', label: 'All Jobs' },
  { value: 'active', label: 'Active Jobs' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost Jobs' },
];

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
  onNewJob,
  onNewReport,
  onNewCustomer,
  totalJobs,
  jobCounts,
  pipelineStages = [],
  pipelines = [],
  selectedPipelineId = 'all',
  setSelectedPipelineId
}) => {
  const getCountForFilter = (value: string) => {
    if (!jobCounts) return null;
    if (value === 'all') return jobCounts.all;
    if (value === 'active') return jobCounts.active;
    if (value === 'completed') return jobCounts.completed;
    if (value === 'lost') return jobCounts.lost;

    // Use the raw value (stage name) for dynamic filters
    return jobCounts[value] !== undefined ? jobCounts[value] : null;
  };

  // 1. Start with the standard base filters (All, Active, Completed, Lost)
  const allFiltersList = [...BASE_FILTERS];

  // 2. Add stages from the current (or default) pipeline
  pipelineStages.forEach(s => {
    allFiltersList.push({ value: s.name, label: s.name });
  });

  // 3. In "All Workflows" view, also add any extra stages found in jobCounts
  if (selectedPipelineId === 'all' && jobCounts) {
    const excludedKeys = ['all', 'active', 'completed', 'lost'];
    Object.keys(jobCounts).forEach(key => {
      if (!excludedKeys.includes(key) && jobCounts[key] > 0) {
        allFiltersList.push({ value: key, label: key });
      }
    });
  }

  // 4. Strict De-duplication: Ensure each stage name appears only ONCE
  // This prevents duplicates if multiple pipelines use the same stage names.
  const uniqueFiltersMap = new Map();
  allFiltersList.forEach(f => {
    if (!uniqueFiltersMap.has(f.value)) {
      uniqueFiltersMap.set(f.value, f);
    }
  });

  const dynamicFilters = Array.from(uniqueFiltersMap.values());
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          {totalJobs !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
              {totalJobs.toLocaleString()} total
            </span>
          )}
        </div>
        <NewButtonDropdown
          onNewJob={onNewJob}
          onNewReport={onNewReport}
          onNewCustomer={onNewCustomer}
        />
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
            <option value="multifamily">Multifamily</option>
            <option value="insurance">Insurance</option>
          </select>
          <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Pipeline Selector */}
        <div className="relative">
          <select
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId?.(e.target.value)}
            className="input min-w-[180px] pr-8 appearance-none cursor-pointer"
          >
            <option value="all">All Workflows</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Settings className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <button
          onClick={() => setActiveView('board')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${activeView === 'board'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <Grid className="w-4 h-4" />
          <span>Board View</span>
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${activeView === 'list'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <List className="w-4 h-4" />
          <span>List View</span>
        </button>
        {(hasPermission('jobs', 'manage') || hasPermission('projects', 'manage')) && (
          <button
            onClick={() => setActiveView('settings')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${activeView === 'settings'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="w-96 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address, contact name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>

        {/* Stage filter dropdown — labels come from API, no stale counts */}
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="input min-w-[200px]"
        >
          {dynamicFilters.map(f => {
            const count = getCountForFilter(f.value);
            return (
              <option key={f.value} value={f.value}>
                {f.label}{count !== null ? ` (${count})` : ''}
              </option>
            );
          })}
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