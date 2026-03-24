import React, { useState } from 'react';
import { CheckCircle, XCircle, SkipForward, ChevronDown, ChevronRight } from 'lucide-react';
import type { ExecutionResult } from '../../types/sierraAssistant';

interface Props {
  results: ExecutionResult[];
}

const ACTION_LABELS: Record<string, string> = {
  create_contact: 'Contact Created',
  update_contact: 'Contact Updated',
  create_opportunity: 'Opportunity Created',
  move_opportunity: 'Opportunity Moved',
  create_task: 'Task Created',
  update_task: 'Task Updated',
  create_event: 'Event Scheduled',
  update_event: 'Event Updated',
  cancel_event: 'Event Cancelled',
  draft_email: 'Email Draft Ready',
  send_email: 'Email Sent',
  send_sms: 'SMS Sent',
  remember: 'Memory Saved',
  store_memory: 'Memory Stored',
};

export function ExecutionResultCard({ results }: Props) {
  const [expanded, setExpanded] = useState(false);
  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {failCount === 0
            ? <CheckCircle size={14} className="text-green-500" />
            : <XCircle size={14} className="text-red-500" />
          }
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {successCount} action{successCount !== 1 ? 's' : ''} completed
            {failCount > 0 ? `, ${failCount} failed` : ''}
          </span>
        </div>
        {expanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
          {results.map(result => {
            const label = ACTION_LABELS[result.action] ?? result.action;
            return (
              <div key={result.action_id} className="flex items-start gap-2 text-xs px-1 py-0.5">
                {result.status === 'success'
                  ? <CheckCircle size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                  : result.status === 'failed'
                  ? <XCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                  : <SkipForward size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  {result.resource_id && (
                    <span className="ml-1 text-gray-400 dark:text-gray-500 font-mono">#{result.resource_id.slice(-8)}</span>
                  )}
                  {result.error && (
                    <p className="text-red-500 mt-0.5">{result.error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
