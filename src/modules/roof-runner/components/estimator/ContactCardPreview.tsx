import React from 'react';
import { Mail, Phone, Building2 } from 'lucide-react';
import type { OrganizationProfile } from '../../types/instantEstimatorSettings';

interface ContactCardPreviewProps {
  organization: OrganizationProfile | null;
  loading?: boolean;
}

const ContactCardPreview: React.FC<ContactCardPreviewProps> = ({
  organization,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
        <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Organization profile not found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className="flex items-center gap-4">
        {organization.logo_url ? (
          <img
            src={organization.logo_url}
            alt={organization.name}
            className="w-16 h-16 rounded-lg object-contain bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border border-gray-200 dark:border-gray-600">
            <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {organization.name}
          </h4>
          {organization.website && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {organization.website.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          disabled={!organization.email}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            organization.email
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
              : 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          title={organization.email || 'No email set'}
        >
          <Mail className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={!organization.phone}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            organization.phone
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
              : 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          title={organization.phone || 'No phone set'}
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Preview of the contact card shown to customers
      </p>
    </div>
  );
};

export default ContactCardPreview;
