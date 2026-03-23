import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OrganizationProfile } from '../../types/instantEstimatorSettings';

interface GlobalContactInfoSectionProps {
  organizationProfile: OrganizationProfile | null;
}

export const GlobalContactInfoSection: React.FC<GlobalContactInfoSectionProps> = ({
  organizationProfile,
}) => {
  const displayName = organizationProfile?.name || 'Your Company';
  const displayEmail = organizationProfile?.email;
  const displayPhone = organizationProfile?.phone;
  const displayLogo = organizationProfile?.logo_url;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Contact information
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contact information is pulled from your organization's business info. To update, please{' '}
            <Link to="/settings/business-info" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              edit your business info
            </Link>{' '}
            in settings.
          </p>
        </div>

        <div className="flex-1 flex gap-8">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Company profile
            </label>
            <div className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              {organizationProfile?.name || 'No business info configured'}
            </div>
          </div>

          <div className="w-64">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Preview
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex flex-col items-center text-center">
                {displayLogo ? (
                  <img
                    src={displayLogo}
                    alt="Company logo"
                    className="w-20 h-20 object-contain mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Logo</span>
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {displayName}
                </h4>
                <div className="flex items-center gap-3 mt-3">
                  {displayEmail && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Mail className="w-4 h-4" />
                    </button>
                  )}
                  {displayPhone && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
