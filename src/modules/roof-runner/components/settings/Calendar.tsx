import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calendar Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect and manage calendar integrations</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar Connections</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Google Calendar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">john@builderlync.com</p>
              </div>
            </div>
            <button className="text-red-600 hover:underline dark:text-red-400">Disconnect</button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Outlook Calendar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Not connected</p>
              </div>
            </div>
            <button className="text-primary-600 hover:underline dark:text-primary-400">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;