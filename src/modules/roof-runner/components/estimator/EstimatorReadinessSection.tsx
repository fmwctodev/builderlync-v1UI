import { useState, useMemo, useCallback } from 'react';
import { useInstantEstimator } from '../../context/InstantEstimatorContext';
import { useEnvironment } from '../../hooks/useEnvironment';
import { useEstimatorReadiness } from '../../hooks/useEstimatorReadiness';
import { EstimatorReadinessIndicator } from './EstimatorReadinessIndicator';
import { EstimatorReadinessPanel } from './EstimatorReadinessPanel';
import { EstimatorQATestPanel } from './EstimatorQATestPanel';
import type { ProposalIntegrationState, QATestStep } from '../../types/estimatorReadiness';
import type { QATestContext } from '../../services/estimatorQATestRunner';

interface EstimatorReadinessSectionProps {
  proposalIntegrationState?: ProposalIntegrationState;
  onFocusAddressSearch?: () => void;
  onOpenOverrideModal?: () => void;
  createProposalFromEstimate?: () => Promise<{ proposalId: string | null; error?: string }>;
  getProposalLineItems?: (proposalId: string) => Promise<{ id: string; name: string }[]>;
}

export function EstimatorReadinessSection({
  proposalIntegrationState,
  onFocusAddressSearch,
  onOpenOverrideModal,
  createProposalFromEstimate,
  getProposalLineItems,
}: EstimatorReadinessSectionProps) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [isQATestRunning, setIsQATestRunning] = useState(false);

  const estimator = useInstantEstimator();
  const { isNonProduction } = useEnvironment();

  const {
    readinessResult,
    overallStatus,
    blockingChecks,
    warningChecks,
    passingChecks,
    infoChecks,
    canGenerateEstimate,
    canCreateProposal,
    checksByCategory,
    fixActions,
    executeFixAction,
  } = useEstimatorReadiness({
    proposalIntegrationState,
    onFocusAddressSearch,
    onOpenOverrideModal,
  });

  const qaTestContext = useMemo<QATestContext>(() => ({
    setSelectedAddress: estimator.setSelectedAddress,
    generateInstantEstimate: estimator.generateInstantEstimate,
    confirmAndChargeEstimate: estimator.confirmAndChargeEstimate,
    setImageryEnabled: estimator.setImageryEnabled,
    updateMaterialsConfig: estimator.updateMaterialsConfig,
    createProposalFromEstimate,
    getProposalLineItems,
    selectedPropertyId: estimator.selectedPropertyId,
    effectiveRoofArea: estimator.effectiveRoofArea,
    materialsSummary: estimator.materialsSummary,
    isInstantEstimateFree: estimator.isInstantEstimateFree,
    orgCreditBalance: estimator.orgCreditBalance,
  }), [
    estimator.setSelectedAddress,
    estimator.generateInstantEstimate,
    estimator.confirmAndChargeEstimate,
    estimator.setImageryEnabled,
    estimator.updateMaterialsConfig,
    estimator.selectedPropertyId,
    estimator.effectiveRoofArea,
    estimator.materialsSummary,
    estimator.isInstantEstimateFree,
    estimator.orgCreditBalance,
    createProposalFromEstimate,
    getProposalLineItems,
  ]);

  const handleTogglePanel = useCallback(() => {
    setIsPanelExpanded((prev) => !prev);
  }, []);

  const handleRunQATest = useCallback(() => {
    setShowQAPanel(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelExpanded(false);
  }, []);

  const handleCloseQAPanel = useCallback(() => {
    setShowQAPanel(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EstimatorReadinessIndicator
          status={overallStatus}
          passCount={passingChecks.length}
          warnCount={warningChecks.length}
          failCount={blockingChecks.length}
          infoCount={infoChecks.length}
          onTogglePanel={handleTogglePanel}
          isPanelExpanded={isPanelExpanded}
        />

        {isNonProduction && !isPanelExpanded && (
          <button
            onClick={handleRunQATest}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Run QA Tests
          </button>
        )}
      </div>

      {isPanelExpanded && (
        <EstimatorReadinessPanel
          checks={readinessResult.checks}
          checksByCategory={checksByCategory}
          overallStatus={overallStatus}
          canGenerateEstimate={canGenerateEstimate}
          canCreateProposal={canCreateProposal}
          isNonProduction={isNonProduction}
          onClose={handleClosePanel}
          onFixAction={executeFixAction}
          fixActions={fixActions}
          onRunQATest={handleRunQATest}
          isQATestRunning={isQATestRunning}
        />
      )}

      {showQAPanel && isNonProduction && (
        <EstimatorQATestPanel
          testContext={qaTestContext}
          onClose={handleCloseQAPanel}
        />
      )}
    </div>
  );
}
