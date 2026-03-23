import type {
  EstimatorCheckResult,
  EstimatorReadinessResult,
  EstimatorEvaluationState,
  EstimatorCheckId,
  EstimatorCheckCategory,
} from '../types/estimatorReadiness';
import {
  ESTIMATOR_CHECK_LABELS,
  ESTIMATOR_CHECK_CATEGORIES,
  computeEstimatorOverallStatus,
} from '../types/estimatorReadiness';

function createCheck(
  id: EstimatorCheckId,
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO',
  message: string,
  blocking: boolean,
  fixHint: string | null = null,
  fixActionId: string | null = null
): EstimatorCheckResult {
  return {
    id,
    label: ESTIMATOR_CHECK_LABELS[id],
    status,
    message,
    blocking,
    fixHint,
    fixActionId,
    category: ESTIMATOR_CHECK_CATEGORIES[id],
  };
}

export function checkPropertySelected(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (!state.propertyId || !state.addressText) {
    return createCheck(
      'property_selected',
      'FAIL',
      'No property selected',
      true,
      'Enter an address to begin',
      'focus_address_search'
    );
  }

  return createCheck(
    'property_selected',
    'PASS',
    `Property: ${state.addressText.substring(0, 40)}${state.addressText.length > 40 ? '...' : ''}`,
    false
  );
}

export function checkEntitlementsCredits(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (state.isLoadingOrgContext) {
    return createCheck(
      'entitlements_credits',
      'WARN',
      'Loading organization context...',
      false,
      null,
      null
    );
  }

  if (!state.orgPlanTier) {
    return createCheck(
      'entitlements_credits',
      'WARN',
      'Unable to determine organization tier',
      true,
      'Refresh the page or contact support',
      'refresh_org_context'
    );
  }

  if (state.orgPlanTier === 'pro') {
    return createCheck(
      'entitlements_credits',
      'PASS',
      'Pro tier: Instant estimates are free',
      false
    );
  }

  if (state.hasValidChargeForCurrentProperty) {
    return createCheck(
      'entitlements_credits',
      'PASS',
      'Already charged for this property',
      false
    );
  }

  if (state.orgCreditBalance === null) {
    return createCheck(
      'entitlements_credits',
      'WARN',
      'Unable to verify credit balance',
      false,
      'Refresh to check credit balance',
      'refresh_credits'
    );
  }

  if (state.orgCreditBalance >= 1) {
    return createCheck(
      'entitlements_credits',
      'PASS',
      `Standard tier: ${state.orgCreditBalance} credit(s) available`,
      false
    );
  }

  return createCheck(
    'entitlements_credits',
    'FAIL',
    'Insufficient credits (need 1 credit)',
    true,
    'Purchase additional credits to continue',
    'buy_credits'
  );
}

export function checkChargeOnceGuard(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (!state.propertyId) {
    return createCheck(
      'charge_once_guard',
      'INFO',
      'Select a property to check charge status',
      false
    );
  }

  if (state.estimateChargeError) {
    return createCheck(
      'charge_once_guard',
      'WARN',
      `Charge status unknown: ${state.estimateChargeError.message}`,
      false,
      'Retry will not re-charge; safe to proceed',
      'retry_charge_check'
    );
  }

  if (state.hasValidChargeForCurrentProperty) {
    return createCheck(
      'charge_once_guard',
      'PASS',
      'Property already charged (no additional cost)',
      false
    );
  }

  if (state.orgPlanTier === 'pro') {
    return createCheck(
      'charge_once_guard',
      'PASS',
      'Pro tier: No charge required',
      false
    );
  }

  return createCheck(
    'charge_once_guard',
    'PASS',
    'First estimate for this property will use 1 credit',
    false
  );
}

