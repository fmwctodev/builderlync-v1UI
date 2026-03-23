import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormsBuildTab } from './FormsBuildTab';
import { FormsAnalyzeTab } from './FormsAnalyzeTab';
import { FormsSubmissionsTab } from './FormsSubmissionsTab';

type TabType = 'build' | 'analyze' | 'submissions';

export const Forms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') as TabType;
  const activeTab: TabType = tabFromUrl && ['build', 'analyze', 'submissions'].includes(tabFromUrl)
    ? tabFromUrl
    : 'build';

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => handleTabChange('build')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'build'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Build
          </button>
          <button
            onClick={() => handleTabChange('analyze')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analyze'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => handleTabChange('submissions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Submissions
          </button>
        </nav>
      </div>

      <div className="py-6">
        {activeTab === 'build' && <FormsBuildTab />}
        {activeTab === 'analyze' && <FormsAnalyzeTab />}
        {activeTab === 'submissions' && <FormsSubmissionsTab />}
      </div>
    </div>
  );
};
