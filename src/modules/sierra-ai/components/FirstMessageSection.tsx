import React from 'react';
import { Shuffle } from 'lucide-react';

interface FirstMessageSectionProps {
  value: string;
  interruptible: boolean;
  onChange: (value: string) => void;
  onInterruptibleChange: (interruptible: boolean) => void;
}

export function FirstMessageSection({
  value,
  interruptible,
  onChange,
  onInterruptibleChange,
}: FirstMessageSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">First message</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The first message the agent will say. If empty, the agent will wait for the user to start the conversation.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Hello, how can I help you today?"
          rows={4}
          className="w-full px-4 py-3 bg-paper dark:bg-canvas border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
        />

        <div className="absolute bottom-3 left-3">
          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Shuffle className="w-3 h-3" />
            Type <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{ }}'}</span> to add variables
          </button>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <label className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">Interruptible</label>
          <button
            onClick={() => onInterruptibleChange(!interruptible)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              interruptible ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                interruptible ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
