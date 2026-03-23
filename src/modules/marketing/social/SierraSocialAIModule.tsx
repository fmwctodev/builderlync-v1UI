import React, { useState } from 'react';
import { MessageSquare, LayoutGrid as Layout, Megaphone, BookOpen, Link2, BarChart2 } from 'lucide-react';
import SocialChat from './pages/SocialChat';
import SocialPosts from './pages/SocialPosts';
import SocialCampaigns from './pages/SocialCampaigns';
import SocialGuidelines from './pages/SocialGuidelines';
import SocialAccounts from './pages/SocialAccounts';
import SocialAnalytics from './pages/SocialAnalytics';
import { useCurrentOrganizationSafe } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';

type TabId = 'chat' | 'posts' | 'campaigns' | 'guidelines' | 'accounts' | 'analytics';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
  { id: 'posts', label: 'Posts', icon: <Layout size={16} /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Megaphone size={16} /> },
  { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={16} /> },
  { id: 'accounts', label: 'Accounts', icon: <Link2 size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
];

const SierraSocialAIModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const { currentOrganization: currentOrg } = useCurrentOrganizationSafe();
  const { user } = useSupabaseUser();

  const orgId = currentOrg?.id ?? '';
  const userId = user?.id ?? '';

  const renderTab = () => {
    switch (activeTab) {
      case 'chat':
        return <SocialChat orgId={orgId} userId={userId} />;
      case 'posts':
        return <SocialPosts orgId={orgId} userId={userId} />;
      case 'campaigns':
        return <SocialCampaigns orgId={orgId} userId={userId} />;
      case 'guidelines':
        return <SocialGuidelines orgId={orgId} />;
      case 'accounts':
        return <SocialAccounts orgId={orgId} />;
      case 'analytics':
        return <SocialAnalytics orgId={orgId} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-700 bg-slate-800/60 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {renderTab()}
      </div>
    </div>
  );
};

export default SierraSocialAIModule;
