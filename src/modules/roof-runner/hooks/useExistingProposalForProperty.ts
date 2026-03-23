import { useState, useEffect, useCallback } from 'react';
import { useInstantEstimator } from '../context/InstantEstimatorContext';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { checkExistingDraftForProperty } from '../services/proposalIntegrationApi';
import type { ProposalWithLineItems } from '../types/proposalIntegration';

interface UseExistingProposalForPropertyResult {
  existingProposal: ProposalWithLineItems | null;
  hasExistingProposal: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useExistingProposalForProperty(): UseExistingProposalForPropertyResult {
  const { currentOrganizationId } = useCurrentOrganization();
  const { selectedPropertyId } = useInstantEstimator();

  const [existingProposal, setExistingProposal] = useState<ProposalWithLineItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForExisting = useCallback(async () => {
    if (!currentOrganizationId || !selectedPropertyId) {
      setExistingProposal(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await checkExistingDraftForProperty(
        selectedPropertyId,
        currentOrganizationId
      );

      if (result.exists && result.proposal) {
        setExistingProposal(result.proposal);
      } else {
        setExistingProposal(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check for existing proposal';
      setError(message);
      setExistingProposal(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId, selectedPropertyId]);

  useEffect(() => {
    checkForExisting();
  }, [checkForExisting]);

  const refresh = useCallback(async () => {
    await checkForExisting();
  }, [checkForExisting]);

  return {
    existingProposal,
    hasExistingProposal: existingProposal !== null,
    isLoading,
    error,
    refresh,
  };
}
