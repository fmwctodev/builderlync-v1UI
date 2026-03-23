import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Phone,
  FileText,
  Radio,
  Calendar,
  TestTube,
  Settings,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'knowledge-base'
  | 'numbers-routing'
  | 'agent-script'
  | 'channels'
  | 'booking-calendars'
  | 'logs-testing'
  | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { id: 'numbers-routing', label: 'Numbers & Routing', icon: Phone },
  { id: 'agent-script', label: 'Agent Script & Flow', icon: FileText },
  { id: 'channels', label: 'Channels', icon: Radio },
  { id: 'booking-calendars', label: 'Booking & Calendars', icon: Calendar },
  { id: 'logs-testing', label: 'Logs & Testing', icon: TestTube },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
