import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';

interface Props {
  module: string;
  recordId?: string;
  label?: string;
  className?: string;
}

export function AskSierraButton({ module, recordId, label = 'Ask Sierra', className = '' }: Props) {
  const { openWithContext } = useSierraAssistant();

  return (
    <button
      onClick={() => openWithContext(module, recordId)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors ${className}`}
    >
      <Sparkles size={12} />
      {label}
    </button>
  );
}
