import React, { useState } from 'react';
import PersonalDataSection from '../../../roof-runner/components/profile/PersonalDataSection';
import PasswordSection from '../../../roof-runner/components/profile/PasswordSection';
import SignatureSection from '../../../roof-runner/components/profile/SignatureSection';
import EmailSyncSection from '../../../roof-runner/components/profile/EmailSyncSection';
import TwoFactorAuthSection from '../../../roof-runner/components/profile/TwoFactorAuthSection';
import CalendarSettingsSection from '../../../roof-runner/components/profile/CalendarSettingsSection';
import AvailabilitySection from '../../../roof-runner/components/profile/AvailabilitySection';

type TabId = 'personal' | 'password' | 'signature' | 'email' | '2fa' | 'calendar' | 'availability';

export const ProfileSettings: React.FC = () => {
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
      case 'signature':
        return <SignatureSection />;
      case 'email':
        return <EmailSyncSection />;
      case '2fa':
        return <TwoFactorAuthSection />;
      case 'calendar':
        return <CalendarSettingsSection />;
      case 'availability':
        return <AvailabilitySection />;
      default:
        return <PersonalDataSection />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
