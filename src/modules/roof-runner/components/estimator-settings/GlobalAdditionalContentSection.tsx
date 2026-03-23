import React from 'react';
import { Link } from 'react-router-dom';

interface GlobalAdditionalContentSectionProps {
  showCustomerReviews: boolean;
  showSocialMedia: boolean;
  onShowCustomerReviewsChange: (value: boolean) => void;
  onShowSocialMediaChange: (value: boolean) => void;
}

export const GlobalAdditionalContentSection: React.FC<GlobalAdditionalContentSectionProps> = ({
  showCustomerReviews,
  showSocialMedia,
  onShowCustomerReviewsChange,
  onShowSocialMediaChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Additional content
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tell your customers more about your business with additional content that can help build trust.
            Manage the content in{' '}
            <Link to="/settings" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Instant Estimator settings
            </Link>.
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={showCustomerReviews}
                onChange={(e) => onShowCustomerReviewsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show customer reviews
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Beta
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={showSocialMedia}
                onChange={(e) => onShowSocialMediaChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show social media links
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage social media links in{' '}
                <Link
                  to="/settings/brand-board"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  profile & branding settings
                </Link>
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
