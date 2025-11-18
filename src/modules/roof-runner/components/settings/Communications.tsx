import React from 'react';
import { Plus } from 'lucide-react';

const Communications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Communications</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure email, SMS, and voice settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Twilio Integration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account SID</label>
              <input
                type="text"
                placeholder="Enter Twilio Account SID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auth Token</label>
              <input
                type="password"
                placeholder="Enter Auth Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Save Twilio Settings
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phone Numbers</h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">Manage your Twilio phone numbers</p>
          <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <Plus size={16} />
            <span>Buy Number</span>
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">(555) 123-4567</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;