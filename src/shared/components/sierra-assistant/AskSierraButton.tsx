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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors ${className}`}
    >
      <Sparkles size={12} />
      {label}
    </button>
  );
}
