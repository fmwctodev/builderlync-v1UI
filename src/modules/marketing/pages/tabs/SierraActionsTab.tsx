import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Clock, Zap, AlertTriangle, TrendingUp,
  RefreshCw, RotateCcw, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { sierraActionsApi } from '../../services/sierraActionsApi';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';
import type { SierraAction, SierraRecommendation } from '../../types/marketing';

const typeIcon: Record<string, React.ReactNode> = {
  budget_shift: <TrendingUp size={14} />,
  campaign_launch: <Zap size={14} />,
  campaign_pause: <Clock size={14} />,
  funnel_fix: <AlertTriangle size={14} />,
  followup_reactivation: <RefreshCw size={14} />,
  content_suggestion: <Zap size={14} />,
  attribution_issue: <AlertTriangle size={14} />,
  tracking_issue: <AlertTriangle size={14} />,
  storm_response: <Zap size={14} />,
  stale_estimate: <RefreshCw size={14} />,
};

const typeColor: Record<string, string> = {
  budget_shift: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  campaign_launch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  campaign_pause: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  funnel_fix: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  followup_reactivation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  content_suggestion: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  attribution_issue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  tracking_issue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  storm_response: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  stale_estimate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

interface ActionRowProps {
  action: SierraAction;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSnooze: (id: string) => Promise<void>;
}

const ActionRow: React.FC<ActionRowProps> = ({ action, onApprove, onReject, onSnooze }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<'approve' | 'reject' | 'snooze' | null>(null);

  const handle = async (type: 'approve' | 'reject' | 'snooze') => {
    setLoading(type);
    try {
      if (type === 'approve') await onApprove(action.id);
      else if (type === 'reject') await onReject(action.id);
      else await onSnooze(action.id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${
        action.approval_state === 'pending'
          ? 'border-orange-200 dark:border-orange-800'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${typeColor[action.type] ?? 'bg-gray-100 text-gray-500'}`}>
            {typeIcon[action.type] ?? <Zap size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[action.type] ?? 'bg-gray-100 text-gray-500'}`}>
                {action.type.replace(/_/g, ' ')}
              </span>
              {action.approval_state !== 'pending' && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    action.approval_state === 'approved'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : action.approval_state === 'rejected'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  {action.approval_state}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.rationale}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className="text-green-600 dark:text-green-400 font-medium">{action.expected_impact}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{Math.round(action.confidence_score * 100)}% confidence</span>
            </div>
          </div>
          <button onClick={() => setExpanded((e) => !e)} className="text-gray-400 hover:text-gray-600 shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {action.approval_state === 'pending' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handle('approve')}
              disabled={loading !== null}
              className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Approve
            </button>
            <button
              onClick={() => handle('reject')}
              disabled={loading !== null}
              className="flex items-center gap-1.5 text-xs border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject
            </button>
            <button
              onClick={() => handle('snooze')}
              disabled={loading !== null}
              className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 disabled:opacity-50 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              {loading === 'snooze' ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
              Snooze
            </button>
            {action.can_rollback && (
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 ml-auto">
                <RotateCcw size={12} /> Rollback
              </button>
            )}
          </div>
        )}

        {action.approval_state === 'approved' && action.result_summary && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-green-600 dark:text-green-400">
              <CheckCircle size={10} className="inline mr-1" />
              {action.result_summary}
            </p>
          </div>
        )}
      </div>

      {expanded && action.linked_entities.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 uppercase mt-3 mb-1.5">Linked Entities</p>
          <div className="flex flex-wrap gap-2">
            {action.linked_entities.map((e) => (
              <span
                key={e.id}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize"
              >
                {e.type}: {e.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard: React.FC<{ rec: SierraRecommendation; onDismiss: (id: string) => void }> = ({
  rec,
  onDismiss,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg shrink-0 ${typeColor[rec.type] ?? 'bg-gray-100 text-gray-500'}`}>
        {typeIcon[rec.type] ?? <Zap size={14} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</p>
        <p className="text-xs text-gray-500 mt-1">{rec.rationale}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-medium text-green-600 dark:text-green-400">{rec.expected_impact}</span>
          <span className="text-xs text-gray-400">{Math.round(rec.confidence_score * 100)}% confidence</span>
        </div>
      </div>
      <button
        onClick={() => onDismiss(rec.id)}
        className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
      >
        Dismiss
      </button>
    </div>
  </div>
);

export const SierraActionsTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [actions, setActions] = useState<SierraAction[]>([]);
  const [recommendations, setRecommendations] = useState<SierraRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'pending' | 'recommendations' | 'completed' | 'history'>('pending');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [acts, recs] = await Promise.all([
        sierraActionsApi.getActions(orgId),
        sierraActionsApi.getRecommendations(orgId),
      ]);
      setActions(acts);
      setRecommendations(recs);
    } catch {
      addToast('error', 'Failed to load Sierra actions');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      const updated = await sierraActionsApi.approveAction(id, orgId);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast('success', 'Action approved and executed');
    } catch {
      addToast('error', 'Failed to approve action');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await sierraActionsApi.rejectAction(id, orgId);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast('info', 'Action rejected');
    } catch {
      addToast('error', 'Failed to reject action');
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      const updated = await sierraActionsApi.snoozeAction(id, orgId);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast('info', 'Action snoozed');
    } catch {
      addToast('error', 'Failed to snooze action');
    }
  };

  const handleDismissRecommendation = async (id: string) => {
    try {
      await sierraActionsApi.dismissRecommendation(id, orgId);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      addToast('info', 'Recommendation dismissed');
    } catch {
      addToast('error', 'Failed to dismiss recommendation');
    }
  };

  const pending = actions.filter((a) => a.approval_state === 'pending');
  const completed = actions.filter((a) => a.execution_state === 'completed');
  const history = actions.filter(
    (a) => a.approval_state !== 'pending' && a.execution_state !== 'completed'
  );

  const sections = [
    { id: 'pending' as const, label: 'Needs Approval', count: pending.length, urgent: pending.length > 0 },
    { id: 'recommendations' as const, label: 'Recommendations', count: recommendations.length, urgent: false },
    { id: 'completed' as const, label: 'Completed', count: completed.length, urgent: false },
    { id: 'history' as const, label: 'History', count: history.length, urgent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-xs font-semibold text-gray-300 uppercase">Sierra AI</span>
        </div>
        <p className="text-sm leading-relaxed text-gray-200">
          You have{' '}
          <span className="text-white font-bold">
            {pending.length} action{pending.length !== 1 ? 's' : ''}
          </span>{' '}
          awaiting approval. Sierra has identified opportunities that could add an estimated{' '}
          <span className="text-green-400 font-bold">$72,000+</span> in pipeline this month. Review
          and approve to execute, or dismiss if not relevant.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`relative text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {s.label}
            {s.count > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  s.urgent
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {activeSection === 'pending' &&
            (pending.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending actions — you're all caught up!</p>
              </div>
            ) : (
              pending.map((a) => (
                <ActionRow
                  key={a.id}
                  action={a}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onSnooze={handleSnooze}
                />
              ))
            ))}

          {activeSection === 'recommendations' &&
            (recommendations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Zap size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active recommendations</p>
              </div>
            ) : (
              recommendations.map((r) => (
                <RecommendationCard key={r.id} rec={r} onDismiss={handleDismissRecommendation} />
              ))
            ))}

          {activeSection === 'completed' &&
            completed.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                onApprove={handleApprove}
                onReject={handleReject}
                onSnooze={handleSnooze}
              />
            ))}

          {activeSection === 'history' &&
            history.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                onApprove={handleApprove}
                onReject={handleReject}
                onSnooze={handleSnooze}
              />
            ))}
        </div>
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