export function checkPropertyDataHealth(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (state.propertyDataStatus === 'loading') {
    return createCheck(
      'property_data_health',
      'INFO',
      'Fetching property data...',
      false
    );
  }

  if (state.propertyDataStatus === 'error' || state.propertyDataError) {
    return createCheck(
      'property_data_health',
      'WARN',
      `Property data error: ${state.propertyDataError?.message || 'Unknown error'}`,
      false,
      'You can override roof area manually',
      'open_override_modal'
    );
  }

  if (state.propertyDataStatus !== 'success') {
    return createCheck(
      'property_data_health',
      'INFO',
      'Waiting for property data fetch',
      false
    );
  }

  const effectiveRoofArea = state.roofAreaOverride ?? state.roofArea;
  const hasPitch = state.effectivePitch !== null;

  if (!effectiveRoofArea && !state.roofAreaOverride) {
    return createCheck(
      'property_data_health',
      'WARN',
      'Roof area unavailable',
      false,
      'Set a manual roof area override to enable calculations',
      'open_override_modal'
    );
  }

  if (!hasPitch) {
    return createCheck(
      'property_data_health',
      'PASS',
      `Roof area: ${effectiveRoofArea?.toLocaleString()} sq ft (pitch not available)`,
      false
    );
  }

  return createCheck(
    'property_data_health',
    'PASS',
    `Roof area: ${effectiveRoofArea?.toLocaleString()} sq ft, Pitch: ${state.effectivePitch}/12`,
    false
  );
}

export function checkImageryBehavior(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (!state.imageryEnabled) {
    return createCheck(
      'imagery_behavior',
      'PASS',
      'Imagery toggle disabled',
      false
    );
  }

  if (state.imageryStatus === 'loading') {
    return createCheck(
      'imagery_behavior',
      'INFO',
      'Loading imagery...',
      false
    );
  }

  if (state.imageryStatus === 'error' || state.imageryError) {
    return createCheck(
      'imagery_behavior',
      'FAIL',
      `Imagery error: ${state.imageryError?.message || 'Failed to load'}`,
      false,
      'Disable imagery or retry',
      'retry_imagery'
    );
  }

  if (state.imageryUrls.length === 0) {
    return createCheck(
      'imagery_behavior',
      'WARN',
      'Imagery enabled but no images available',
      false,
      'Images may not be available for this property',
      null
    );
  }

  return createCheck(
    'imagery_behavior',
    'PASS',
    `${state.imageryUrls.length} orthogonal image(s) loaded`,
    false
  );
}

export function checkPitchHandling(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (state.effectivePitch !== null) {
    const source = state.roofAreaOverride !== null ? 'override' : 'property data';
    return createCheck(
      'pitch_handling',
      'PASS',
      `Pitch: ${state.effectivePitch}/12 (from ${source})`,
      false
    );
  }

  if (state.isPitchRequiredModalOpen) {
    return createCheck(
      'pitch_handling',
      'INFO',
      'Awaiting pitch input from modal',
      false
    );
  }

  return createCheck(
    'pitch_handling',
    'PASS',
    'Pitch not required for current calculations',
    false
  );
}

export function checkQuickMaterialsOutputs(state: EstimatorEvaluationState): EstimatorCheckResult {
  const effectiveRoofArea = state.roofAreaOverride ?? state.roofArea;

  if (!effectiveRoofArea) {
    return createCheck(
      'quick_materials_outputs',
      'WARN',
      'Cannot calculate materials without roof area',
      false,
      'Set a roof area override or wait for property data',
      'open_override_modal'
    );
  }

  if (!state.materialsSummary) {
    return createCheck(
      'quick_materials_outputs',
      'WARN',
      'Materials calculation not available',
      false
    );
  }

  const { shingleBundles, underlaymentRolls } = state.materialsSummary;

  if (shingleBundles === null || underlaymentRolls === null) {
    return createCheck(
      'quick_materials_outputs',
      'WARN',
      'Some material calculations are incomplete',
      false
    );
  }

  return createCheck(
    'quick_materials_outputs',
    'PASS',
    `Shingles: ${shingleBundles} bundles, Underlayment: ${underlaymentRolls} rolls`,
    false
  );
}

