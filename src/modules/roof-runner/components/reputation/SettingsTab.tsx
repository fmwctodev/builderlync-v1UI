import React, { useState } from 'react';
import ReviewsAITab from './settings/ReviewsAITab';
import ReviewLinkTab from './settings/ReviewLinkTab';
import SMSRequestsTab from './settings/SMSRequestsTab';
import EmailRequestsTab from './settings/EmailRequestsTab';
import WhatsAppRequestsTab from './settings/WhatsAppRequestsTab';
import ReviewsQRTab from './settings/ReviewsQRTab';
import SpamReviewsTab from './settings/SpamReviewsTab';
import IntegrationsTab from './settings/IntegrationsTab';

const SettingsTab: React.FC = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('reviews-ai');

  const settingsTabs = [
    { id: 'reviews-ai', label: 'Reviews AI' },
    { id: 'review-link', label: 'Review Link' },
    { id: 'sms-requests', label: 'SMS Requests' },
    { id: 'email-requests', label: 'Email Requests' },
    { id: 'whatsapp-requests', label: 'WhatsApp Requests' },
    { id: 'reviews-qr', label: 'Reviews QR' },
    { id: 'spam-reviews', label: 'Spam Reviews' },
    { id: 'integrations', label: 'Integrations' }
  ];

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'reviews-ai':
        return <ReviewsAITab />;
      case 'review-link':
        return <ReviewLinkTab />;
      case 'sms-requests':
        return <SMSRequestsTab />;
      case 'email-requests':
        return <EmailRequestsTab />;
      case 'whatsapp-requests':
        return <WhatsAppRequestsTab />;
      case 'reviews-qr':
        return <ReviewsQRTab />;
      case 'spam-reviews':
        return <SpamReviewsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Content for {settingsTabs.find(tab => tab.id === activeSettingsTab)?.label} coming soon...
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
      </div>

      <div className="flex">
        <div className="w-64 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeSettingsTab === tab.id
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;