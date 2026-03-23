import { useState, useCallback } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Wrench,
  X,
} from 'lucide-react';
import type {
  EstimatorCheckResult,
  EstimatorCheckCategory,
  EstimatorReadinessStatus,
} from '../../types/estimatorReadiness';

interface EstimatorReadinessPanelProps {
  checks: EstimatorCheckResult[];
  checksByCategory: Record<EstimatorCheckCategory, EstimatorCheckResult[]>;
  overallStatus: EstimatorReadinessStatus;
  canGenerateEstimate: boolean;
  canCreateProposal: boolean;
  isNonProduction: boolean;
  onClose?: () => void;
  onFixAction: (actionId: string) => void;
  fixActions: Record<string, { id: string; label: string; callback?: () => void }>;
  onRunQATest?: () => void;
  isQATestRunning?: boolean;
}

const statusIcons: Record<EstimatorReadinessStatus, typeof CheckCircle> = {
  PASS: CheckCircle,
  WARN: AlertTriangle,
  FAIL: XCircle,
  INFO: Info,
};

const statusColors: Record<EstimatorReadinessStatus, string> = {
  PASS: 'text-green-600 dark:text-green-400',
  WARN: 'text-amber-600 dark:text-amber-400',
  FAIL: 'text-red-600 dark:text-red-400',
  INFO: 'text-blue-600 dark:text-blue-400',
};

const statusBgColors: Record<EstimatorReadinessStatus, string> = {
  PASS: 'bg-green-50 dark:bg-green-900/20',
  WARN: 'bg-amber-50 dark:bg-amber-900/20',
  FAIL: 'bg-red-50 dark:bg-red-900/20',
  INFO: 'bg-blue-50 dark:bg-blue-900/20',
};

const categoryLabels: Record<EstimatorCheckCategory, string> = {
  core: 'Core Requirements',
  data: 'Data & Calculations',
  proposal: 'Proposal Integration',
  informational: 'Information',
};

function CheckItem({
  check,
  onFix,
  fixLabel,
}: {
  check: EstimatorCheckResult;
  onFix?: () => void;
  fixLabel?: string;
}) {
  const Icon = statusIcons[check.status];
  const colorClass = statusColors[check.status];
  const bgClass = statusBgColors[check.status];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${bgClass}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {check.label}
          </span>
          {check.blocking && check.status === 'FAIL' && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
              Blocking
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {check.message}
        </p>
        {check.fixHint && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
            {check.fixHint}
          </p>
        )}
      </div>
      {onFix && fixLabel && (
        <button
          onClick={onFix}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Wrench className="w-3 h-3" />
          {fixLabel}
        </button>
      )}
    </div>
  );
}

function CategorySection({
  category,
  checks,
  onFixAction,
  fixActions,
  defaultExpanded = true,
}: {
  category: EstimatorCheckCategory;
  checks: EstimatorCheckResult[];
  onFixAction: (actionId: string) => void;
  fixActions: Record<string, { id: string; label: string; callback?: () => void }>;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (checks.length === 0) return null;

  const failCount = checks.filter((c) => c.status === 'FAIL').length;
  const warnCount = checks.filter((c) => c.status === 'WARN').length;
  const passCount = checks.filter((c) => c.status === 'PASS').length;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {categoryLabels[category]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {passCount > 0 && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              {passCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {warnCount}
            </span>
          )}
          {failCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <XCircle className="w-3 h-3" />
              {failCount}
            </span>
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {checks.map((check) => {
            const fixAction = check.fixActionId ? fixActions[check.fixActionId] : null;
            return (
              <CheckItem
                key={check.id}
                check={check}
                onFix={fixAction?.callback ? () => onFixAction(check.fixActionId!) : undefined}
                fixLabel={fixAction?.label}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EstimatorReadinessPanel({
  checks,
  checksByCategory,
  overallStatus,
  canGenerateEstimate,
  canCreateProposal,
  isNonProduction,
  onClose,
  onFixAction,
  fixActions,
  onRunQATest,
  isQATestRunning,
}: EstimatorReadinessPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Estimator Readiness Checks
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full ${
              overallStatus === 'PASS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              overallStatus === 'WARN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {overallStatus === 'PASS' ? 'All Checks Pass' :
               overallStatus === 'WARN' ? 'Has Warnings' :
               'Action Required'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isNonProduction && onRunQATest && (
            <button
              onClick={onRunQATest}
              disabled={isQATestRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isQATestRunning ? (
                <>
                  <span className="animate-spin">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                  Running QA Test...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Run QA Test
                </>
              )}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Generate Estimate:</span>
            {canGenerateEstimate ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                Blocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Create Proposal:</span>
            {canCreateProposal ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                Blocked
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <CategorySection
          category="core"
          checks={checksByCategory.core}
          onFixAction={onFixAction}
          fixActions={fixActions}
          defaultExpanded={true}
        />
        <CategorySection
          category="data"
          checks={checksByCategory.data}
          onFixAction={onFixAction}
          fixActions={fixActions}
          defaultExpanded={checksByCategory.data.some((c) => c.status === 'FAIL' || c.status === 'WARN')}
        />
        <CategorySection
          category="proposal"
          checks={checksByCategory.proposal}
          onFixAction={onFixAction}
          fixActions={fixActions}
          defaultExpanded={checksByCategory.proposal.some((c) => c.status === 'FAIL' || c.status === 'WARN')}
        />
        <CategorySection
          category="informational"
          checks={checksByCategory.informational}
          onFixAction={onFixAction}
          fixActions={fixActions}
          defaultExpanded={false}
        />
      </div>
    </div>
  );
}