export function checkEscalateToReport(state: EstimatorEvaluationState): EstimatorCheckResult {
  if (!state.propertyId || !state.addressText) {
    return createCheck(
      'escalate_to_report',
      'INFO',
      'Select a property to enable escalation',
      false
    );
  }

  return createCheck(
    'escalate_to_report',
    'PASS',
    'Escalate to Report CTA ready',
    false
  );
}

export function checkProposalSnapshotCreation(state: EstimatorEvaluationState): EstimatorCheckResult {
  const proposalState = state.proposalIntegrationState;

  if (!proposalState) {
    return createCheck(
      'proposal_snapshot_creation',
      'INFO',
      'Proposal integration not initialized',
      false
    );
  }

  if (proposalState.snapshotCreationStatus === 'creating') {
    return createCheck(
      'proposal_snapshot_creation',
      'INFO',
      'Creating estimate snapshot...',
      false
    );
  }

  if (proposalState.snapshotCreationStatus === 'error') {
    return createCheck(
      'proposal_snapshot_creation',
      'FAIL',
      `Snapshot creation failed: ${proposalState.snapshotError || 'Unknown error'}`,
      true,
      'Retry creating the proposal',
      'retry_proposal_creation'
    );
  }

  if (proposalState.snapshotId) {
    return createCheck(
      'proposal_snapshot_creation',
      'PASS',
      'Estimate snapshot created successfully',
      false
    );
  }

  return createCheck(
    'proposal_snapshot_creation',
    'INFO',
    'Snapshot will be created when proposal is generated',
    false
  );
}

export function checkProposalDraftCreation(state: EstimatorEvaluationState): EstimatorCheckResult {
  const proposalState = state.proposalIntegrationState;

  if (!proposalState) {
    return createCheck(
      'proposal_draft_creation',
      'INFO',
      'Proposal integration not initialized',
      false
    );
  }

  if (proposalState.proposalCreationStatus === 'creating') {
    return createCheck(
      'proposal_draft_creation',
      'INFO',
      'Creating proposal draft...',
      false
    );
  }

  if (proposalState.proposalCreationStatus === 'error') {
    return createCheck(
      'proposal_draft_creation',
      'FAIL',
      `Proposal creation failed: ${proposalState.proposalError || 'Unknown error'}`,
      true,
      'Retry creating the proposal',
      'retry_proposal_creation'
    );
  }

  if (proposalState.proposalId) {
    return createCheck(
      'proposal_draft_creation',
      'PASS',
      'Proposal draft created and ready for editing',
      false
    );
  }

  return createCheck(
    'proposal_draft_creation',
    'INFO',
    'Click "Create Proposal" to generate a draft',
    false
  );
}

export function checkProposalFieldMapping(state: EstimatorEvaluationState): EstimatorCheckResult {
  const proposalState = state.proposalIntegrationState;

  if (!proposalState || !proposalState.proposalId) {
    return createCheck(
      'proposal_field_mapping',
      'INFO',
      'Create a proposal to check field mapping',
      false
    );
  }

  const estimatorLineItems = proposalState.lineItems.filter(
    (item) => item.sourceTag && item.sourceTag.startsWith('estimator:')
  );

  if (estimatorLineItems.length === 0) {
    return createCheck(
      'proposal_field_mapping',
      'FAIL',
      'No estimator-linked line items found',
      false,
      'Ensure materials were calculated before creating proposal',
      null
    );
  }

  const hasShingles = estimatorLineItems.some(
    (item) => item.sourceTag?.includes('shingles')
  );
  const hasUnderlayment = estimatorLineItems.some(
    (item) => item.sourceTag?.includes('underlayment')
  );

  if (!hasShingles || !hasUnderlayment) {
    const missing = [];
    if (!hasShingles) missing.push('shingles');
    if (!hasUnderlayment) missing.push('underlayment');

    return createCheck(
      'proposal_field_mapping',
      'WARN',
      `Missing required items: ${missing.join(', ')}`,
      false,
      'Add missing line items manually in the proposal builder',
      null
    );
  }

  return createCheck(
    'proposal_field_mapping',
    'PASS',
    `${estimatorLineItems.length} estimator-linked line item(s) mapped`,
    false
  );
}

