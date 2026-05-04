import React, { useEffect, useRef } from 'react';
import { X, Sparkles, MessageSquare, Activity, Settings } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';
import { SierraAssistantChatView } from './SierraAssistantChatView';
import { SierraAssistantActivityView } from './SierraAssistantActivityView';
import { SierraAssistantSettingsView } from './SierraAssistantSettingsView';

export function SierraAssistantPanel() {
  const { panelOpen, setPanelOpen, activeTab, setActiveTab } = useSierraAssistant();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelOpen) setPanelOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panelOpen, setPanelOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const fab = document.querySelector('[aria-label="Open Sierra AI Assistant"]');
        if (fab && fab.contains(e.target as Node)) return;
        setPanelOpen(false);
      }
    };
    if (panelOpen) {
      setTimeout(() => document.addEventListener('mousedown', handler), 100);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, setPanelOpen]);

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'activity' as const, label: 'Activity', icon: Activity },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop (mobile only) */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed right-0 top-0 bottom-0 z-50
          w-full md:w-[420px]
          bg-white dark:bg-gray-900
          border-l border-gray-200 dark:border-gray-800
          shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Sierra AI Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">Sierra</h2>
              <p className="text-xs text-primary-200 leading-tight">AI Executive Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-paper dark:bg-canvas">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' && <SierraAssistantChatView />}
          {activeTab === 'activity' && <SierraAssistantActivityView />}
          {activeTab === 'settings' && <SierraAssistantSettingsView />}
        </div>

        {/* Keyboard hint */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-paper dark:bg-canvas/50">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">⌘⇧K</kbd> to toggle
          </p>
        </div>
      </div>
    </>
  );
}
