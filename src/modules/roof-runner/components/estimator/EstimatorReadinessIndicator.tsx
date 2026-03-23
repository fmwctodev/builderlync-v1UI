import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { EstimatorReadinessStatus } from '../../types/estimatorReadiness';

interface EstimatorReadinessIndicatorProps {
  status: EstimatorReadinessStatus;
  passCount: number;
  warnCount: number;
  failCount: number;
  infoCount: number;
  onTogglePanel: () => void;
  isPanelExpanded: boolean;
}

const statusConfig: Record<EstimatorReadinessStatus, {
  icon: typeof CheckCircle;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}> = {
  PASS: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'Ready',
  },
  WARN: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    label: 'Warnings',
  },
  FAIL: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Action Required',
  },
  INFO: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Info',
  },
};

export function EstimatorReadinessIndicator({
  status,
  passCount,
  warnCount,
  failCount,
  onTogglePanel,
  isPanelExpanded,
}: EstimatorReadinessIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={onTogglePanel}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
        ${config.bgColor} ${config.borderColor}
        hover:shadow-sm cursor-pointer
      `}
    >
      <Icon className={`w-4 h-4 ${config.textColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
      <div className="flex items-center gap-1 ml-1 text-xs">
        {passCount > 0 && (
          <span className="text-green-600 dark:text-green-400">{passCount}</span>
        )}
        {warnCount > 0 && (
          <span className="text-amber-600 dark:text-amber-400">/{warnCount}</span>
        )}
        {failCount > 0 && (
          <span className="text-red-600 dark:text-red-400">/{failCount}</span>
        )}
      </div>
      {isPanelExpanded ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}