export function checkProposalPricingCompleteness(state: EstimatorEvaluationState): EstimatorCheckResult {
  const proposalState = state.proposalIntegrationState;

  if (!proposalState || !proposalState.proposalId) {
    return createCheck(
      'proposal_pricing_completeness',
      'INFO',
      'Create a proposal to check pricing',
      false
    );
  }

  const estimatorLineItems = proposalState.lineItems.filter(
    (item) => item.sourceTag && item.sourceTag.startsWith('estimator:')
  );

  if (estimatorLineItems.length === 0) {
    return createCheck(
      'proposal_pricing_completeness',
      'INFO',
      'No estimator-linked line items to price',
      false
    );
  }

  const missingPricing = estimatorLineItems.filter((item) => !item.unitPrice || item.unitPrice <= 0);

  if (missingPricing.length > 0) {
    return createCheck(
      'proposal_pricing_completeness',
      'WARN',
      `${missingPricing.length} item(s) missing pricing`,
      false,
      'Assign prices in catalog or enter unit prices manually',
      'navigate_to_pricing'
    );
  }

  return createCheck(
    'proposal_pricing_completeness',
    'PASS',
    'All estimator-linked items have pricing',
    false
  );
}

export function checkEnvironmentBanner(isNonProduction: boolean): EstimatorCheckResult {
  if (isNonProduction) {
    return createCheck(
      'environment_banner',
      'INFO',
      'Non-production environment (staging/dev)',
      false,
      'QA test hooks are available',
      null
    );
  }

  return createCheck(
    'environment_banner',
    'PASS',
    'Production environment',
    false
  );
}

export function evaluateInstantEstimatorReadiness(
  state: EstimatorEvaluationState
): EstimatorReadinessResult {
  const checks: EstimatorCheckResult[] = [];

  checks.push(checkPropertySelected(state));
  checks.push(checkEntitlementsCredits(state));
  checks.push(checkChargeOnceGuard(state));
  checks.push(checkPropertyDataHealth(state));
  checks.push(checkImageryBehavior(state));
  checks.push(checkPitchHandling(state));
  checks.push(checkQuickMaterialsOutputs(state));
  checks.push(checkEscalateToReport(state));
  checks.push(checkProposalSnapshotCreation(state));
  checks.push(checkProposalDraftCreation(state));
  checks.push(checkProposalFieldMapping(state));
  checks.push(checkProposalPricingCompleteness(state));
  checks.push(checkEnvironmentBanner(state.isNonProduction));

  const overallStatus = computeEstimatorOverallStatus(checks);

  const blockingChecks = checks.filter((c) => c.status === 'FAIL' && c.blocking);
  const warningChecks = checks.filter((c) => c.status === 'WARN');
  const passingChecks = checks.filter((c) => c.status === 'PASS');
  const infoChecks = checks.filter((c) => c.status === 'INFO');

  const coreBlockers = blockingChecks.filter(
    (c) => ['property_selected', 'entitlements_credits'].includes(c.id)
  );
  const canGenerateEstimate = coreBlockers.length === 0;

  const proposalBlockers = blockingChecks.filter(
    (c) => ['property_selected', 'proposal_snapshot_creation', 'proposal_draft_creation'].includes(c.id)
  );
  const effectiveRoofArea = state.roofAreaOverride ?? state.roofArea;
  const canCreateProposal = proposalBlockers.length === 0 && !!state.propertyId && !!effectiveRoofArea;

  return {
    overallStatus,
    checks,
    blockingChecks,
    warningChecks,
    passingChecks,
    infoChecks,
    canGenerateEstimate,
    canCreateProposal,
  };
}

export function getChecksByCategory(
  checks: EstimatorCheckResult[]
): Record<EstimatorCheckCategory, EstimatorCheckResult[]> {
  return {
    core: checks.filter((c) => c.category === 'core'),
    data: checks.filter((c) => c.category === 'data'),
    proposal: checks.filter((c) => c.category === 'proposal'),
    informational: checks.filter((c) => c.category === 'informational'),
  };
}
