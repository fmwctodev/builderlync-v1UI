import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useInstantEstimator } from '../../context/InstantEstimatorContext';
import { useExistingProposalForProperty } from '../../hooks/useExistingProposalForProperty';
import { CreateProposalButton } from './CreateProposalButton';
import { UpdateProposalButton } from './UpdateProposalButton';

export function ProposalActionsCard() {
  const {
    selectedPropertyId,
    selectedAddressText,
    materialsSummary,
    propertyDataStatus,
  } = useInstantEstimator();

  const { existingProposal, hasExistingProposal, isLoading: isCheckingExisting } = useExistingProposalForProperty();

  const hasPropertySelected = !!selectedPropertyId && !!selectedAddressText;
  const hasMaterialsCalculated = !!materialsSummary;
  const isReady = hasPropertySelected && hasMaterialsCalculated && propertyDataStatus === 'success';

  if (!hasPropertySelected) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Create Proposal</h3>
      </div>

      {!hasMaterialsCalculated && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Calculate materials to enable proposal creation.
        </p>
      )}

      {hasMaterialsCalculated && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate a proposal from this estimate with pre-filled materials and quantities.
        </p>
      )}

      {isCheckingExisting ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Checking for existing proposals...
        </div>
      ) : hasExistingProposal && existingProposal ? (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Draft proposal exists
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              {existingProposal.title}
            </p>
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
              Last updated: {new Date(existingProposal.updated_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <UpdateProposalButton
              proposalId={existingProposal.id}
              proposalTitle={existingProposal.title}
              disabled={!isReady}
            />
            <CreateProposalButton
              disabled={!isReady}
              variant="secondary"
              label="Create New Proposal"
            />
          </div>
        </div>
      ) : (
        <CreateProposalButton disabled={!isReady} />
      )}
    </div>
  );
}
