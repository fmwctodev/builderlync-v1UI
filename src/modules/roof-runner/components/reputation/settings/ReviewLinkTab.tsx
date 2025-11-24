import React, { useState } from 'react';
import { Globe, Hash } from 'lucide-react';

const ReviewLinkTab: React.FC = () => {
  const [isBalancingEnabled, setIsBalancingEnabled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('google');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Review Link
            {isBalancingEnabled && (
              <span className="text-sm text-green-600 font-normal">Auto Balance Enabled</span>
            )}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your Review Link to collect feedback from customers
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBalancingEnabled}
              onChange={(e) => setIsBalancingEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Review Balancing</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically balance reviews for multiple socials
            </p>
          </div>
        </div>
        <button
          disabled={!isBalancingEnabled}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isBalancingEnabled
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
          }`}
        >
          Configure Balance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="google"
              name="platform"
              value="google"
              checked={selectedPlatform === 'google'}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-4 h-4 text-primary-600"
            />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">G</div>
              <div>
                <label htmlFor="google" className="font-medium text-gray-900 dark:text-white">Get Reviews on Google</label>
                <p className="text-xs text-gray-500">https://search.google.com/loca...</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="facebook"
              name="platform"
              value="facebook"
              checked={selectedPlatform === 'facebook'}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-4 h-4 text-primary-600"
            />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>
              <div>
                <label htmlFor="facebook" className="font-medium text-gray-900 dark:text-white">Get Reviews on Facebook</label>
                <p className="text-xs text-gray-500">http://www.facebook.com/18383...</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="custom"
              name="platform"
              value="custom"
              checked={selectedPlatform === 'custom'}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-4 h-4 text-primary-600"
            />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-500 rounded text-white text-xs flex items-center justify-center">
                <Hash size={12} />
              </div>
              <div>
                <label htmlFor="custom" className="font-medium text-gray-900 dark:text-white">Custom link</label>
                <p className="text-xs text-gray-500">no link found</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          {selectedPlatform === 'google' && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Google</h4>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your review will be posted in Google, which is the best way to share your experience with your customer. We are dedicated to providing you with a great service and will take care of posting the reviews on our social media accounts.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Page</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white">
                  <option>Google</option>
                </select>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">886 Digital - Melbourne, VIC</div>
                <div className="text-xs text-gray-500 break-all">https://search.google.com/local/writereview?placeid=ChIJXeeP-cND1moRvUZ8ogOtrPg</div>
              </div>
              <p className="text-xs text-gray-500">Your customers will provide reviews through the given link</p>
            </div>
          )}

          {selectedPlatform === 'facebook' && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Facebook</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your review will be posted in Facebook, which is the best way to share your experience with your customer. We are dedicated to providing you with a great service and will take care of posting the reviews on our social media accounts.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Page</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white">
                  <option>Facebook</option>
                </select>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">886.digital</div>
                <div className="text-xs text-gray-500 break-all">https://www.facebook.com/176258418910023/reviews/</div>
              </div>
              <p className="text-xs text-gray-500">Your customers will provide reviews through the given link</p>
            </div>
          )}

          {selectedPlatform === 'custom' && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Setup your custom link</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value="www.custom-link.business.com/review"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  value="www.custom-link.business.com/review"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">Your customers will provide reviews through the given link</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
          Cancel
        </button>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
};

export default ReviewLinkTab;