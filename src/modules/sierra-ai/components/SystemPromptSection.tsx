import React from 'react';
import { Settings, Shuffle } from 'lucide-react';

interface SystemPromptSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSettingsClick?: () => void;
}

export function SystemPromptSection({ value, onChange, onSettingsClick }: SystemPromptSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">System prompt</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define the agent's personality, knowledge, and behavior
          </p>
        </div>
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="System prompt settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="You are a helpful assistant."
          rows={12}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
        />

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Shuffle className="w-3 h-3" />
            Type <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{ }}'}</span> to add variables
          </button>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Default personality</label>
            <button
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600"
            >
              <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>

          <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Set timezone
          </button>
        </div>
      </div>
    </div>
  );
}
