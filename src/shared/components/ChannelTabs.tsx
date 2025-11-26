import React from 'react';
import { MessageSquare, Mail } from 'lucide-react';

export type ChannelType = 'sms' | 'email' | 'internal_comment';

interface ChannelTabsProps {
  activeChannel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
  hasPhone?: boolean;
  hasEmail?: boolean;
}

export function ChannelTabs({ activeChannel, onChannelChange, hasPhone = true, hasEmail = true }: ChannelTabsProps) {
  const tabs: { id: ChannelType; label: string; icon?: React.ReactNode; disabled?: boolean }[] = [
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" />, disabled: !hasPhone },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, disabled: !hasEmail },
    { id: 'internal_comment', label: 'Internal Comment' },
  ];

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChannelChange(tab.id)}
          disabled={tab.disabled}
          className={`
            px-4 py-3 text-sm font-medium transition-colors relative
            ${activeChannel === tab.id
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : tab.disabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          <div className="flex items-center space-x-2">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
