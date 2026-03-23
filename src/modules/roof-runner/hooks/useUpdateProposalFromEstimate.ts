import { useState, useCallback } from 'react';
import { useInstantEstimator } from '../context/InstantEstimatorContext';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { createSnapshot } from '../services/estimateSnapshotsApi';
import { updateProposalFromEstimate } from '../services/proposalIntegrationApi';
import { generateDefaultAssumptions } from '../utils/proposalFieldMapping';
import type {
  MergeConflictSummary,
  CreateEstimateSnapshotRequest,
  MaterialsCalcInputs,
  MaterialsCalcOutputs,
} from '../types/proposalIntegration';

interface UseUpdateProposalFromEstimateResult {
  updateProposal: (proposalId: string) => Promise<MergeConflictSummary | null>;
  isUpdating: boolean;
  error: string | null;
  conflicts: MergeConflictSummary | null;
  clearError: () => void;
  clearConflicts: () => void;
}

export function useUpdateProposalFromEstimate(): UseUpdateProposalFromEstimateResult {
  const { currentOrganizationId } = useCurrentOrganization();
  const {
    selectedPropertyId,
    selectedAddressText,
    effectivePitch,
    imageryEnabled,
    materialsConfig,
    materialsSummary,
    effectiveRoofArea,
  } = useInstantEstimator();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<MergeConflictSummary | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearConflicts = useCallback(() => {
    setConflicts(null);
  }, []);

  const updateProposal = useCallback(async (proposalId: string): Promise<MergeConflictSummary | null> => {
    if (!currentOrganizationId) {
      setError('No organization selected');
      return null;
    }

    if (!selectedPropertyId || !selectedAddressText) {
      setError('No property selected');
      return null;
    }

    if (!materialsSummary) {
      setError('Materials calculation required before updating proposal');
      return null;
    }

    setIsUpdating(true);
    setError(null);
    setConflicts(null);

    try {
      const materialsCalcInputs: MaterialsCalcInputs = {
        wastePercent: materialsConfig.wastePercent,
        bundlesPerSquare: materialsConfig.bundlesPerSquare,
        underlaymentSqFtPerRoll: materialsConfig.underlaymentSqFtPerRoll,
        includeStarter: materialsConfig.includeStarter,
        includeRidgeCap: materialsConfig.includeRidgeCap,
        includeDripEdge: materialsConfig.includeDripEdge,
        shingleType: materialsConfig.shingleType,
        underlaymentType: materialsConfig.underlaymentType,
      };

      const materialsCalcOutputs: MaterialsCalcOutputs = {
        squares: materialsSummary.squares,
        adjustedSquares: materialsSummary.adjustedSquares,
        bundlesRequired: materialsSummary.bundlesRequired,
        underlaymentRolls: materialsSummary.underlaymentRolls,
      };

      const snapshotData: CreateEstimateSnapshotRequest = {
        organization_id: currentOrganizationId,
        property_id: selectedPropertyId,
        address_text: selectedAddressText,
        roof_area_sqft: effectiveRoofArea,
        pitch_effective: effectivePitch,
        imagery_included: imageryEnabled,
        materials_calc_inputs: materialsCalcInputs,
        materials_calc_outputs: materialsCalcOutputs,
        assumptions: generateDefaultAssumptions({
          id: '',
          organization_id: currentOrganizationId,
          user_id: '',
          property_id: selectedPropertyId,
          address_text: selectedAddressText,
          roof_area_sqft: effectiveRoofArea,
          pitch_effective: effectivePitch,
          imagery_included: imageryEnabled,
          materials_calc_inputs: materialsCalcInputs,
          materials_calc_outputs: materialsCalcOutputs,
          assumptions: [],
          notes: null,
          source: 'instant_estimator',
          created_at: new Date().toISOString(),
        }),
      };

      const snapshotResult = await createSnapshot(snapshotData);
      if (!snapshotResult.success || !snapshotResult.data) {
        setError(snapshotResult.message || 'Failed to create estimate snapshot');
        return null;
      }

      const updateResult = await updateProposalFromEstimate({
        proposal_id: proposalId,
        new_snapshot_id: snapshotResult.data.id,
        organization_id: currentOrganizationId,
      });

      if (!updateResult.success) {
        setError(updateResult.message || 'Failed to update proposal');
        return null;
      }

      if (updateResult.merge_summary) {
        setConflicts(updateResult.merge_summary);
      }

      return updateResult.merge_summary || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [
    currentOrganizationId,
    selectedPropertyId,
    selectedAddressText,
    materialsSummary,
    materialsConfig,
    effectiveRoofArea,
    effectivePitch,
    imageryEnabled,
  ]);

  return {
    updateProposal,
    isUpdating,
    error,
    conflicts,
    clearError,
    clearConflicts,
  };
}
