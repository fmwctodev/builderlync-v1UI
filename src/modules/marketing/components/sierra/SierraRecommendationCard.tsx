import React from 'react';
import { CheckCircle, XCircle, Clock, Zap, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import type { SierraRecommendation, RecommendationType } from '../../types/marketing';

const typeConfig: Record<RecommendationType, { icon: React.ReactNode; color: string; bg: string }> = {
  budget_shift: { icon: <TrendingUp size={14} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  campaign_launch: { icon: <Zap size={14} />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  campaign_pause: { icon: <AlertTriangle size={14} />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  funnel_fix: { icon: <AlertTriangle size={14} />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  followup_reactivation: { icon: <RefreshCw size={14} />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  content_suggestion: { icon: <Zap size={14} />, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  attribution_issue: { icon: <AlertTriangle size={14} />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  tracking_issue: { icon: <AlertTriangle size={14} />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  storm_response: { icon: <Zap size={14} />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  stale_estimate: { icon: <RefreshCw size={14} />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
};

interface SierraRecommendationCardProps {
  recommendation: SierraRecommendation;
  onApprove?: (id: string) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export const SierraRecommendationCard: React.FC<SierraRecommendationCardProps> = ({
  recommendation: rec,
  onApprove,
  onDismiss,
  compact = false,
}) => {
  const config = typeConfig[rec.type] ?? typeConfig.budget_shift;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{rec.title}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${rec.confidence_score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
              {rec.confidence_score}%
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{rec.rationale}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{rec.expected_impact}</span>
          </div>
          {(onApprove || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onApprove && (
                <button
                  onClick={() => onApprove(rec.id)}
                  className="flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <CheckCircle size={11} />
                  Approve
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(rec.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1.5 transition-colors"
                >
                  <XCircle size={11} />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
