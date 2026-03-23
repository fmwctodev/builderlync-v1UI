import { useState, useMemo } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Link as LinkIcon,
} from 'lucide-react';

interface ProposalLineItem {
  id: string;
  name: string;
  source_tag: 'instant_estimator' | 'manual';
  quantity: number;
  unit_price: number;
  catalog_sku: string | null;
}

interface ProposalEstimatorValidationProps {
  proposalId: string;
  estimateSnapshotId: string | null;
  lineItems: ProposalLineItem[];
  isEstimatorLinked: boolean;
}

type ValidationStatus = 'PASS' | 'WARN' | 'FAIL';

interface ValidationCheck {
  id: string;
  label: string;
  status: ValidationStatus;
  message: string;
  fixHint: string | null;
}

function evaluateProposalValidation(
  estimateSnapshotId: string | null,
  lineItems: ProposalLineItem[]
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  if (!estimateSnapshotId) {
    checks.push({
      id: 'snapshot_link',
      label: 'Estimate Snapshot',
      status: 'FAIL',
      message: 'No estimate snapshot linked',
      fixHint: 'This proposal was not created from Instant Estimator',
    });
  } else {
    checks.push({
      id: 'snapshot_link',
      label: 'Estimate Snapshot',
      status: 'PASS',
      message: 'Linked to estimate snapshot',
      fixHint: null,
    });
  }

  const estimatorLineItems = lineItems.filter(
    (item) => item.source_tag === 'instant_estimator'
  );

  if (estimatorLineItems.length === 0) {
    checks.push({
      id: 'line_items_mapped',
      label: 'Line Item Mapping',
      status: 'FAIL',
      message: 'No estimator-linked line items found',
      fixHint: 'Add materials from the estimate or add line items manually',
    });
  } else {
    const hasShingles = estimatorLineItems.some(
      (item) => item.catalog_sku?.includes('shingle') || item.name.toLowerCase().includes('shingle')
    );
    const hasUnderlayment = estimatorLineItems.some(
      (item) => item.catalog_sku?.includes('underlayment') || item.name.toLowerCase().includes('underlayment')
    );

    if (!hasShingles || !hasUnderlayment) {
      const missing = [];
      if (!hasShingles) missing.push('shingles');
      if (!hasUnderlayment) missing.push('underlayment');

      checks.push({
        id: 'line_items_mapped',
        label: 'Line Item Mapping',
        status: 'WARN',
        message: `${estimatorLineItems.length} item(s) mapped, missing: ${missing.join(', ')}`,
        fixHint: 'Add missing required line items',
      });
    } else {
      checks.push({
        id: 'line_items_mapped',
        label: 'Line Item Mapping',
        status: 'PASS',
        message: `${estimatorLineItems.length} estimator-linked item(s) mapped`,
        fixHint: null,
      });
    }
  }

  if (estimatorLineItems.length > 0) {
    const missingPricing = estimatorLineItems.filter(
      (item) => !item.unit_price || item.unit_price <= 0
    );

    if (missingPricing.length > 0) {
      checks.push({
        id: 'pricing_complete',
        label: 'Pricing Completeness',
        status: 'WARN',
        message: `${missingPricing.length} item(s) missing pricing`,
        fixHint: 'Assign prices in catalog or enter unit prices',
      });
    } else {
      checks.push({
        id: 'pricing_complete',
        label: 'Pricing Completeness',
        status: 'PASS',
        message: 'All estimator items have pricing',
        fixHint: null,
      });
    }
  }

  return checks;
}

function getOverallStatus(checks: ValidationCheck[]): ValidationStatus {
  const hasFail = checks.some((c) => c.status === 'FAIL');
  if (hasFail) return 'FAIL';

  const hasWarn = checks.some((c) => c.status === 'WARN');
  if (hasWarn) return 'WARN';

  return 'PASS';
}

const statusIcons: Record<ValidationStatus, typeof CheckCircle> = {
  PASS: CheckCircle,
  WARN: AlertTriangle,
  FAIL: XCircle,
};

const statusColors: Record<ValidationStatus, string> = {
  PASS: 'text-green-600 dark:text-green-400',
  WARN: 'text-amber-600 dark:text-amber-400',
  FAIL: 'text-red-600 dark:text-red-400',
};

const statusBgColors: Record<ValidationStatus, string> = {
  PASS: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  WARN: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  FAIL: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
};

export function ProposalEstimatorValidation({
  proposalId,
  estimateSnapshotId,
  lineItems,
  isEstimatorLinked,
}: ProposalEstimatorValidationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const checks = useMemo(
    () => evaluateProposalValidation(estimateSnapshotId, lineItems),
    [estimateSnapshotId, lineItems]
  );

  const overallStatus = useMemo(() => getOverallStatus(checks), [checks]);

  if (!isEstimatorLinked) {
    return null;
  }

  const StatusIcon = statusIcons[overallStatus];
  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const warnCount = checks.filter((c) => c.status === 'WARN').length;
  const failCount = checks.filter((c) => c.status === 'FAIL').length;

  return (
    <div className={`rounded-lg border ${statusBgColors[overallStatus]} mb-4`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <LinkIcon className={`w-4 h-4 ${statusColors[overallStatus]}`} />
          <span className="font-medium text-gray-900 dark:text-white">
            Estimator-Linked Proposal Checks
          </span>
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
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
          {checks.map((check) => {
            const Icon = statusIcons[check.status];
            const colorClass = statusColors[check.status];

            return (
              <div
                key={check.id}
                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {check.label}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {check.message}
                  </p>
                  {check.fixHint && check.status !== 'PASS' && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                      {check.fixHint}
                    </p>
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
