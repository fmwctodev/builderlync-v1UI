import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstantEstimator } from '../context/InstantEstimatorContext';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import {
  createSnapshotAndProposal,
  createProposalFromEstimate,
} from '../services/proposalIntegrationApi';
import { navigateToProposalBuilder } from '../utils/proposalNavigation';
import type {
  CreateEstimateSnapshotRequest,
  MaterialsCalcInputs,
  MaterialsCalcOutputs,
} from '../types/proposalIntegration';
import { generateDefaultAssumptions } from '../utils/proposalFieldMapping';

interface UseCreateProposalFromEstimateResult {
  createProposal: (options?: CreateProposalOptions) => Promise<string | null>;
  isCreating: boolean;
  error: string | null;
  proposalId: string | null;
  snapshotId: string | null;
  clearError: () => void;
}

interface CreateProposalOptions {
  title?: string;
  customerId?: string;
  jobId?: string;
  opportunityId?: string;
  expiresInDays?: number;
  navigateOnSuccess?: boolean;
}

export function useCreateProposalFromEstimate(): UseCreateProposalFromEstimateResult {
  const navigate = useNavigate();
  const { currentOrganizationId } = useCurrentOrganization();
  const {
    selectedPropertyId,
    selectedAddressText,
    propertyData,
    effectivePitch,
    imageryEnabled,
    materialsConfig,
    materialsSummary,
    effectiveRoofArea,
  } = useInstantEstimator();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createProposal = useCallback(async (options: CreateProposalOptions = {}): Promise<string | null> => {
    if (!currentOrganizationId) {
      setError('No organization selected');
      return null;
    }

    if (!selectedPropertyId || !selectedAddressText) {
      setError('No property selected');
      return null;
    }

    if (!materialsSummary) {
      setError('Materials calculation required before creating proposal');
      return null;
    }

    setIsCreating(true);
    setError(null);
    setProposalId(null);
    setSnapshotId(null);

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

      const result = await createSnapshotAndProposal(snapshotData, {
        title: options.title,
        customer_id: options.customerId,
        job_id: options.jobId,
        opportunity_id: options.opportunityId,
        expires_in_days: options.expiresInDays,
      });

      if (!result.success) {
        setError(result.message || 'Failed to create proposal');
        if (result.snapshot_id) {
          setSnapshotId(result.snapshot_id);
        }
        return null;
      }

      setProposalId(result.proposal_id || null);
      setSnapshotId(result.snapshot_id || null);

      if (options.navigateOnSuccess !== false && result.proposal_id) {
        navigateToProposalBuilder(navigate, result.proposal_id);
      }

      return result.proposal_id || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
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
    navigate,
  ]);

  return {
    createProposal,
    isCreating,
    error,
    proposalId,
    snapshotId,
    clearError,
  };
}
