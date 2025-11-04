import React from 'react';
import { Plus, X } from 'lucide-react';

const JobsSettings: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job settings</h2>
        <p className="text-gray-600 dark:text-gray-400">All your job specific settings are listed below</p>
      </div>

      {/* Workflows & Stages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workflows & stages</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">A job moves through various stages before it is completed. Stages are grouped together inside workflows, which are listed below and can be customized.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🏠</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Default</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>1448 jobs</span>
                  <span>22 stages</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🧰</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Awaiting Adjuster Inspection</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>1 job</span>
                  <span>22 stages</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage</button>
          </div>
        </div>
        
        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create a workflow</span>
        </button>
      </div>

      {/* Lead Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead sources</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Jobs are attributed to various lead sources which can be customized</p>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm border border-gray-200 dark:border-gray-600">Manage sources</button>
      </div>

      {/* Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cards</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Customize the look and layout of your team's job cards</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1 Western Road, Houston, Texas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rebecca Smith</p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
          </div>
          
          {/* Customer Name Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rebecca Smith</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 Western Road, Houston, Texas</p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Customer name</p>
          </div>
        </div>
      </div>

      {/* Default Folders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default folders</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Default folders will automatically appear in every new job to keep your attachments organized. You can add up to 20.</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Claims Documents</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Labor Invoice</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Material Invoices</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New folder</span>
        </button>
      </div>

      {/* Job Costing Access */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job costing access</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">By default job costing is only accessible to managers (and higher roles), to make it available to everyone in your team, please uncheck the box</p>
        
        <label className="flex items-center">
          <input type="checkbox" defaultChecked className="mr-3" />
          <span className="text-gray-900 dark:text-white">Only managers</span>
        </label>
      </div>
    </div>
  );
};

export default JobsSettings;