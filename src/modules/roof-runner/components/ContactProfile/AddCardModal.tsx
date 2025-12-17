import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSave }) => {
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Card on File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Add customer card details for future purchases
          </p>

          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Connect at least one payment gateway to start receiving payments
            </p>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Integrate payment gateway
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowAdditionalOptions(!showAdditionalOptions)}
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              Additional Options {showAdditionalOptions ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;