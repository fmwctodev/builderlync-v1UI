import React from 'react';
import { X, Home, Box } from 'lucide-react';

const MeasurementsTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Measurements</h2>
          <div className="flex items-center space-x-4">
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              DIY Report
            </button>
            <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
              <Box className="w-4 h-4" />
              <span>BuilderLync report</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Home className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Forgetting something?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Order a measurement report right here in the job record!
                </p>
                <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg border border-primary-200 dark:border-primary-600">
                  <Box className="w-4 h-4" />
                  <span>Order a BuilderLync Measurement</span>
                </button>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementsTab;