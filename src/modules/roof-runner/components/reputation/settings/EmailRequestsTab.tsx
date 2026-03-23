import React, { useState } from 'react';
import { Settings, Plus, MoreHorizontal } from 'lucide-react';

const EmailRequestsTab: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTemplateTab, setActiveTemplateTab] = useState('recurring');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Email Review Requests</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Engage your audience with a personalized touch.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <div className={`space-y-6 ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When to send Email after check-in?
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white">
              <option>Immediately</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Until clicked, repeat this every
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white">
              <option>Don't Repeat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum retries
            </label>
            <input
              type="number"
              value="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Choose email templates for your email requests
            </h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors">
                <Settings size={16} />
                Set Email Templates
              </button>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} />
                Create New
              </button>
            </div>
          </div>

          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTemplateTab('recurring')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTemplateTab === 'recurring'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Recurring Emails
            </button>
            <button
              onClick={() => setActiveTemplateTab('draft')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTemplateTab === 'draft'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Draft Emails
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-1 bg-green-500 rounded mb-1"></div>
                  <div className="space-y-1">
                    <div className="w-6 h-0.5 bg-gray-300 rounded"></div>
                    <div className="w-8 h-0.5 bg-gray-300 rounded"></div>
                    <div className="w-4 h-0.5 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">New Template</h5>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Live
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Subject:</span> Would you recommend us?
                </p>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailRequestsTab;