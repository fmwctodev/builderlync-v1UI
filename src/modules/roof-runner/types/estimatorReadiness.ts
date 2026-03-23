export type EstimatorReadinessStatus = 'PASS' | 'WARN' | 'FAIL' | 'INFO';

export type EstimatorCheckId =
  | 'property_selected'
  | 'entitlements_credits'
  | 'charge_once_guard'
  | 'property_data_health'
  | 'imagery_behavior'
  | 'pitch_handling'
  | 'quick_materials_outputs'
  | 'escalate_to_report'
  | 'proposal_snapshot_creation'
  | 'proposal_draft_creation'
  | 'proposal_field_mapping'
  | 'proposal_pricing_completeness'
  | 'environment_banner';

export type EstimatorCheckCategory = 'core' | 'data' | 'proposal' | 'informational';

export interface EstimatorCheckResult {
  id: EstimatorCheckId;
  label: string;
  status: EstimatorReadinessStatus;
  message: string;
  blocking: boolean;
  fixHint: string | null;
  fixActionId: string | null;
  category: EstimatorCheckCategory;
}

export interface EstimatorReadinessResult {
  overallStatus: EstimatorReadinessStatus;
  checks: EstimatorCheckResult[];
  blockingChecks: EstimatorCheckResult[];
  warningChecks: EstimatorCheckResult[];
  passingChecks: EstimatorCheckResult[];
  infoChecks: EstimatorCheckResult[];
  canGenerateEstimate: boolean;
  canCreateProposal: boolean;
}

export const ESTIMATOR_CHECK_LABELS: Record<EstimatorCheckId, string> = {
  property_selected: 'Address / Property',
  entitlements_credits: 'Entitlements & Credits',
  charge_once_guard: 'Charge-Once Guard',
  property_data_health: 'Property Data',
  imagery_behavior: 'Imagery',
  pitch_handling: 'Pitch',
  quick_materials_outputs: 'Quick Materials',
  escalate_to_report: 'Escalate to Report',
  proposal_snapshot_creation: 'Estimate Snapshot',
  proposal_draft_creation: 'Proposal Draft',
  proposal_field_mapping: 'Field Mapping',
  proposal_pricing_completeness: 'Pricing Completeness',
  environment_banner: 'Environment',
};

export const ESTIMATOR_CHECK_CATEGORIES: Record<EstimatorCheckId, EstimatorCheckCategory> = {
  property_selected: 'core',
  entitlements_credits: 'core',
  charge_once_guard: 'core',
  property_data_health: 'data',
  imagery_behavior: 'data',
  pitch_handling: 'data',
  quick_materials_outputs: 'data',
  escalate_to_report: 'data',
  proposal_snapshot_creation: 'proposal',
  proposal_draft_creation: 'proposal',
  proposal_field_mapping: 'proposal',
  proposal_pricing_completeness: 'proposal',
  environment_banner: 'informational',
};

export function computeEstimatorOverallStatus(checks: EstimatorCheckResult[]): EstimatorReadinessStatus {
  const hasBlockingFailure = checks.some((c) => c.status === 'FAIL' && c.blocking);
  if (hasBlockingFailure) return 'FAIL';

  const hasWarning = checks.some((c) => c.status === 'WARN');
  const hasNonBlockingFail = checks.some((c) => c.status === 'FAIL' && !c.blocking);
  if (hasWarning || hasNonBlockingFail) return 'WARN';

  return 'PASS';
}

export interface EstimatorEvaluationState {
  propertyId: string | null;
  addressText: string | null;
  orgPlanTier: 'pro' | 'standard' | null;
  orgCreditBalance: number | null;
  isLoadingOrgContext: boolean;
  hasValidChargeForCurrentProperty: boolean;
  estimateChargeStatus: string;
  estimateChargeError: { message: string; code?: string } | null;
  propertyDataStatus: string;
  propertyDataError: { message: string } | null;
  roofArea: number | null;
  roofAreaOverride: number | null;
  imageryEnabled: boolean;
  imageryStatus: string;
  imageryError: { message: string } | null;
  imageryUrls: string[];
  effectivePitch: number | null;
  isPitchRequiredModalOpen: boolean;
  materialsSummary: MaterialsSummaryForCheck | null;
  isNonProduction: boolean;
  proposalIntegrationState?: ProposalIntegrationState;
}

export interface MaterialsSummaryForCheck {
  shingleBundles: number | null;
  underlaymentRolls: number | null;
  ridgeCapBundles: number | null;
  starterStripBundles: number | null;
  ventCount: number | null;
}

export interface ProposalIntegrationState {
  snapshotId: string | null;
  snapshotCreationStatus: 'idle' | 'creating' | 'success' | 'error';
  snapshotError: string | null;
  proposalId: string | null;
  proposalCreationStatus: 'idle' | 'creating' | 'success' | 'error';
  proposalError: string | null;
  lineItems: ProposalLineItemForCheck[];
}

export interface ProposalLineItemForCheck {
  id: string;
  name: string;
  sourceTag: string | null;
  quantity: number;
  unitPrice: number;
}

export type QATestStepId =
  | 'select_test_property'
  | 'generate_estimate'
  | 'enable_imagery'
  | 'compute_materials'
  | 'create_proposal'
  | 'verify_proposal';

export type QATestStepStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skipped';

export interface QATestStep {
  id: QATestStepId;
  label: string;
  status: QATestStepStatus;
  message: string | null;
  duration: number | null;
}

export interface QATestResult {
  overallStatus: 'pass' | 'fail' | 'partial';
  steps: QATestStep[];
  startedAt: Date;
  completedAt: Date | null;
  totalDuration: number | null;
}

export const TEST_ADDRESSES = [
  { id: 'test-prop-001', address: '123 Test Street, Austin, TX 78701' },
  { id: 'test-prop-002', address: '456 Demo Avenue, Dallas, TX 75201' },
  { id: 'test-prop-003', address: '789 Sample Blvd, Houston, TX 77001' },
];
