import type {
  QATestStep,
  QATestResult,
  QATestStepId,
  QATestStepStatus,
} from '../types/estimatorReadiness';
import { TEST_ADDRESSES } from '../types/estimatorReadiness';

const STEP_DEFINITIONS: { id: QATestStepId; label: string }[] = [
  { id: 'select_test_property', label: 'Select Test Property' },
  { id: 'generate_estimate', label: 'Generate Instant Estimate' },
  { id: 'enable_imagery', label: 'Enable Imagery Toggle' },
  { id: 'compute_materials', label: 'Compute Quick Materials' },
  { id: 'create_proposal', label: 'Create Proposal from Estimate' },
  { id: 'verify_proposal', label: 'Verify Proposal Contents' },
];

function createInitialSteps(): QATestStep[] {
  return STEP_DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.label,
    status: 'pending' as QATestStepStatus,
    message: null,
    duration: null,
  }));
}

export interface QATestContext {
  setSelectedAddress: (propertyId: string, addressText: string) => void;
  generateInstantEstimate: () => Promise<{ needsConfirmation: boolean }>;
  confirmAndChargeEstimate: () => Promise<boolean>;
  setImageryEnabled: (enabled: boolean) => void;
  updateMaterialsConfig: (updates: { wastePercent?: number }) => void;
  createProposalFromEstimate?: () => Promise<{ proposalId: string | null; error?: string }>;
  getProposalLineItems?: (proposalId: string) => Promise<{ id: string; name: string }[]>;
  selectedPropertyId: string | null;
  effectiveRoofArea: number | null;
  materialsSummary: { shingleBundles: number | null } | null;
  isInstantEstimateFree: boolean;
  orgCreditBalance: number | null;
}

export type StepProgressCallback = (step: QATestStep) => void;

async function runStep(
  stepId: QATestStepId,
  stepLabel: string,
  executor: () => Promise<{ success: boolean; message: string }>,
  onProgress: StepProgressCallback
): Promise<QATestStep> {
  const startTime = Date.now();

  onProgress({
    id: stepId,
    label: stepLabel,
    status: 'running',
    message: 'Running...',
    duration: null,
  });

  try {
    const result = await executor();
    const duration = Date.now() - startTime;

    const step: QATestStep = {
      id: stepId,
      label: stepLabel,
      status: result.success ? 'pass' : 'fail',
      message: result.message,
      duration,
    };

    onProgress(step);
    return step;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const step: QATestStep = {
      id: stepId,
      label: stepLabel,
      status: 'fail',
      message: `Error: ${errorMessage}`,
      duration,
    };

    onProgress(step);
    return step;
  }
}

