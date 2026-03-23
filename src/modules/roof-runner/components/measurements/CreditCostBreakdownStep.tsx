import { useState } from 'react';
import { ArrowLeft, ArrowRight, Receipt } from 'lucide-react';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import { useReadinessCheck } from '../../hooks/useReadinessCheck';
import { useEnvironment } from '../../hooks/useEnvironment';
import { CreditBalanceCard } from './CreditBalanceCard';
import { CreditBreakdownTable } from './CreditBreakdownTable';
import { InsufficientCreditsBanner } from './InsufficientCreditsBanner';
import { MissingMappingWarning } from './MissingMappingWarning';
import { EagleViewModeNotice } from './EagleViewModeNotice';
import PromoCodeInput from './PromoCodeInput';
import ReadinessSummary from './ReadinessSummary';
import ReadinessPanel from './ReadinessPanel';

interface CreditCostBreakdownStepProps {
  onBack: () => void;
  onContinue: () => void;
}

export function CreditCostBreakdownStep({ onBack, onContinue }: CreditCostBreakdownStepProps) {
  const {
    accountMode,
    creditBalance,
    isLoadingCredits,
    error,
    creditBreakdown,
    creditEligibility,
    refreshCreditBalance,
    promoResult,
    promoStatus,
    adjustedCreditTotal,
  } = useMeasurementOrderContext();

  const { isNonProduction } = useEnvironment();
  const [showReadinessPanel, setShowReadinessPanel] = useState(isNonProduction);

  const {
    readinessResult,
    overallStatus,
    blockingChecks,
    warningChecks,
    canProceed,
    checksByCategory,
    fixActions,
    executeFixAction,
  } = useReadinessCheck({
    onNavigateToAccountMode: onBack,
    onNavigateToProductSelection: onBack,
  });

  const isEagleViewMode = accountMode === 'eagleview';
  const hasLoadError = error !== null && error.includes('credit');
  const showInsufficientBanner = !isEagleViewMode && !creditEligibility.sufficient && creditEligibility.shortage > 0;
  const showMissingWarning = !isEagleViewMode && creditBreakdown.missingMappings.length > 0;

  const hasValidPromo = promoStatus === 'valid' && promoResult?.isValid;
  const promoDiscount = hasValidPromo ? promoResult.calculatedDiscount : 0;

  if (!accountMode) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please select an account mode first.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go back to account selection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to product selection
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Credit Cost Breakdown
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review the credit cost for your selected products
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {isEagleViewMode ? (
            <EagleViewModeNotice />
          ) : (
            <>
              <CreditBalanceCard
                balance={creditBalance?.balance ?? null}
                isLoading={isLoadingCredits}
                hasError={hasLoadError}
                shortage={creditEligibility.shortage}
                onRefresh={refreshCreditBalance}
              />

              {showInsufficientBanner && (
                <InsufficientCreditsBanner shortage={creditEligibility.shortage} />
              )}

              {showMissingWarning && (
                <MissingMappingWarning missingItems={creditBreakdown.missingMappings} />
              )}
            </>
          )}

          <CreditBreakdownTable
            items={creditBreakdown.items}
            totalCredits={creditBreakdown.totalCredits}
            promoDiscount={promoDiscount}
            adjustedTotal={adjustedCreditTotal}
            promoName={hasValidPromo ? promoResult.name : undefined}
          />

          {!isEagleViewMode && (
            <PromoCodeInput className="mt-4" />
          )}

          <div className="mt-6 space-y-3">
            <ReadinessSummary
              overallStatus={overallStatus}
              blockingCount={blockingChecks.length}
              warningCount={warningChecks.length}
              onTogglePanel={() => setShowReadinessPanel(!showReadinessPanel)}
              showToggle={true}
            />

            {showReadinessPanel && (
              <ReadinessPanel
                checks={readinessResult.checks}
                checksByCategory={checksByCategory}
                fixActions={fixActions}
                onExecuteAction={executeFixAction}
                isExpanded={showReadinessPanel}
                onToggleExpanded={() => setShowReadinessPanel(!showReadinessPanel)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              canProceed
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Order
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
