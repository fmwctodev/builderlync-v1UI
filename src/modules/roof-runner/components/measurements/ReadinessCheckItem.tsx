import React from 'react';
import { Check, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import type { CheckResult, FixAction } from '../../types/readiness';

interface ReadinessCheckItemProps {
  check: CheckResult;
  fixAction?: FixAction;
  onExecuteAction?: (actionId: string) => void;
  compact?: boolean;
}

const ReadinessCheckItem: React.FC<ReadinessCheckItemProps> = ({
  check,
  fixAction,
  onExecuteAction,
  compact = false,
}) => {
  const statusConfig = {
    PASS: {
      icon: Check,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      pillBg: 'bg-green-100 dark:bg-green-900/50',
      pillText: 'text-green-700 dark:text-green-300',
    },
    WARN: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
      pillBg: 'bg-amber-100 dark:bg-amber-900/50',
      pillText: 'text-amber-700 dark:text-amber-300',
    },
    FAIL: {
      icon: XCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      pillBg: 'bg-red-100 dark:bg-red-900/50',
      pillText: 'text-red-700 dark:text-red-300',
    },
  };

  const config = statusConfig[check.status];
  const Icon = config.icon;

  const handleActionClick = () => {
    if (fixAction && onExecuteAction) {
      onExecuteAction(fixAction.id);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <Icon className={`w-3 h-3 ${config.iconColor}`} />
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          {check.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.pillBg} ${config.pillText}`}>
          {check.status}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bgColor}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {check.label}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.pillBg} ${config.pillText} font-medium`}>
              {check.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {check.message}
          </p>
          {check.status !== 'PASS' && check.fixHint && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
              {check.fixHint}
            </p>
          )}
          {check.status !== 'PASS' && fixAction && onExecuteAction && (
            <button
              onClick={handleActionClick}
              className="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
            >
              {fixAction.label}
              {fixAction.type === 'external_link' && (
                <ExternalLink className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadinessCheckItem;
