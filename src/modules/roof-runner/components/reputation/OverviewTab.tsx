import React, { useState } from 'react';
import { Send } from 'lucide-react';
import MyStatsTab from './MyStatsTab';
import CompetitorAnalysisTab from './CompetitorAnalysisTab';

interface OverviewTabProps {
  onOpenModal: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onOpenModal }) => {
  const [activeSubTab, setActiveSubTab] = useState('my-stats');

  const subTabs = [
    { id: 'my-stats', label: 'My Stats' },
    { id: 'competitor-analysis', label: 'Competitor Analysis' }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'my-stats':
        return <MyStatsTab />;
      case 'competitor-analysis':
        return <CompetitorAnalysisTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeSubTab === tab.id
                    ? 'bg-red-50 text-red-700 border-b-2 border-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={16} />
            Send review request
          </button>
        </div>
      </div>

      {renderSubTabContent()}
    </div>
  );
};

export default OverviewTab;