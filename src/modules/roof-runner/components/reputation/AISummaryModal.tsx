import React, { useState } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISummaryModal: React.FC<AISummaryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    pageSource: '',
    startDate: '',
    endDate: ''
  });
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  if (!isOpen) return null;

  const sourceOptions = [
    'All',
    'All Google Pages',
    'All Facebook pages',
    '866 Digital - Melbourne VIC',
    '886.digital'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Summary</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered summaries of customer reviews, based on selected Review Pages and time ranges.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Source
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.pageSource}
                onChange={(e) => setFormData({ ...formData, pageSource: e.target.value })}
                onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                placeholder="Source"
                readOnly
              />
              <ChevronDown 
                size={16} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
              />
              
              {showSourceDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  {sourceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFormData({ ...formData, pageSource: option });
                        setShowSourceDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Start Date"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
              Summarize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;