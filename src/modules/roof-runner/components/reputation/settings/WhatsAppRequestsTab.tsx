import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppRequestsTab: React.FC = () => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">WhatsApp Review Requests</h3>

      <div className="max-w-4xl">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Reach out to your customer on their favourite messaging app
            </h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay closer to your customers by providing instant support, sending timely updates, and creating engaging interactions.
            </p>
          </div>

          <div className="flex justify-center">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <MessageCircle size={20} />
              Connect WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppRequestsTab;