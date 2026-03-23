import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateProposalFromEstimate } from '../../hooks/useCreateProposalFromEstimate';

interface CreateProposalButtonProps {
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  label?: string;
  onSuccess?: (proposalId: string) => void;
}

export function CreateProposalButton({
  disabled = false,
  variant = 'primary',
  label = 'Create Proposal',
  onSuccess,
}: CreateProposalButtonProps) {
  const { createProposal, isCreating, error, clearError } = useCreateProposalFromEstimate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    clearError();
    setShowSuccess(false);

    const proposalId = await createProposal({ navigateOnSuccess: true });

    if (proposalId) {
      setShowSuccess(true);
      onSuccess?.(proposalId);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const baseClasses = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = variant === 'primary'
    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:hover:bg-blue-600"
    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600";

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isCreating}
        className={`${baseClasses} ${variantClasses}`}
        title={disabled ? 'Materials calculation required' : undefined}
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Proposal Created!
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            {label}
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
    </div>
  );
}
