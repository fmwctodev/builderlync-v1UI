import { useState, useEffect } from 'react';
import { Grid3X3, List, Upload, Plus } from 'lucide-react';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import {
  EMBEDDED_PIPELINE_TYPES,
  EMBEDDED_PIPELINE_COLORS,
  EMBEDDED_PIPELINE_ICONS,
} from '../../constants/embeddedPipelines';
import type { JobType } from '../../types/opportunities';

interface OpportunitiesHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedJobType: JobType;
  setSelectedJobType: (type: JobType) => void;
  onAddOpportunity: () => void;
  activeView?: 'opportunities' | 'pipelines';
  onViewChange?: (view: 'opportunities' | 'pipelines') => void;
  onAddPipeline?: () => void;
}

export default function OpportunitiesHeader({
  activeTab,
  setActiveTab,
  selectedJobType,
  setSelectedJobType,
  onAddOpportunity,
  activeView = 'opportunities',
  onViewChange,
  onAddPipeline,
}: OpportunitiesHeaderProps) {
  const [opportunityCounts, setOpportunityCounts] = useState<Record<JobType, number>>({
    Residential: 0,
    Commercial: 0,
    Insurance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunityCounts();
  }, []);

  const loadOpportunityCounts = async () => {
    try {
      setLoading(true);
      const counts = await opportunitiesApi.getOpportunityCountsByAllJobTypes();
      setOpportunityCounts(counts);
    } catch (error) {
      console.error('Error loading opportunity counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = Object.values(opportunityCounts).reduce((sum, count) => sum + count, 0);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-6">
        {onViewChange && (
          <div className="flex items-center gap-4 pt-3">
            <button
              onClick={() => onViewChange('opportunities')}
              className={`px-6 py-3 font-medium transition-all ${
                activeView === 'opportunities'
                  ? 'bg-primary-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => onViewChange('pipelines')}
              className={`px-6 py-3 font-medium transition-all ${
                activeView === 'pipelines'
                  ? 'bg-primary-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
              }`}
            >
              Pipelines
            </button>
          </div>
        )}

        {activeView === 'opportunities' && (
          <>
            <div className="py-3">
              {onViewChange && <div className="border-b border-gray-200 dark:border-gray-700 mb-3"></div>}
            </div>

            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center space-x-4">
                {EMBEDDED_PIPELINE_TYPES.map((type) => {
                  const Icon = EMBEDDED_PIPELINE_ICONS[type];
                  const count = opportunityCounts[type];
                  const color = EMBEDDED_PIPELINE_COLORS[type];

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedJobType(type)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedJobType === type
                          ? 'border-current shadow-md'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={
                        selectedJobType === type
                          ? {
                              borderColor: color,
                              backgroundColor: `${color}15`,
                              color: color,
                            }
                          : {}
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{type}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          selectedJobType === type
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        style={
                          selectedJobType === type
                            ? { color: color }
                            : {}
                        }
                      >
                        {loading ? '...' : count}
                      </span>
                    </button>
                  );
                })}

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-1 flex space-x-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                      activeTab === 'all'
                        ? 'bg-[#dc2626] text-white shadow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" /> All
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                      activeTab === 'list'
                        ? 'bg-[#dc2626] text-white shadow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4 mr-1" /> List
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <List className="h-5 w-5" />
                </button>
                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <Upload className="h-4 w-4 mr-2" /> Import
                </button>

                <button
                  onClick={onAddOpportunity}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#dc2626] hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </button>
              </div>
            </div>
          </>
        )}

        {activeView === 'pipelines' && onAddPipeline && (
          <div className="py-4 flex items-center justify-end">
            <button
              onClick={onAddPipeline}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
