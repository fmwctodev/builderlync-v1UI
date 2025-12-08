import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ConflictError } from '../../services/templateApi';

interface TemplateConflictModalProps {
  conflict: ConflictError;
  onReload: () => void;
  onOverride: () => void;
  onCancel: () => void;
}

export const TemplateConflictModal: React.FC<TemplateConflictModalProps> = ({
  conflict,
  onReload,
  onOverride,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-500" size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Template Conflict
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {conflict.message}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Server version:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(conflict.details.serverLastModified).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Your version:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(conflict.details.clientLastModified).toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Another user has modified this template. You can reload to see their changes or override with your version.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onReload}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Reload Template
          </button>
          <button
            onClick={onOverride}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Override Changes
          </button>
        </div>
      </div>
    </div>
  );
};
