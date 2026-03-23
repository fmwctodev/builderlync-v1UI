import React from 'react';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

interface UpdateProposalConfirmDialogProps {
  isOpen: boolean;
  proposalTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UpdateProposalConfirmDialog({
  isOpen,
  proposalTitle,
  onConfirm,
  onCancel,
}: UpdateProposalConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onCancel}
              className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 pb-4 pt-5 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <RefreshCw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                  Update Proposal
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update <span className="font-medium text-gray-700 dark:text-gray-300">"{proposalTitle}"</span> with the latest estimate values?
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-medium">Items you manually edited will be preserved</p>
                  <p className="mt-1 text-amber-600 dark:text-amber-400">
                    Only items that haven't been modified will be updated with new quantities from this estimate.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">What will happen:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Material quantities will be updated from the estimate</li>
                <li>Manually edited line items will not change</li>
                <li>Property details will be updated</li>
                <li>New snapshot will be linked to the proposal</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 sm:ml-3 sm:w-auto"
            >
              Update Proposal
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
