import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CreateFormModalProps {
  onClose: () => void;
  onCreate: (type: 'scratch' | 'template') => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({ onClose, onCreate }) => {
  const [selectedOption, setSelectedOption] = useState<'scratch' | 'template'>('scratch');

  const handleCreate = () => {
    if (selectedOption === 'template') {
      alert('Templates are coming soon! Please select "Start from Scratch" to create a form.');
      return;
    }
    onCreate(selectedOption);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Form</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setSelectedOption('scratch')}
            className={`relative p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedOption === 'scratch'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="absolute top-6 right-6">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === 'scratch'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedOption === 'scratch' && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start from Scratch
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Design from scratch using the form builder
              </p>

              <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                  <Plus size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedOption('template')}
            className={`relative p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedOption === 'template'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="absolute top-6 right-6">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === 'template'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedOption === 'template' && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                From templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Jump start with an awesome prebuilt form
              </p>

              <div className="relative h-64 bg-gradient-to-br from-red-100 to-red-100 dark:from-red-900/30 dark:to-red-900/30 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white dark:bg-gray-800 px-8 py-6 rounded-lg shadow-xl">
                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Over 1000+
                    </h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Templates</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
