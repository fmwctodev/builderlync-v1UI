import { Calendar } from 'lucide-react';

export function ConversationAI() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 dark:text-gray-400">
          Create And Manage Multiple Agents For Your Business
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dashboard</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Agents List</h4>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">All Channels</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">2025-10-01</span>
                  <span className="text-gray-500 dark:text-gray-400">2025-10-13</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">All Agents</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Unique Contacts</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Actions Triggered</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Appointment Booked</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Saved</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Unique Contacts</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Data for the selected timeframe isn't available.</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Message</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Messages per Contact</div>
              <div className="text-xs text-gray-400 mt-1">Data for the selected timeframe isn't available.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}