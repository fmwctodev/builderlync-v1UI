import { useState, useEffect } from 'react';
import { Grid3X3, List, Upload, Plus, Building2, Settings } from 'lucide-react';
import { pipelinesApi } from '../../services/pipelinesApi';
import type { PipelineWithStages } from '../../types/opportunities';

interface OpportunitiesHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPipelineId?: string | null;
  setSelectedPipelineId?: (id: string | null) => void;
  onAddOpportunity: () => void;
  activeView?: 'opportunities' | 'pipelines';
  onViewChange?: (view: 'opportunities' | 'pipelines') => void;
  onAddPipeline?: () => void;
  internalView?: 'board' | 'list' | 'settings';
  onInternalViewChange?: (view: 'board' | 'list' | 'settings') => void;
}

export default function OpportunitiesHeader({
  selectedPipelineId,
  setSelectedPipelineId,
  onAddOpportunity,
  activeView = 'opportunities',
  onViewChange,
  onAddPipeline,
  internalView = 'board',
  onInternalViewChange,
}: OpportunitiesHeaderProps) {
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const data = await pipelinesApi.getPipelines();
      setPipelines(data);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
  };

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
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <select
                      value={selectedPipelineId || ''}
                      onChange={(e) => setSelectedPipelineId?.(e.target.value || null)}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 cursor-pointer min-w-[200px]"
                    >
                      <option value="">Select Pipeline</option>
                      {pipelines.map((pipeline) => (
                        <option key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-1 flex space-x-1">
                  <button
                    onClick={() => onInternalViewChange?.('board')}
                    className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                      internalView === 'board'
                        ? 'bg-[#dc2626] text-white shadow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" /> Board View
                  </button>
                  <button
                    onClick={() => onInternalViewChange?.('list')}
                    className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                      internalView === 'list'
                        ? 'bg-[#dc2626] text-white shadow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4 mr-1" /> List View
                  </button>
                  <button
                    onClick={() => onInternalViewChange?.('settings')}
                    className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                      internalView === 'settings'
                        ? 'bg-[#dc2626] text-white shadow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-1" /> Settings
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
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
