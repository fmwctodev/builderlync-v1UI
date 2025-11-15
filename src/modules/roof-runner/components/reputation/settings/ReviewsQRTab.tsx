import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import QRCodeBuilder from './QRCodeBuilder';

const ReviewsQRTab: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return <QRCodeBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews QR</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and customize your QR Codes
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Create QR Code
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-lg mb-4">
              <svg className="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
                <path d="M15 13h2v2h-2zm2 2h2v2h-2zm0 2h2v2h-2zm-2 0h2v2h-2zm4-4h2v2h-2zm0-2h2v2h-2z"/>
              </svg>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Create your QR Code now
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Time's ticking! Let's craft your first QR code to boost review collection.
          </p>
          
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsQRTab;