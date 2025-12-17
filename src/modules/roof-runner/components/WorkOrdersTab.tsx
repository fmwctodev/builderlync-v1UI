import React from 'react';
import { Plus } from 'lucide-react';

const WorkOrdersTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Work orders</h2>
          <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
            <Plus className="w-4 h-4" />
            <span>Work order</span>
          </button>
        </div>
      </div>
      <div className="flex-1 p-6">
        {/* Work orders content will go here */}
      </div>
    </div>
  );
};

export default WorkOrdersTab;