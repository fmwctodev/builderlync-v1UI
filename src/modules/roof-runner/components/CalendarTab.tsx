import React from 'react';
import { Plus, ExternalLink } from 'lucide-react';

const CalendarTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <ExternalLink className="w-4 h-4" />
              <span>View calendar</span>
            </button>
            <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
              <Plus className="w-4 h-4" />
              <span>Event</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        {/* Calendar content will go here */}
      </div>
    </div>
  );
};

export default CalendarTab;