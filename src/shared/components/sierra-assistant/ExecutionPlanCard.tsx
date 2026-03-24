import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import type { ITSAction } from '../../types/sierraAssistant';

const ACTION_LABELS: Record<string, string> = {
  create_contact: 'Create Contact',
  update_contact: 'Update Contact',
  create_opportunity: 'Create Opportunity',
  move_opportunity: 'Move Opportunity',
  create_task: 'Create Task',
  update_task: 'Update Task',
  create_event: 'Schedule Event',
  update_event: 'Update Event',
  cancel_event: 'Cancel Event',
  draft_email: 'Draft Email',
  send_email: 'Send Email',
  send_sms: 'Send SMS',
  remember: 'Save Memory',
  store_memory: 'Store Memory',
};

const ACTION_COLORS: Record<string, string> = {
  create_contact: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update_contact: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  create_opportunity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  move_opportunity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  create_task: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  update_task: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  create_event: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  update_event: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  cancel_event: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  draft_email: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  send_email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  send_sms: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  remember: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

interface Props {
  executionRequestId: string;
  responseToUser: string;
  actions: ITSAction[];
  intent: string;
  onConfirm: (approvedActionIds?: string[]) => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function ExecutionPlanCard({ executionRequestId, responseToUser, actions, onConfirm, onReject, isLoading }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(actions.map(a => [a.action_id, true]))
  );

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCheck = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const approvedIds = actions.filter(a => checked[a.action_id]).map(a => a.action_id);

  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 border-b border-primary-200 dark:border-primary-800">
        <Zap size={14} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
        <p className="text-xs font-medium text-primary-800 dark:text-primary-300 flex-1">{responseToUser}</p>
      </div>

      {/* Action list */}
      <div className="p-2 space-y-1.5">
        {actions.map((action) => {
          const label = ACTION_LABELS[action.action] ?? action.action;
          const colorClass = ACTION_COLORS[action.action] ?? 'bg-gray-100 text-gray-700';
          const isExpanded = expanded[action.action_id];
          const isChecked = checked[action.action_id];
          const payloadKeys = Object.keys(action.payload ?? {});

          return (
            <div
              key={action.action_id}
              className={`rounded-lg border transition-colors ${
                isChecked
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2 px-3 py-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(action.action_id)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${colorClass}`}>
                      {label}
                    </span>
                    {action.reason && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{action.reason}</span>
                    )}
                  </div>
                  {payloadKeys.length > 0 && (
                    <button
                      onClick={() => toggleExpand(action.action_id)}
                      className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                  )}
                  {isExpanded && (
                    <div className="mt-1.5 space-y-0.5">
                      {payloadKeys.map(key => (
                        <div key={key} className="flex gap-2 text-xs">
                          <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{key}:</span>
                          <span className="text-gray-700 dark:text-gray-300 break-all">{String(action.payload[key])}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => onConfirm(approvedIds)}
          disabled={isLoading || approvedIds.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 text-white text-xs font-medium transition-colors"
        >
          <CheckCircle size={13} />
          {isLoading ? 'Executing...' : `Approve ${approvedIds.length > 0 ? `(${approvedIds.length})` : ''}`}
        </button>
        <button
          onClick={onReject}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium transition-colors"
        >
          <XCircle size={13} />
          Cancel
        </button>
      </div>
    </div>
  );
}
