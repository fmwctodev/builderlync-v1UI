import React, { useState } from 'react';
import { RefreshCw, Plus, Share2, Copy, Settings } from 'lucide-react';

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
          <nav className="text-sm text-gray-500 mb-2">
            <span>Home</span> / <span className="text-gray-900">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Copy size={16} />
            <span>Clone</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Settings size={16} />
            <span>Webhooks</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
            <Plus size={16} />
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contacts Widget */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">1,247</div>
          <p className="text-sm text-gray-500">Total contacts</p>
        </div>

        {/* Opportunities Widget */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Opportunities</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">$45,230</div>
          <p className="text-sm text-gray-500">Pipeline value</p>
        </div>

        {/* Jobs Widget */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">23</div>
          <p className="text-sm text-gray-500">Active jobs</p>
        </div>

        {/* Revenue Widget */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">$12,450</div>
          <p className="text-sm text-gray-500">This month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New job created</p>
                  <p className="text-sm text-gray-500">Roof repair for Johnson residence</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-sm text-gray-500">$2,500 from Smith Construction</p>
                  <p className="text-xs text-gray-400">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New contact added</p>
                  <p className="text-sm text-gray-500">Mike Wilson - Homeowner</p>
                  <p className="text-xs text-gray-400">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Follow up with ABC Roofing</p>
                  <p className="text-xs text-gray-500">Due today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Send proposal to Johnson</p>
                  <p className="text-xs text-gray-500">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule site visit</p>
                  <p className="text-xs text-gray-500">Due in 2 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}