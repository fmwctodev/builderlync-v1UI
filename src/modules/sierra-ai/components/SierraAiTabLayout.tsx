import React, { useState } from 'react';
import { Bot, BookOpen, Mic, Layers } from 'lucide-react';

type TabId = 'agents' | 'knowledge-base' | 'voices' | 'templates';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SierraAiTabLayoutProps {
  children: (activeTab: TabId) => React.ReactNode;
}

export function SierraAiTabLayout({ children }: SierraAiTabLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('agents');

  const tabs: Tab[] = [
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'voices', label: 'Voices', icon: Mic },
    { id: 'templates', label: 'Agent Templates', icon: Layers },
  ];

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Agents</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children(activeTab)}
      </div>
    </div>
  );
}
