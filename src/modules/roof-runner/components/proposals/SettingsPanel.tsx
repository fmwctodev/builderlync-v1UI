import React from 'react';

export default function SettingsPanel() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Supplier</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900 dark:text-white">Enable preferred suppliers on future proposals for your team</div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Automatically select your preferred supplier to use their costs instead of unit costs
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No preferred suppliers have been selected. <button className="text-primary-600 hover:text-primary-700">Click here to update your preferences.</button>
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company representative signatures</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900 dark:text-white">Enable on future proposals for your team</div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Proposals will automatically include the job assignee's signature on the authorization page
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your signature</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your full name
            </label>
            <input
              type="text"
              defaultValue="Vijender Singh"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Below is how your signature will appear on documents to customers
            </p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-4">
              <div className="text-lg font-script text-gray-900 dark:text-white mb-1">Vijender Singh</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vijender Singh</div>
            </div>
          </div>

          <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}