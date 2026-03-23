export type ReadinessStatus = 'PASS' | 'WARN' | 'FAIL';

export type ReadinessCheckId =
  | 'account_mode'
  | 'product_selection'
  | 'upgrade_flow'
  | 'credit_sufficiency'
  | 'promo_eligibility'
  | 'output_availability'
  | 'environment_banner'
  | 'payment_info';

export type ReadinessCheckCategory = 'core' | 'pricing' | 'informational';

export interface CheckResult {
  id: ReadinessCheckId;
  label: string;
  status: ReadinessStatus;
  message: string;
  blocking: boolean;
  fixHint: string | null;
  fixActionId: string | null;
  category: ReadinessCheckCategory;
}

export interface ReadinessResult {
  overallStatus: ReadinessStatus;
  checks: CheckResult[];
  blockingChecks: CheckResult[];
  warningChecks: CheckResult[];
  passingChecks: CheckResult[];
  canProceed: boolean;
}

export type FixActionType = 'navigate' | 'callback' | 'external_link';

export interface FixAction {
  id: string;
  type: FixActionType;
  label: string;
  target?: string;
  callback?: () => void;
}

export interface ReadinessEvaluationContext {
  includePaymentValidation?: boolean;
  paymentInfo?: PaymentInfoInput | null;
  isCheckoutPage?: boolean;
}

export interface PaymentInfoInput {
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
}

export const READINESS_CHECK_LABELS: Record<ReadinessCheckId, string> = {
  account_mode: 'Account Mode',
  product_selection: 'Product Selection',
  upgrade_flow: 'Upgrade Configuration',
  credit_sufficiency: 'Credit Balance',
  promo_eligibility: 'Promo Code',
  output_availability: 'Report Outputs',
  environment_banner: 'Environment',
  payment_info: 'Payment Information',
};

export const READINESS_CHECK_CATEGORIES: Record<ReadinessCheckId, ReadinessCheckCategory> = {
  account_mode: 'core',
  product_selection: 'core',
  upgrade_flow: 'core',
  credit_sufficiency: 'pricing',
  promo_eligibility: 'pricing',
  output_availability: 'informational',
  environment_banner: 'informational',
  payment_info: 'core',
};

export function computeOverallStatus(checks: CheckResult[]): ReadinessStatus {
  const hasFailure = checks.some((c) => c.status === 'FAIL' && c.blocking);
  if (hasFailure) return 'FAIL';

  const hasWarning = checks.some((c) => c.status === 'WARN');
  if (hasWarning) return 'WARN';

  return 'PASS';
}

export function canProceedWithChecks(checks: CheckResult[]): boolean {
  return !checks.some((c) => c.status === 'FAIL' && c.blocking);
}
