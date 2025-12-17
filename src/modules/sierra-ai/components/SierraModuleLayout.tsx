import React, { useState } from 'react';
import { SierraNavigation, TabId } from './SierraNavigation';
import { mockSierraConfig } from '../lib/mockData';

interface SierraModuleLayoutProps {
  children: (activeTab: TabId, layoutState: LayoutState) => React.ReactNode;
}

export interface LayoutState {
  agentStatus: 'active' | 'paused';
  hasPendingChanges: boolean;
  onToggleStatus: () => void;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
}

export function SierraModuleLayout({ children }: SierraModuleLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [agentStatus, setAgentStatus] = useState<'active' | 'paused'>(mockSierraConfig.agentStatus);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleToggleStatus = () => {
    setAgentStatus((prev) => (prev === 'active' ? 'paused' : 'active'));
    setHasPendingChanges(true);
    console.log('Agent status toggled:', agentStatus === 'active' ? 'paused' : 'active');
  };

  const handleSave = async () => {
    console.log('Saving changes...');
    // TODO: Save changes to backend
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Changes saved successfully');
  };

  const handlePublish = async () => {
    console.log('Publishing to live...');
    // TODO: Publish changes to live environment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasPendingChanges(false);
    console.log('Published to live successfully');
  };

  const layoutState: LayoutState = {
    agentStatus,
    hasPendingChanges,
    onToggleStatus: handleToggleStatus,
    onSave: handleSave,
    onPublish: handlePublish,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <SierraNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children(activeTab, layoutState)}
      </div>
    </div>
  );
}
