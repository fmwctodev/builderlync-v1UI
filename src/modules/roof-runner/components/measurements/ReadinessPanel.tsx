import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReadinessCheckItem from './ReadinessCheckItem';
import type { CheckResult, FixAction, ReadinessCheckCategory } from '../../types/readiness';

interface ReadinessPanelProps {
  checks: CheckResult[];
  checksByCategory: Record<ReadinessCheckCategory, CheckResult[]>;
  fixActions: Record<string, FixAction>;
  onExecuteAction: (actionId: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  showCategoryHeaders?: boolean;
}

const CATEGORY_LABELS: Record<ReadinessCheckCategory, string> = {
  core: 'Core Requirements',
  pricing: 'Pricing & Credits',
  informational: 'Information',
};

const ReadinessPanel: React.FC<ReadinessPanelProps> = ({
  checks,
  checksByCategory,
  fixActions,
  onExecuteAction,
  isExpanded,
  onToggleExpanded,
  showCategoryHeaders = true,
}) => {
  const blockingCount = checks.filter((c) => c.status === 'FAIL' && c.blocking).length;
  const warningCount = checks.filter((c) => c.status === 'WARN').length;
  const passCount = checks.filter((c) => c.status === 'PASS').length;

  const renderCategorySection = (category: ReadinessCheckCategory, categoryChecks: CheckResult[]) => {
    if (categoryChecks.length === 0) return null;

    return (
      <div key={category} className="space-y-2">
        {showCategoryHeaders && (
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {CATEGORY_LABELS[category]}
          </h4>
        )}
        {categoryChecks.map((check) => (
          <ReadinessCheckItem
            key={check.id}
            check={check}
            fixAction={check.fixActionId ? fixActions[check.fixActionId] : undefined}
            onExecuteAction={onExecuteAction}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggleExpanded}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            Readiness Checklist
          </span>
          <div className="flex items-center gap-2">
            {blockingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                {blockingCount} blocking
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
            {blockingCount === 0 && warningCount === 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                {passCount} passed
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {renderCategorySection('core', checksByCategory.core)}
          {renderCategorySection('pricing', checksByCategory.pricing)}
          {renderCategorySection('informational', checksByCategory.informational)}
        </div>
      )}
    </div>
  );
};

export default ReadinessPanel;
