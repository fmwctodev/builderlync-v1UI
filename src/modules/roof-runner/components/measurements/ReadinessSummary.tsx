import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import type { ReadinessStatus } from '../../types/readiness';

interface ReadinessSummaryProps {
  overallStatus: ReadinessStatus;
  blockingCount: number;
  warningCount: number;
  onTogglePanel?: () => void;
  showToggle?: boolean;
  className?: string;
}

const ReadinessSummary: React.FC<ReadinessSummaryProps> = ({
  overallStatus,
  blockingCount,
  warningCount,
  onTogglePanel,
  showToggle = true,
  className = '',
}) => {
  const statusConfig = {
    PASS: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      message: 'Ready to Place Order',
    },
    WARN: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
      message: `${warningCount} warning${warningCount !== 1 ? 's' : ''} present`,
    },
    FAIL: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      message: `${blockingCount} issue${blockingCount !== 1 ? 's' : ''} require attention`,
    },
  };

  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`font-medium text-sm ${config.textColor}`}>
          {config.message}
        </span>
      </div>
      {showToggle && onTogglePanel && (
        <button
          onClick={onTogglePanel}
          className={`text-xs font-medium ${config.textColor} hover:underline flex items-center gap-1`}
        >
          View checks
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default ReadinessSummary;
