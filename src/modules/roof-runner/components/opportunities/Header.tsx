import { ChevronDown, Grid3X3, List, Upload, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddOpportunity: () => void;
  activeView?: 'opportunities' | 'pipelines';
  onViewChange?: (view: 'opportunities' | 'pipelines') => void;
  onAddPipeline?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onAddOpportunity,
  activeView = 'opportunities',
  onViewChange,
  onAddPipeline
}: HeaderProps) {

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-6">
        {/* Top Navigation Tabs */}
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

        <div className="py-3">{onViewChange && <div className="border-b border-gray-200 dark:border-gray-700 mb-3"></div>}</div>

        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
          {/* Project/Account Selector */}
          <div className="relative inline-block text-left">
            <button className="inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
              001a.Commercial Leads
              <ChevronDown className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Opportunities Count */}
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200">
            92 opportunities
          </span>

          {/* View Tabs */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-md p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                activeTab === 'all' ? 'bg-[#dc2626] text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" /> All
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                activeTab === 'list' ? 'bg-[#dc2626] text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List className="h-4 w-4 mr-1" /> List
            </button>
          </div>
        </div>

        {/* Right Section */}
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

          {activeView === 'opportunities' ? (
            <button
              onClick={onAddOpportunity}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#dc2626] hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add opportunity
            </button>
          ) : (
            <button
              onClick={onAddPipeline}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </button>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}