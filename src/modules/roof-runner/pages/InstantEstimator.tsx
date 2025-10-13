import React, { useState } from 'react';
import { Plus, X, Settings, Edit, Copy, Trash2 } from 'lucide-react';

const InstantEstimator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [estimators] = useState([{ id: '1', name: 'Website' }]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instant Estimator</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instant Estimator</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>All Instant Estimators</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {activeTab === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {estimators.map((estimator) => (
                    <tr key={estimator.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {estimator.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Settings className="w-3 h-3" />
                            <span>Manage</span>
                          </button>
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Edit className="w-3 h-3" />
                            <span>Rename</span>
                          </button>
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
                          </button>
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"> Project Showcase</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To set up the  Project Showcase we need the data showcase ID from . Please see our set up guide to see where to find this ID in .
            </p>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">How to use</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data showcase ID
                </label>
                <input
                  type="text"
                  placeholder="Enter data showcase ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors">
                  Save
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Instant Estimator</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose a name that describes how this estimator will be used (e.g., "Website homepage" or "Direct mailer")
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter estimator name"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle create logic here
                    setShowModal(false);
                    setName('');
                  }}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantEstimator;