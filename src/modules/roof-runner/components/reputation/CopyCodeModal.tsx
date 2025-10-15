import React, { useState } from 'react';
import { X, Copy, ChevronDown } from 'lucide-react';

interface CopyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CopyCodeModal: React.FC<CopyCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedWidget, setSelectedWidget] = useState('Untitled');
  const [showDropdown, setShowDropdown] = useState(false);

  const widgetCode = `<script type='text/javascript' src='https://reputationhub.site/reputation/assets/review-widget.js'></script><iframe class='lc_reviews_widget' src='https://reputationhub.site/reputation/widgets/review_widget/IhXKNXoGFbb1g3K7cYtk' frameborder='0' scrolling='no' style='min-width: 100%; width: 100%;'></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review Widget Code</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add the below code to your website. Learn how to use Review Widget on your website or funnel here:{' '}
              <a href="#" className="text-blue-600 hover:underline">Link</a>
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
          <div className="mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border">
              <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
                {widgetCode}
              </code>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
              >
                <span>{selectedWidget}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedWidget('Untitled');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg"
                  >
                    Untitled
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Copy size={16} />
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyCodeModal;