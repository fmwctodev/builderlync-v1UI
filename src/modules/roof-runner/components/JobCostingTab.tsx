import React, { useState } from 'react';
import { EyeOff } from 'lucide-react';

const JobCostingTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('Projected');

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job costing</h2>
          <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm">
            <EyeOff className="w-4 h-4" />
            <span>Hide</span>
          </button>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Projected</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Job cost projections are automatically generated based on won proposals.
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View proposals
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actuals</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When the job is complete, enter the actual costs
            </p>
            <button className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
              Actual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCostingTab;