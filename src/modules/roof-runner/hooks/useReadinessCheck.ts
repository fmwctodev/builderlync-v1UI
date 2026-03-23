import { useMemo, useCallback } from 'react';
import { useMeasurementOrderContext } from '../context/MeasurementOrderContext';
import { useEnvironment } from './useEnvironment';
import { evaluateReadiness, getChecksByCategory } from '../services/readinessEvaluator';
import type {
  ReadinessResult,
  ReadinessStatus,
  CheckResult,
  ReadinessEvaluationContext,
  PaymentInfoInput,
  FixAction,
  ReadinessCheckCategory,
} from '../types/readiness';

interface UseReadinessCheckOptions {
  includePaymentValidation?: boolean;
  paymentInfo?: PaymentInfoInput | null;
  isCheckoutPage?: boolean;
  onNavigateToAccountMode?: () => void;
  onNavigateToProductSelection?: () => void;
  onExitUpgradeMode?: () => void;
  onBuyCredits?: () => void;
  onRefreshCredits?: () => void;
  onScrollToPayment?: () => void;
}

interface UseReadinessCheckReturn {
  readinessResult: ReadinessResult;
  overallStatus: ReadinessStatus;
  blockingChecks: CheckResult[];
  warningChecks: CheckResult[];
  passingChecks: CheckResult[];
  canProceed: boolean;
  checksByCategory: Record<ReadinessCheckCategory, CheckResult[]>;
  fixActions: Record<string, FixAction>;
  executeFixAction: (actionId: string) => void;
  hasBlockingIssues: boolean;
  hasWarnings: boolean;
  isFullyReady: boolean;
}

const BUY_CREDITS_PLACEHOLDER_URL = '#stripe-credits-page';

export function useReadinessCheck(
  options: UseReadinessCheckOptions = {}
): UseReadinessCheckReturn {
  const {
    accountMode,
    selectedProducts,
    selectedAddOns,
    isUpgradeFlow,
    upgradeFromProductId,
    creditEligibility,
    promoStatus,
    promoResult,
    clearPromoCode,
    refreshCreditBalance,
    exitUpgradeMode,
  } = useMeasurementOrderContext();

  const { isNonProduction } = useEnvironment();

  const context: ReadinessEvaluationContext = useMemo(() => ({
    includePaymentValidation: options.includePaymentValidation,
    paymentInfo: options.paymentInfo,
    isCheckoutPage: options.isCheckoutPage,
  }), [options.includePaymentValidation, options.paymentInfo, options.isCheckoutPage]);

  const readinessResult = useMemo(() => {
    return evaluateReadiness(
      {
        accountMode,
        selectedProducts,
        selectedAddOns,
        isUpgradeFlow,
        upgradeFromProductId,
        creditEligibility,
        promoStatus,
        promoResult,
        isNonProduction,
      },
      context
    );
  }, [
    accountMode,
    selectedProducts,
    selectedAddOns,
    isUpgradeFlow,
    upgradeFromProductId,
    creditEligibility,
    promoStatus,
    promoResult,
    isNonProduction,
    context,
  ]);

  const checksByCategory = useMemo(() => {
    return getChecksByCategory(readinessResult.checks);
  }, [readinessResult.checks]);

  const fixActions = useMemo<Record<string, FixAction>>(() => {
    return {
      navigate_account_mode: {
        id: 'navigate_account_mode',
        type: 'callback',
        label: 'Select Account Mode',
        callback: options.onNavigateToAccountMode,
      },
      navigate_product_selection: {
        id: 'navigate_product_selection',
        type: 'callback',
        label: 'Select Products',
        callback: options.onNavigateToProductSelection,
      },
      exit_upgrade_mode: {
        id: 'exit_upgrade_mode',
        type: 'callback',
        label: 'Exit Upgrade Mode',
        callback: options.onExitUpgradeMode || exitUpgradeMode,
      },
      buy_credits: {
        id: 'buy_credits',
        type: 'external_link',
        label: 'Buy Credits',
        target: BUY_CREDITS_PLACEHOLDER_URL,
        callback: options.onBuyCredits,
      },
      refresh_credits: {
        id: 'refresh_credits',
        type: 'callback',
        label: 'Refresh Balance',
        callback: options.onRefreshCredits || refreshCreditBalance,
      },
      clear_promo: {
        id: 'clear_promo',
        type: 'callback',
        label: 'Remove Promo Code',
        callback: clearPromoCode,
      },
      scroll_to_payment: {
        id: 'scroll_to_payment',
        type: 'callback',
        label: 'Complete Payment Info',
        callback: options.onScrollToPayment,
      },
    };
  }, [
    options.onNavigateToAccountMode,
    options.onNavigateToProductSelection,
    options.onExitUpgradeMode,
    options.onBuyCredits,
    options.onRefreshCredits,
    options.onScrollToPayment,
    exitUpgradeMode,
    refreshCreditBalance,
    clearPromoCode,
  ]);

  const executeFixAction = useCallback((actionId: string) => {
    const action = fixActions[actionId];
    if (!action) return;

    if (action.type === 'external_link' && action.target) {
      if (action.callback) {
        action.callback();
      } else {
        window.open(action.target, '_blank');
      }
    } else if (action.callback) {
      action.callback();
    }
  }, [fixActions]);

  return {
    readinessResult,
    overallStatus: readinessResult.overallStatus,
    blockingChecks: readinessResult.blockingChecks,
    warningChecks: readinessResult.warningChecks,
    passingChecks: readinessResult.passingChecks,
    canProceed: readinessResult.canProceed,
    checksByCategory,
    fixActions,
    executeFixAction,
    hasBlockingIssues: readinessResult.blockingChecks.length > 0,
    hasWarnings: readinessResult.warningChecks.length > 0,
    isFullyReady: readinessResult.overallStatus === 'PASS',
  };
}
