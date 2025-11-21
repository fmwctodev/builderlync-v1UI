import React, { useState } from 'react';
import { RefreshCw, Plus, Copy } from 'lucide-react';

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            <Copy size={16} />
            <span>Clone</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
            <Plus size={16} />
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Jobs Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Jobs</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">23</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active jobs</p>
        </div>

        {/* Revenue Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$12,450</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
        </div>

        {/* Opportunities Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Opportunities</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$45,230</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline value</p>
        </div>

        {/* Contacts Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contacts</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">1,247</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total contacts</p>
        </div>

        {/* Customer Acquisition Cost */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Acquisition Cost</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$333</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Per closed job</p>
        </div>

        {/* Average Job Cost */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average Job Cost</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">$8,750</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
        </div>

        {/* Lead Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lead Conversion</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">18.5%</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Leads to jobs</p>
        </div>

        {/* Custom Marketing Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marketing ROI</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">4.2x</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Return on ad spend</p>
        </div>
      </div>

      {/* User-Specific Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Recent Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your recent actions</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-error-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">You created a new job</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Roof repair for Johnson residence</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-success-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">You updated payment status</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">$2,500 from Smith Construction</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-primary-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">You added a new contact</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mike Wilson - Homeowner</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Upcoming Tasks</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasks assigned to you</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Follow up with ABC Roofing</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Send proposal to Johnson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule site visit</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due in 2 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}