import React, { useState } from 'react';
import { Shield, Zap } from 'lucide-react';

const SpamReviewsTab: React.FC = () => {
  const [spamDetection, setSpamDetection] = useState('off');

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Spam Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => setSpamDetection('off')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            spamDetection === 'off'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <Shield size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Off</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turn Off Reviews Spam Detection
              </p>
            </div>
            <div className="mt-1">
              <div className={`w-4 h-4 rounded-full border-2 ${
                spamDetection === 'off'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {spamDetection === 'off' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setSpamDetection('on')}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            spamDetection === 'on'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <Zap size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">On</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically Detects whether incoming review is spam or not
              </p>
            </div>
            <div className="mt-1">
              <div className={`w-4 h-4 rounded-full border-2 ${
                spamDetection === 'on'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {spamDetection === 'on' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Spam Detection of Reviews
        </h4>
        <p className="text-blue-600 dark:text-blue-400 mb-4">
          Enabling Spam Detection of Reviews will have the following impacts in the system.
        </p>
        
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>All new incoming reviews will be automatically detected if they are spam or not.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Users will have control to override the decision taken by the system.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Automatic Reviews Reply will not be sent for spam detected reviews.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Scheduled Review Replies can be stopped by manually marking reviews as spam.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Spam detected reviews will not show up in Review Widget.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Spam detected reviews will be not added in Overview Dashboard.</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
          Cancel
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
};

export default SpamReviewsTab;