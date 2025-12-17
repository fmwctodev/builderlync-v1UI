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

interface SierraNavigationProps {
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

export function SierraNavigation({ activeTab, onTabChange }: SierraNavigationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
      <div className="py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sierra AI</h1>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
