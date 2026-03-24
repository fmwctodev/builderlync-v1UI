import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';

export function SierraAssistantFAB() {
  const { panelOpen, setPanelOpen, isLoading, isStreaming } = useSierraAssistant();

  return (
    <button
      onClick={() => setPanelOpen(!panelOpen)}
      title="Sierra AI Assistant (⌘⇧K)"
      aria-label="Open Sierra AI Assistant"
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        h-12 px-4
        rounded-full shadow-lg
        font-medium text-sm text-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${panelOpen
          ? 'bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500'
          : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
        }
      `}
    >
      <div className="relative flex items-center justify-center">
        <Sparkles
          size={18}
          className={`${(isLoading || isStreaming) ? 'animate-pulse' : ''}`}
        />
        {(isLoading || isStreaming) && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 animate-ping" />
        )}
      </div>
      <span>Sierra</span>
    </button>
  );
}
