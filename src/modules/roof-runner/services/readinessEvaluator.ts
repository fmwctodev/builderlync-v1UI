import type {
  CheckResult,
  ReadinessResult,
  ReadinessEvaluationContext,
  ReadinessCheckCategory,
} from '../types/readiness';
import {
  READINESS_CHECK_LABELS,
  READINESS_CHECK_CATEGORIES,
  computeOverallStatus,
  canProceedWithChecks,
} from '../types/readiness';
import type { AccountMode, CreditEligibility, ProductId, AddOnId } from '../types/measurementOrder';
import type { PromoCodeStatus, PromoCodeResult } from '../types/promoCode';
import { validatePaymentInfo, isPaymentInfoComplete } from '../utils/paymentValidation';

interface EvaluationState {
  accountMode: AccountMode | null;
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  isUpgradeFlow: boolean;
  upgradeFromProductId: string | null;
  creditEligibility: CreditEligibility;
  promoStatus: PromoCodeStatus;
  promoResult: PromoCodeResult | null;
  isNonProduction: boolean;
}

export function checkAccountModeSelected(accountMode: AccountMode | null): CheckResult {
  const id = 'account_mode';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (!accountMode) {
    return {
      id,
      label,
      status: 'FAIL',
      message: 'No account mode selected',
      blocking: true,
      fixHint: 'Select either Credits or EagleView Direct mode',
      fixActionId: 'navigate_account_mode',
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: accountMode === 'credits' ? 'Using Credits' : 'Using EagleView Direct',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkProductSelectionValid(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[]
): CheckResult {
  const id = 'product_selection';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (selectedProducts.length === 0) {
    return {
      id,
      label,
      status: 'FAIL',
      message: 'No products selected',
      blocking: true,
      fixHint: 'Select at least one measurement product',
      fixActionId: 'navigate_product_selection',
      category,
    };
  }

  const totalItems = selectedProducts.length + selectedAddOns.length;
  const addOnText = selectedAddOns.length > 0 ? ` + ${selectedAddOns.length} add-on(s)` : '';

  return {
    id,
    label,
    status: 'PASS',
    message: `${selectedProducts.length} product(s) selected${addOnText}`,
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkUpgradeFlowValid(
  isUpgradeFlow: boolean,
  upgradeFromProductId: string | null,
  selectedProducts: ProductId[]
): CheckResult {
  const id = 'upgrade_flow';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (!isUpgradeFlow) {
    return {
      id,
      label,
      status: 'PASS',
      message: 'Standard order flow',
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (!upgradeFromProductId) {
    return {
      id,
      label,
      status: 'FAIL',
      message: 'Upgrade source order not specified',
      blocking: true,
      fixHint: 'Exit upgrade mode and start a new order',
      fixActionId: 'exit_upgrade_mode',
      category,
    };
  }

  if (!selectedProducts.includes('measure_premium')) {
    return {
      id,
      label,
      status: 'FAIL',
      message: 'Upgrade target product not selected',
      blocking: true,
      fixHint: 'Premium product must be selected for upgrade',
      fixActionId: null,
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: 'Upgrading from BidPerfect to Premium',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkCreditSufficiency(
  accountMode: AccountMode | null,
  creditEligibility: CreditEligibility
): CheckResult {
  const id = 'credit_sufficiency';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (accountMode !== 'credits') {
    return {
      id,
      label,
      status: 'PASS',
      message: 'Not applicable (EagleView Direct)',
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (creditEligibility.hasLoadError) {
    return {
      id,
      label,
      status: 'WARN',
      message: 'Unable to verify credit balance',
      blocking: false,
      fixHint: 'Refresh the page to retry loading credits',
      fixActionId: 'refresh_credits',
      category,
    };
  }

  if (creditEligibility.hasMissingMappings) {
    return {
      id,
      label,
      status: 'WARN',
      message: 'Some products have unknown credit costs',
      blocking: false,
      fixHint: 'Contact support if this persists',
      fixActionId: null,
      category,
    };
  }

  if (!creditEligibility.sufficient) {
    return {
      id,
      label,
      status: 'FAIL',
      message: `Insufficient credits (need ${creditEligibility.shortage} more)`,
      blocking: true,
      fixHint: 'Purchase additional credits to continue',
      fixActionId: 'buy_credits',
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: 'Sufficient credits available',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkPromoEligibility(
  promoStatus: PromoCodeStatus,
  promoResult: PromoCodeResult | null
): CheckResult {
  const id = 'promo_eligibility';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (promoStatus === 'idle') {
    return {
      id,
      label,
      status: 'PASS',
      message: 'No promo code applied',
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (promoStatus === 'validating') {
    return {
      id,
      label,
      status: 'WARN',
      message: 'Validating promo code...',
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (promoStatus === 'valid' && promoResult?.isValid) {
    return {
      id,
      label,
      status: 'PASS',
      message: `Promo applied: ${promoResult.calculatedDiscount} credits off`,
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (promoStatus === 'invalid' || promoStatus === 'error') {
    return {
      id,
      label,
      status: 'WARN',
      message: promoResult?.errorMessage || 'Promo code validation failed',
      blocking: false,
      fixHint: 'Remove the invalid promo code or try a different one',
      fixActionId: 'clear_promo',
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: 'Promo code status OK',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkEnvironmentBanner(isNonProduction: boolean): CheckResult {
  const id = 'environment_banner';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (isNonProduction) {
    return {
      id,
      label,
      status: 'WARN',
      message: 'Running in non-production environment',
      blocking: false,
      fixHint: 'Orders placed here may use test/sandbox APIs',
      fixActionId: null,
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: 'Production environment',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function checkPaymentInfoComplete(
  context: ReadinessEvaluationContext
): CheckResult {
  const id = 'payment_info';
  const label = READINESS_CHECK_LABELS[id];
  const category = READINESS_CHECK_CATEGORIES[id];

  if (!context.isCheckoutPage || !context.includePaymentValidation) {
    return {
      id,
      label,
      status: 'PASS',
      message: 'Not required at this step',
      blocking: false,
      fixHint: null,
      fixActionId: null,
      category,
    };
  }

  if (!context.paymentInfo) {
    return {
      id,
      label,
      status: 'FAIL',
      message: 'Payment information not provided',
      blocking: true,
      fixHint: 'Complete all payment fields to continue',
      fixActionId: 'scroll_to_payment',
      category,
    };
  }

  const validation = validatePaymentInfo(context.paymentInfo);

  if (!validation.isValid) {
    const errorCount = Object.keys(validation.errors).length;
    return {
      id,
      label,
      status: 'FAIL',
      message: `${errorCount} payment field(s) need attention`,
      blocking: true,
      fixHint: 'Fix the highlighted payment fields',
      fixActionId: 'scroll_to_payment',
      category,
    };
  }

  return {
    id,
    label,
    status: 'PASS',
    message: 'Payment information complete',
    blocking: false,
    fixHint: null,
    fixActionId: null,
    category,
  };
}

export function evaluateReadiness(
  state: EvaluationState,
  context: ReadinessEvaluationContext = {}
): ReadinessResult {
  const checks: CheckResult[] = [];

  checks.push(checkAccountModeSelected(state.accountMode));
  checks.push(checkProductSelectionValid(state.selectedProducts, state.selectedAddOns));
  checks.push(checkUpgradeFlowValid(
    state.isUpgradeFlow,
    state.upgradeFromProductId,
    state.selectedProducts
  ));

  if (state.accountMode === 'credits') {
    checks.push(checkCreditSufficiency(state.accountMode, state.creditEligibility));
    checks.push(checkPromoEligibility(state.promoStatus, state.promoResult));
  }

  checks.push(checkEnvironmentBanner(state.isNonProduction));

  if (context.includePaymentValidation) {
    checks.push(checkPaymentInfoComplete(context));
  }

  const overallStatus = computeOverallStatus(checks);
  const canProceed = canProceedWithChecks(checks);

  const blockingChecks = checks.filter((c) => c.status === 'FAIL' && c.blocking);
  const warningChecks = checks.filter((c) => c.status === 'WARN');
  const passingChecks = checks.filter((c) => c.status === 'PASS');

  return {
    overallStatus,
    checks,
    blockingChecks,
    warningChecks,
    passingChecks,
    canProceed,
  };
}

export function getChecksByCategory(
  checks: CheckResult[]
): Record<ReadinessCheckCategory, CheckResult[]> {
  return {
    core: checks.filter((c) => c.category === 'core'),
    pricing: checks.filter((c) => c.category === 'pricing'),
    informational: checks.filter((c) => c.category === 'informational'),
  };
}
