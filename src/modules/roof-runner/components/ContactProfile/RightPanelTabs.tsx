import React from 'react';
import { Clock, Edit, FileText, Calendar, Building, DollarSign } from 'lucide-react';

interface RightPanelTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RightPanelTabs: React.FC<RightPanelTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'activity', icon: Clock },
    { id: 'tasks', icon: Edit },
    { id: 'notes', icon: FileText },
    { id: 'appointments', icon: Calendar },
    { id: 'documents', icon: Building },
    { id: 'payments', icon: DollarSign },
    { id: 'related', icon: null }
  ];

  return (
    <div className="flex items-center gap-4 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {tab.icon ? (
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400'}`} />
          ) : (
            <svg className={`w-5 h-5 ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};

export default RightPanelTabs;