import { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, Search, X } from 'lucide-react';
import { getAllActiveStaff, StaffMember } from '../../../../shared/store/services/staffApi';

interface FiltersAndSortProps {
  onFiltersChange?: (filters: OpportunityFilters) => void;
  onSearchChange?: (search: string) => void;
  selectedPipelineId?: string | null;
}

export interface OpportunityFilters {
  status?: 'open' | 'won' | 'lost';
  owner_id?: string;
  stage_id?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

export default function FiltersAndSort({ 
  onFiltersChange, 
  onSearchChange,
  selectedPipelineId 
}: FiltersAndSortProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Dropdown data
  const [stages, setStages] = useState<Stage[]>([]);
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch stages when pipeline changes
  useEffect(() => {
    if (selectedPipelineId && selectedPipelineId !== 'default') {
      fetchStages(selectedPipelineId);
    } else {
      setStages([]);
    }
  }, [selectedPipelineId]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(v => v !== undefined && v !== '').length;
    setActiveFiltersCount(count);
  }, [filters]);

  const fetchStages = async (pipelineId: string) => {
    try {
      setLoadingStages(true);
      const { getAuthToken } = await import('../../../../shared/utils/auth');
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/pipelines/${pipelineId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setStages(result.data?.stages || []);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    } finally {
      setLoadingStages(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const staffList = await getAllActiveStaff();
      setUsers(staffList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFilterChange = (key: keyof OpportunityFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const getSelectedStageName = () => {
    if (!filters.stage_id) return null;
    const stage = stages.find(s => s.id === filters.stage_id);
    return stage?.name;
  };

  const getSelectedOwnerName = () => {
    if (!filters.owner_id || !Array.isArray(users)) return null;
    const user = users.find(u => u.id === filters.owner_id);
    return user ? `${user.first_name} ${user.last_name}` : null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      {/* Main Filter Bar */}
      <div className="p-4 flex items-center justify-between">
        {/* Left section: Filters */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200 ml-2">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 ml-2 text-gray-400 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Right section: Search */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-64 rounded-md border-gray-300 dark:border-gray-600 pl-10 pr-10 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-[#dc2626] focus:ring-[#dc2626]"
              placeholder="Search opportunities..."
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-[#dc2626] focus:ring-[#dc2626]"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stage
              </label>
              <select
                value={filters.stage_id || ''}
                onChange={(e) => handleFilterChange('stage_id', e.target.value)}
                disabled={loadingStages || stages.length === 0}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-[#dc2626] focus:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              {stages.length === 0 && !loadingStages && (
                <p className="mt-1 text-xs text-gray-500">Select a pipeline first</p>
              )}
            </div>

            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner
              </label>
              <select
                value={filters.owner_id || ''}
                onChange={(e) => handleFilterChange('owner_id', e.target.value)}
                disabled={loadingUsers || !Array.isArray(users) || users.length === 0}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-[#dc2626] focus:ring-[#dc2626] disabled:opacity-50"
              >
                <option value="">All Owners</option>
                {Array.isArray(users) && users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {filters.status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Status: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.stage_id && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Stage: {getSelectedStageName()}
                  <button
                    onClick={() => handleFilterChange('stage_id', '')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.owner_id && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Owner: {getSelectedOwnerName()}
                  <button
                    onClick={() => handleFilterChange('owner_id', '')}
                    className="ml-1 hover:text-green-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
