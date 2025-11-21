import React, { useState } from 'react';
import PersonalDataSection from '../profile/PersonalDataSection';
import PasswordSection from '../profile/PasswordSection';
import AvailabilitySection from '../profile/AvailabilitySection';

type TabId = 'personal' | 'password' | 'signature' | 'email' | '2fa' | 'calendar' | 'availability';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  const tabs = [
    { id: 'personal' as TabId, label: 'Personal Data' },
    { id: 'password' as TabId, label: 'Password' },
    { id: 'signature' as TabId, label: 'Signature' },
    { id: 'email' as TabId, label: 'Email & Sync' },
    { id: '2fa' as TabId, label: 'Two-Factor Auth' },
    { id: 'calendar' as TabId, label: 'Calendar' },
    { id: 'availability' as TabId, label: 'Availability' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalDataSection />;
      case 'password':
        return <PasswordSection />;
      case 'availability':
        return <AvailabilitySection />;
      case 'signature':
        return <SignaturePlaceholder />;
      case 'email':
        return <EmailSyncPlaceholder />;
      case '2fa':
        return <TwoFactorPlaceholder />;
      case 'calendar':
        return <CalendarPlaceholder />;
      default:
        return <PersonalDataSection />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

const SignaturePlaceholder: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Signature</h3>
    <p className="text-gray-600 dark:text-gray-400">Email signature editor coming soon...</p>
  </div>
);

const EmailSyncPlaceholder: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Sync</h3>
    <p className="text-gray-600 dark:text-gray-400">Email sync settings coming soon...</p>
  </div>
);

const TwoFactorPlaceholder: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h3>
    <p className="text-gray-600 dark:text-gray-400">Two-factor authentication setup coming soon...</p>
  </div>
);

const CalendarPlaceholder: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Calendar Settings</h3>
    <p className="text-gray-600 dark:text-gray-400">Calendar connection settings coming soon...</p>
  </div>
);

export default Profile;
