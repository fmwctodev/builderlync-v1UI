import React, { useState } from 'react';
import { LayoutDashboard, Inbox, Settings } from 'lucide-react';
import { ReviewsInboxPage } from './pages/ReviewsInboxPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { useCurrentOrganizationSafe } from '../../shared/context/OrgContext';
import { useSupabaseUser } from '../../shared/hooks/useSupabaseUser';

type Tab = 'dashboard' | 'inbox' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'inbox', label: 'Reviews', icon: <Inbox className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export const ReputationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { currentOrganizationId } = useCurrentOrganizationSafe();
  const { user } = useSupabaseUser();

  const orgId = currentOrganizationId ?? '';
  const userId = user?.id ?? '';

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reputation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and respond to your reviews from Google Business and Facebook
          </p>
        </div>

        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardPage orgId={orgId} />}
        {activeTab === 'inbox' && (
          <ReviewsInboxPage
            orgId={orgId}
            userId={userId}
            permissions={{
              canReply: true,
              canDeleteReply: true,
              canAIDraft: true,
              canSync: true,
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPage orgId={orgId} />
        )}
      </div>
    </div>
  );
};
