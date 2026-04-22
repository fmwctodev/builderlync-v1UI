import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStaff, StaffMember } from '../../../shared/store/services/staffApi';

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
  pipelineStages?: any[];
}

export interface AdvancedFilters {
  sortBy: string;
  assignees: number[];
  stages: string[];
  updatedDate: string[];
  closeDate: string[];
  createdDate: string[];
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onFiltersChange, 
  currentFilters,
  pipelineStages = []
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(currentFilters);
  
  const stages = pipelineStages.map(s => s.name);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const updateFilters = (key: keyof AdvancedFilters, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string | number) => {
    const currentArray = localFilters[key] as (string | number)[];
    const updated = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, updated);
  };

  const selectAllArrayFilter = (key: keyof AdvancedFilters, allValues: (string | number)[]) => {
    updateFilters(key, allValues);
  };

  const selectNoneArrayFilter = (key: keyof AdvancedFilters) => {
    updateFilters(key, []);
  };

  const setSingleChoiceFilter = (key: keyof AdvancedFilters, value: string) => {
    updateFilters(key, [value]);
  };


  const sortOptions = [
    'Last updated (newest)', 'Last updated (oldest)', 'Created date (newest)',
    'Created date (oldest)', 'Close date (newest)', 'Close date (oldest)',
    'Address (alphabetical)', 'Value (higher)', 'Value (lower)',
    'Time in stage (newest)', 'Time in stage (oldest)'
  ];

  const dateRanges = [
    'Today', 'Last 7 days', 'Last 4 weeks', 'Last 3 months',
    'Last 6 months', 'Last 12 months', 'Month to date',
    'Quarter to date', 'Year to date'
  ];

  const closeDateRanges = [
    'Last 7 days', 'Last 4 weeks', 'Last 3 months', 'Last 6 months',
    'Last 12 months', 'Month to date', 'Quarter to date', 'Year to date'
  ];

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Filters */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected filters</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">None</p>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
          <div className="space-y-2">
            {sortOptions.map(option => (
              <label key={option} className="flex items-center">
                <input 
                  type="radio" 
                  name="sort" 
                  className="mr-2" 
                  checked={localFilters.sortBy === option}
                  onChange={() => updateFilters('sortBy', option)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignees & Job Owner */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assignees & Job owner</h4>
          <div className="flex space-x-2 mb-3">
            <button 
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => selectAllArrayFilter('assignees', staff.map(s => s.id))}
            >
              Select all
            </button>
            <button 
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => selectNoneArrayFilter('assignees')}
            >
              Select none
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {staff.map(member => (
              <label key={member.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={localFilters.assignees.includes(member.id)}
                  onChange={() => toggleArrayFilter('assignees', Number(member.id))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {member.first_name} {member.last_name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Stages */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Stages</h4>
          <div className="flex space-x-2 mb-3">
            <button 
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => selectAllArrayFilter('stages', stages)}
            >
              Select all
            </button>
            <button 
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => selectNoneArrayFilter('stages')}
            >
              Select none
            </button>
          </div>
          <div className="space-y-2">
            {stages.map(stage => (
              <label key={stage} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={localFilters.stages.includes(stage)}
                  onChange={() => toggleArrayFilter('stages', stage)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Updated Date */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated date</h4>
            {localFilters.updatedDate.length > 0 && (
              <button 
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                onClick={() => selectNoneArrayFilter('updatedDate')}
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {dateRanges.map(option => (
              <label key={option} className="flex items-center">
                <input 
                  type="radio" 
                  name="updatedDate"
                  className="mr-2" 
                  checked={localFilters.updatedDate.includes(option)}
                  onChange={() => setSingleChoiceFilter('updatedDate', option)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Created Date */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Created date</h4>
            {localFilters.createdDate.length > 0 && (
              <button 
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                onClick={() => selectNoneArrayFilter('createdDate')}
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {dateRanges.map(option => (
              <label key={option} className="flex items-center">
                <input 
                  type="radio" 
                  name="createdDate"
                  className="mr-2" 
                  checked={localFilters.createdDate.includes(option)}
                  onChange={() => setSingleChoiceFilter('createdDate', option)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Close Date */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Close date</h4>
            {localFilters.closeDate.length > 0 && (
              <button 
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                onClick={() => selectNoneArrayFilter('closeDate')}
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {closeDateRanges.map(option => (
              <label key={option} className="flex items-center">
                <input 
                  type="radio" 
                  name="closeDate"
                  className="mr-2" 
                  checked={localFilters.closeDate.includes(option)}
                  onChange={() => setSingleChoiceFilter('closeDate', option)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Lead Sources - REMOVED */}
      </div>
    </div>
  );
};

export default FiltersSidebar;