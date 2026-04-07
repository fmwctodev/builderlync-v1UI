import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import { useParams, useNavigate } from 'react-router-dom';
import { AIReporting } from './AIReporting';
import { AIReportsTab } from '../components/AIReportsTab';

const Reporting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const isAiReportsEnabled = useFeatureFlag('ai-reports');

  useEffect(() => {
    if (isAiReportsEnabled === false) {
      navigate(`/org/${orgSlug}/dashboard`);
    }
  }, [isAiReportsEnabled, navigate, orgSlug]);

  const initialTab = searchParams.get('tab') || 'ai-reporting';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'ai-reporting', label: 'AI Reporting', icon: BarChart3 },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporting</h1>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'ai-reporting' && <AIReportsTab />}
      </div>
    </div>
  );
};

export default Reporting;