export async function runQATestSuite(
  context: QATestContext,
  selectedTestAddressIndex: number,
  onProgress: StepProgressCallback,
  onComplete: (result: QATestResult) => void
): Promise<QATestResult> {
  const startedAt = new Date();
  const steps: QATestStep[] = createInitialSteps();

  const updateStep = (step: QATestStep) => {
    const index = steps.findIndex((s) => s.id === step.id);
    if (index >= 0) {
      steps[index] = step;
    }
    onProgress(step);
  };

  const testAddress = TEST_ADDRESSES[selectedTestAddressIndex] || TEST_ADDRESSES[0];
  let proposalId: string | null = null;

  const step1 = await runStep(
    'select_test_property',
    'Select Test Property',
    async () => {
      context.setSelectedAddress(testAddress.id, testAddress.address);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (context.selectedPropertyId === testAddress.id) {
        return { success: true, message: `Selected: ${testAddress.address}` };
      }

      return { success: true, message: `Set address: ${testAddress.address}` };
    },
    updateStep
  );

  if (step1.status === 'fail') {
    const result = createResult(steps, startedAt);
    onComplete(result);
    return result;
  }

  const step2 = await runStep(
    'generate_estimate',
    'Generate Instant Estimate',
    async () => {
      const needsCharge = !context.isInstantEstimateFree && context.orgCreditBalance !== null && context.orgCreditBalance >= 1;

      if (needsCharge) {
        const confirmResult = await context.confirmAndChargeEstimate();
        if (!confirmResult) {
          return { success: false, message: 'Failed to charge for estimate' };
        }
        return { success: true, message: 'Estimate charged and generated' };
      }

      const result = await context.generateInstantEstimate();
      if (result.needsConfirmation) {
        const confirmResult = await context.confirmAndChargeEstimate();
        if (!confirmResult) {
          return { success: false, message: 'Failed to confirm estimate generation' };
        }
      }

      return { success: true, message: 'Instant estimate generated' };
    },
    updateStep
  );

  if (step2.status === 'fail') {
    skipRemainingSteps(steps, 2, updateStep);
    const result = createResult(steps, startedAt);
    onComplete(result);
    return result;
  }

  const step3 = await runStep(
    'enable_imagery',
    'Enable Imagery Toggle',
    async () => {
      context.setImageryEnabled(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, message: 'Imagery toggle enabled' };
    },
    updateStep
  );

  const step4 = await runStep(
    'compute_materials',
    'Compute Quick Materials',
    async () => {
      context.updateMaterialsConfig({ wastePercent: 10 });
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (context.effectiveRoofArea && context.materialsSummary?.shingleBundles) {
        return {
          success: true,
          message: `Computed: ${context.materialsSummary.shingleBundles} shingle bundles for ${context.effectiveRoofArea} sq ft`,
        };
      }

      if (context.effectiveRoofArea) {
        return { success: true, message: `Roof area: ${context.effectiveRoofArea} sq ft` };
      }

      return { success: false, message: 'No roof area available for calculations' };
    },
    updateStep
  );

  if (step4.status === 'fail') {
    skipRemainingSteps(steps, 4, updateStep);
    const result = createResult(steps, startedAt);
    onComplete(result);
    return result;
  }

  const step5 = await runStep(
    'create_proposal',
    'Create Proposal from Estimate',
    async () => {
      if (!context.createProposalFromEstimate) {
        return { success: false, message: 'Proposal creation not available in test context' };
      }

      const result = await context.createProposalFromEstimate();
      if (result.error) {
        return { success: false, message: result.error };
      }

      if (!result.proposalId) {
        return { success: false, message: 'No proposal ID returned' };
      }

      proposalId = result.proposalId;
      return { success: true, message: `Proposal created: ${proposalId}` };
    },
    updateStep
  );

  if (step5.status === 'fail') {
    skipRemainingSteps(steps, 5, updateStep);
    const result = createResult(steps, startedAt);
    onComplete(result);
    return result;
  }

  const step6 = await runStep(
    'verify_proposal',
    'Verify Proposal Contents',
    async () => {
      if (!proposalId || !context.getProposalLineItems) {
        return { success: true, message: 'Skipped: No proposal to verify' };
      }

      const lineItems = await context.getProposalLineItems(proposalId);

      if (lineItems.length === 0) {
        return { success: false, message: 'Proposal has no line items' };
      }

      return {
        success: true,
        message: `Verified: ${lineItems.length} line item(s) in proposal`,
      };
    },
    updateStep
  );

  const result = createResult(steps, startedAt);
  onComplete(result);
  return result;
}

function skipRemainingSteps(
  steps: QATestStep[],
  afterIndex: number,
  updateStep: StepProgressCallback
) {
  for (let i = afterIndex; i < steps.length; i++) {
    const skippedStep: QATestStep = {
      ...steps[i],
      status: 'skipped',
      message: 'Skipped due to previous failure',
    };
    steps[i] = skippedStep;
    updateStep(skippedStep);
  }
}

function createResult(steps: QATestStep[], startedAt: Date): QATestResult {
  const completedAt = new Date();
  const totalDuration = completedAt.getTime() - startedAt.getTime();

  const failCount = steps.filter((s) => s.status === 'fail').length;
  const passCount = steps.filter((s) => s.status === 'pass').length;
  const totalExecuted = steps.filter((s) => s.status !== 'pending' && s.status !== 'skipped').length;

  let overallStatus: 'pass' | 'fail' | 'partial';
  if (failCount === 0 && passCount === totalExecuted) {
    overallStatus = 'pass';
  } else if (failCount > 0 && passCount > 0) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'fail';
  }

  return {
    overallStatus,
    steps,
    startedAt,
    completedAt,
    totalDuration,
  };
}

export function getTestAddresses() {
  return TEST_ADDRESSES;
}
