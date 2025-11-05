import React from 'react';
import { ExternalLink } from 'lucide-react';

const IntegrationsTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Integrations</h2>
      </div>
      
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">CC</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">CompanyCam</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Job last synced from CompanyCam on Nov. 5, 2025.
                </p>
              </div>
            </div>
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <span>View project</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;