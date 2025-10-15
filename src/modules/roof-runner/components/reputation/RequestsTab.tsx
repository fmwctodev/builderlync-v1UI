import React from 'react';
import { Send } from 'lucide-react';

interface RequestsTabProps {
  onOpenModal: () => void;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ onOpenModal }) => {
  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Requests</h2>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={16} />
            Send Review Request
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-12">
          <Send size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start Sending Review Requests
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Send your first review request to start building credibility and attracting more customers.
          </p>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors mx-auto"
          >
            <Send size={16} />
            Send Review Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestsTab;