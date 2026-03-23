import { useMemo, useCallback } from 'react';
import { useInstantEstimator } from '../context/InstantEstimatorContext';
import { useEnvironment } from './useEnvironment';
import {
  evaluateInstantEstimatorReadiness,
  getChecksByCategory,
} from '../services/instantEstimatorReadinessEvaluator';
import type {
  EstimatorReadinessResult,
  EstimatorReadinessStatus,
  EstimatorCheckResult,
  EstimatorCheckCategory,
  EstimatorEvaluationState,
  ProposalIntegrationState,
} from '../types/estimatorReadiness';

interface UseEstimatorReadinessOptions {
  proposalIntegrationState?: ProposalIntegrationState;
  onFocusAddressSearch?: () => void;
  onRefreshOrgContext?: () => void;
  onRefreshCredits?: () => void;
  onBuyCredits?: () => void;
  onRetryChargeCheck?: () => void;
  onOpenOverrideModal?: () => void;
  onRetryImagery?: () => void;
  onRetryProposalCreation?: () => void;
  onNavigateToPricing?: () => void;
}

interface FixAction {
  id: string;
  label: string;
  callback?: () => void;
}

interface UseEstimatorReadinessReturn {
  readinessResult: EstimatorReadinessResult;
  overallStatus: EstimatorReadinessStatus;
  blockingChecks: EstimatorCheckResult[];
  warningChecks: EstimatorCheckResult[];
  passingChecks: EstimatorCheckResult[];
  infoChecks: EstimatorCheckResult[];
  canGenerateEstimate: boolean;
  canCreateProposal: boolean;
  checksByCategory: Record<EstimatorCheckCategory, EstimatorCheckResult[]>;
  fixActions: Record<string, FixAction>;
  executeFixAction: (actionId: string) => void;
  hasBlockingIssues: boolean;
  hasWarnings: boolean;
  isFullyReady: boolean;
  isNonProduction: boolean;
  evaluationState: EstimatorEvaluationState;
}

export function useEstimatorReadiness(
  options: UseEstimatorReadinessOptions = {}
): UseEstimatorReadinessReturn {
  const estimatorContext = useInstantEstimator();
  const { isNonProduction } = useEnvironment();

  const evaluationState = useMemo<EstimatorEvaluationState>(() => ({
    propertyId: estimatorContext.selectedPropertyId,
    addressText: estimatorContext.selectedAddressText,
    orgPlanTier: estimatorContext.orgPlanTier as 'pro' | 'standard' | null,
    orgCreditBalance: estimatorContext.orgCreditBalance,
    isLoadingOrgContext: estimatorContext.isLoadingOrgContext,
    hasValidChargeForCurrentProperty: estimatorContext.hasValidChargeForCurrentProperty,
    estimateChargeStatus: estimatorContext.estimateChargeStatus,
    estimateChargeError: estimatorContext.estimateChargeError,
    propertyDataStatus: estimatorContext.propertyDataStatus,
    propertyDataError: estimatorContext.propertyDataError,
    roofArea: estimatorContext.propertyData?.roofAreaSqFt ?? null,
    roofAreaOverride: estimatorContext.roofAreaOverride,
    imageryEnabled: estimatorContext.imageryEnabled,
    imageryStatus: estimatorContext.imageryStatus,
    imageryError: estimatorContext.imageryError,
    imageryUrls: estimatorContext.imageryUrls,
    effectivePitch: estimatorContext.effectivePitch,
    isPitchRequiredModalOpen: estimatorContext.isPitchRequiredModalOpen,
    materialsSummary: estimatorContext.materialsSummary ? {
      shingleBundles: estimatorContext.materialsSummary.shingleBundles ?? null,
      underlaymentRolls: estimatorContext.materialsSummary.underlaymentRolls ?? null,
      ridgeCapBundles: estimatorContext.materialsSummary.ridgeCapBundles ?? null,
      starterStripBundles: estimatorContext.materialsSummary.starterStripBundles ?? null,
      ventCount: estimatorContext.materialsSummary.ventCount ?? null,
    } : null,
    isNonProduction,
    proposalIntegrationState: options.proposalIntegrationState,
  }), [
    estimatorContext.selectedPropertyId,
    estimatorContext.selectedAddressText,
    estimatorContext.orgPlanTier,
    estimatorContext.orgCreditBalance,
    estimatorContext.isLoadingOrgContext,
    estimatorContext.hasValidChargeForCurrentProperty,
    estimatorContext.estimateChargeStatus,
    estimatorContext.estimateChargeError,
    estimatorContext.propertyDataStatus,
    estimatorContext.propertyDataError,
    estimatorContext.propertyData?.roofAreaSqFt,
    estimatorContext.roofAreaOverride,
    estimatorContext.imageryEnabled,
    estimatorContext.imageryStatus,
    estimatorContext.imageryError,
    estimatorContext.imageryUrls,
    estimatorContext.effectivePitch,
    estimatorContext.isPitchRequiredModalOpen,
    estimatorContext.materialsSummary,
    isNonProduction,
    options.proposalIntegrationState,
  ]);

  const readinessResult = useMemo(() => {
    return evaluateInstantEstimatorReadiness(evaluationState);
  }, [evaluationState]);

  const checksByCategory = useMemo(() => {
    return getChecksByCategory(readinessResult.checks);
  }, [readinessResult.checks]);

  const fixActions = useMemo<Record<string, FixAction>>(() => ({
    focus_address_search: {
      id: 'focus_address_search',
      label: 'Enter Address',
      callback: options.onFocusAddressSearch,
    },
    refresh_org_context: {
      id: 'refresh_org_context',
      label: 'Refresh Organization',
      callback: options.onRefreshOrgContext,
    },
    refresh_credits: {
      id: 'refresh_credits',
      label: 'Refresh Balance',
      callback: options.onRefreshCredits || estimatorContext.refreshCreditBalance,
    },
    buy_credits: {
      id: 'buy_credits',
      label: 'Buy Credits',
      callback: options.onBuyCredits,
    },
    retry_charge_check: {
      id: 'retry_charge_check',
      label: 'Retry Check',
      callback: options.onRetryChargeCheck || estimatorContext.checkPropertyChargeStatus,
    },
    open_override_modal: {
      id: 'open_override_modal',
      label: 'Set Override',
      callback: options.onOpenOverrideModal,
    },
    retry_imagery: {
      id: 'retry_imagery',
      label: 'Retry Imagery',
      callback: options.onRetryImagery || estimatorContext.retryImagery,
    },
    retry_proposal_creation: {
      id: 'retry_proposal_creation',
      label: 'Retry',
      callback: options.onRetryProposalCreation,
    },
    navigate_to_pricing: {
      id: 'navigate_to_pricing',
      label: 'Edit Pricing',
      callback: options.onNavigateToPricing,
    },
  }), [
    options.onFocusAddressSearch,
    options.onRefreshOrgContext,
    options.onRefreshCredits,
    options.onBuyCredits,
    options.onRetryChargeCheck,
    options.onOpenOverrideModal,
    options.onRetryImagery,
    options.onRetryProposalCreation,
    options.onNavigateToPricing,
    estimatorContext.refreshCreditBalance,
    estimatorContext.checkPropertyChargeStatus,
    estimatorContext.retryImagery,
  ]);

  const executeFixAction = useCallback((actionId: string) => {
    const action = fixActions[actionId];
    if (action?.callback) {
      action.callback();
    }
  }, [fixActions]);

  return {
    readinessResult,
    overallStatus: readinessResult.overallStatus,
    blockingChecks: readinessResult.blockingChecks,
    warningChecks: readinessResult.warningChecks,
    passingChecks: readinessResult.passingChecks,
    infoChecks: readinessResult.infoChecks,
    canGenerateEstimate: readinessResult.canGenerateEstimate,
    canCreateProposal: readinessResult.canCreateProposal,
    checksByCategory,
    fixActions,
    executeFixAction,
    hasBlockingIssues: readinessResult.blockingChecks.length > 0,
    hasWarnings: readinessResult.warningChecks.length > 0,
    isFullyReady: readinessResult.overallStatus === 'PASS',
    isNonProduction,
    evaluationState,
  };
}
