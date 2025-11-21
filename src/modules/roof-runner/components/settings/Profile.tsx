import React, { useState } from 'react';
import PersonalDataSection from '../profile/PersonalDataSection';
import PasswordSection from '../profile/PasswordSection';
import AvailabilitySection from '../profile/AvailabilitySection';
import SignatureSection from '../profile/SignatureSection';
import TwoFactorAuthSection from '../profile/TwoFactorAuthSection';
import EmailSyncSection from '../profile/EmailSyncSection';
import CalendarSettingsSection from '../profile/CalendarSettingsSection';

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
        return <SignatureSection />;
      case 'email':
        return <EmailSyncSection />;
      case '2fa':
        return <TwoFactorAuthSection />;
      case 'calendar':
        return <CalendarSettingsSection />;
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
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
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


export default Profile;
