import React, { useState } from 'react';
import { RefreshCw, Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProposalFromEstimate } from '../../hooks/useUpdateProposalFromEstimate';
import { UpdateProposalConfirmDialog } from './UpdateProposalConfirmDialog';
import { getProposalBuilderPath } from '../../utils/proposalNavigation';

interface UpdateProposalButtonProps {
  proposalId: string;
  proposalTitle: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function UpdateProposalButton({
  proposalId,
  proposalTitle,
  disabled = false,
  onSuccess,
}: UpdateProposalButtonProps) {
  const navigate = useNavigate();
  const { updateProposal, isUpdating, error, conflicts, clearError, clearConflicts } = useUpdateProposalFromEstimate();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    clearError();
    clearConflicts();
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setShowSuccess(false);

    const result = await updateProposal(proposalId);

    if (result) {
      setShowSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        setShowSuccess(false);
        navigate(getProposalBuilderPath(proposalId));
      }, 1500);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleViewProposal = () => {
    navigate(getProposalBuilderPath(proposalId));
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isUpdating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Updated!
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Update Existing Proposal
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={handleClick}
              className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {conflicts && conflicts.has_conflicts && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {conflicts.conflict_count} item(s) were not updated because they were manually edited.
            </p>
            <button
              onClick={handleViewProposal}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-1"
            >
              View proposal
            </button>
          </div>
        </div>
      )}

      <UpdateProposalConfirmDialog
        isOpen={showConfirmDialog}
        proposalTitle={proposalTitle}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
