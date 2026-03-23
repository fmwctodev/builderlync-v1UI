import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RotateCcw, Play } from 'lucide-react';
import type { SierraAction } from '../../types/marketing';

interface ActionCardProps {
  action: SierraAction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSnooze: (id: string) => void;
}

const approvalBadge = (state: string) => {
  switch (state) {
    case 'approved': return <span className="text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Approved</span>;
    case 'rejected': return <span className="text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">Rejected</span>;
    case 'snoozed': return <span className="text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">Snoozed</span>;
    case 'auto_approved': return <span className="text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">Auto-approved</span>;
    default: return <span className="text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">Pending</span>;
  }
};

const executionBadge = (state: string) => {
  switch (state) {
    case 'completed': return <span className="text-xs font-medium text-green-600 flex items-center gap-1"><CheckCircle size={11} /> Done</span>;
    case 'running': return <span className="text-xs font-medium text-blue-600 flex items-center gap-1"><Play size={11} /> Running</span>;
    case 'failed': return <span className="text-xs font-medium text-red-600 flex items-center gap-1"><XCircle size={11} /> Failed</span>;
    default: return null;
  }
};

export const ActionCard: React.FC<ActionCardProps> = ({ action, onApprove, onReject, onSnooze }) => {
  const [expanded, setExpanded] = useState(false);
  const isPending = action.approval_state === 'pending';
  const isCompleted = action.execution_state === 'completed';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-colors ${isPending ? 'border-red-200 dark:border-red-800/40' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isPending ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{action.title}</p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-500">{action.confidence_score}%</span>
              {approvalBadge(action.approval_state)}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.expected_impact}</p>

          {expanded && (
            <div className="mt-3 space-y-2">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Why Sierra recommends this:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{action.rationale}</p>
              </div>
              {action.result_summary && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Result:</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{action.result_summary}</p>
                </div>
              )}
              {action.linked_entities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {action.linked_entities.map((e) => (
                    <span key={e.id} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {e.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {isPending && (
                <>
                  <button
                    onClick={() => onApprove(action.id)}
                    className="flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <CheckCircle size={11} />
                    Approve
                  </button>
                  <button
                    onClick={() => onSnooze(action.id)}
                    className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Clock size={11} />
                    Snooze
                  </button>
                  <button
                    onClick={() => onReject(action.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
                  >
                    Reject
                  </button>
                </>
              )}
              {isCompleted && action.can_rollback && (
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <RotateCcw size={11} />
                  Rollback
                </button>
              )}
              {executionBadge(action.execution_state)}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
