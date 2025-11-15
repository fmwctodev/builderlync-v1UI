import React from 'react';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';

const TasksTab: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task</h2>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Hide completed</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {/* Task Item */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-grab" />
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex-1">
              <span className="text-gray-900 dark:text-white">Prepare to Generate CompanyCam photos</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-primary-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Task Section */}
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">What needs to get done?</span>
            <button className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" />
              <span>Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;