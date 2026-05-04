import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Zap, Sparkles } from 'lucide-react';
import { FormsAndFunnels } from '../../marketing/pages/FormsAndFunnels';
import SierraMarketingDashboard from '../../marketing/pages/SierraMarketingDashboard';
import SierraSocialAIModule from '../../marketing/social/SierraSocialAIModule';
import { PageHeader, Tabs, Section } from '../../../shared/components/ui';

const Marketing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'sierra';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-studio-page pt-8">
        <PageHeader eyebrow="Growth" title="Marketing" />
      </div>
      <div className="px-studio-page mt-4">
        <Tabs<string>
          value={activeTab}
          onChange={handleTabChange}
          items={[
            { id: 'sierra',        label: 'Sierra Marketing AI', icon: <Zap /> },
            { id: 'sierra-social', label: 'Sierra Social AI',     icon: <Sparkles /> },
            { id: 'forms-funnels', label: 'Forms & Funnels',      icon: <FileText /> },
          ]}
        />
      </div>

      <Section className="flex-1 overflow-auto px-studio-page">
        {activeTab === 'sierra' && <SierraMarketingDashboard />}
        {activeTab === 'sierra-social' && <SierraSocialAIModule />}
        {activeTab === 'forms-funnels' && <FormsAndFunnels />}
      </Section>
    </div>
  );
};

export default Marketing;
