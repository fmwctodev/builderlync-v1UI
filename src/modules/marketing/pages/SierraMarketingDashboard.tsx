import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, BarChart2, Users, Megaphone, Settings, Radio } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { LeadsAttributionTab } from './tabs/LeadsAttributionTab';
import { CampaignStudioTab } from './tabs/CampaignStudioTab';
import { SierraActionsTab } from './tabs/SierraActionsTab';
import { ChannelsTrackingTab } from './tabs/ChannelsTrackingTab';
import { SettingsTab } from './tabs/SettingsTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'attribution', label: 'Leads & Attribution', icon: Users },
  { id: 'campaigns', label: 'Campaign Studio', icon: Megaphone },
  { id: 'actions', label: 'Sierra Actions', icon: Zap },
  { id: 'channels', label: 'Channels & Tracking', icon: Radio },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SierraMarketingDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('sierraTab') || 'overview';

  const handleTabChange = (tabId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'sierra');
      next.set('sierraTab', tabId);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      <div className="bg-surface-1 dark:bg-surface-d-1 border-b border-edge-soft dark:border-edge-d-soft px-studio-page shrink-0">
        <div className="py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-signal-500 rounded-studio-2 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="studio-text-title-2">Sierra Marketing AI</h1>
              <p className="studio-text-caption text-ink-3 dark:text-ink-d-3">AI-guided marketing command center for contractors</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {tab.id === 'actions' && (
                  <span className="ml-0.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">3</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'attribution' && <LeadsAttributionTab />}
          {activeTab === 'campaigns' && <CampaignStudioTab />}
          {activeTab === 'actions' && <SierraActionsTab />}
          {activeTab === 'channels' && <ChannelsTrackingTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default SierraMarketingDashboard;
