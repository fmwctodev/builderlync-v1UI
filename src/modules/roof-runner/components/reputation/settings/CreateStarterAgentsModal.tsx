import React from 'react';
import { X } from 'lucide-react';

interface CreateStarterAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStarterAgentsModal: React.FC<CreateStarterAgentsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Starter Agents</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Using this option will create five new Reviews AI Agents, which will automatically generate responses for future reviews. By default, they will be set to respond to all reviews. If you prefer to limit their responses to specific review sources or types, you can update their settings anytime after creation. Would you like to proceed?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStarterAgentsModal;