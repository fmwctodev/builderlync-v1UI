import React from 'react';
import { FolderPlus, Upload, Search, ChevronDown, MoreHorizontal, Folder, ArrowUp } from 'lucide-react';

const AttachmentsTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
              <FolderPlus className="w-4 h-4" />
              <span>Folder</span>
            </button>
            <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm">
              <span>File type</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm">
              <span>Sort by</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Claims Documents</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Labor Invoice</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Material Invoices</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
          <ArrowUp className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload attachments</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Drag and drop or <button className="text-primary-600 hover:text-primary-700 underline">click here</button> to upload files
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Maximum file size is 20 MB</p>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsTab;