import React, { useState } from 'react';
import { Bot, BookOpen, Mic, Layers, LucideIcon } from 'lucide-react';

type TabId = 'agents' | 'knowledge-base' | 'voices' | 'templates';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Agents</h1>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 font-medium transition-all border-b-2 ${activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
      <div>
        {children(activeTab)}
      </div>
    </div>
  );
}
