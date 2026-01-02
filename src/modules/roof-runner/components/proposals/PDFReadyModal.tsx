import React from 'react';
import { Check } from 'lucide-react';

interface PDFReadyModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onDownload: () => void;
}

export const PDFReadyModal: React.FC<PDFReadyModalProps> = ({
  isOpen,
  onCancel,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            PDF Ready
          </h2>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Download Now
          </button>
        </div>
      </div>
    </div>
  );
};