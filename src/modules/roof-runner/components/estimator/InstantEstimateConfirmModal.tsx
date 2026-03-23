import React from 'react';
import { X, Zap, MapPin, Coins, Loader2 } from 'lucide-react';

interface InstantEstimateConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isCharging: boolean;
  creditCost: number;
  currentBalance: number;
  addressText: string;
}

const InstantEstimateConfirmModal: React.FC<InstantEstimateConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isCharging,
  creditCost,
  currentBalance,
  addressText,
}) => {
  if (!isOpen) return null;

  const hasEnoughCredits = currentBalance >= creditCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isCharging ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Use {creditCost} credit for this Instant Estimate?
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isCharging}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This will generate roof area data for this property. You won't be charged again for this property for 30 days.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
                Property:
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>{addressText}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
                Cost:
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>{creditCost} credit</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
                Balance:
              </div>
              <div className={`text-sm font-medium ${
                hasEnoughCredits
                  ? 'text-gray-900 dark:text-white'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {currentBalance} credit{currentBalance !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>

          {!hasEnoughCredits && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-sm text-red-700 dark:text-red-300">
                You need {creditCost} credit to generate this estimate.
              </span>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            After purchase, you can refresh the estimate data for this property at no additional cost for 30 days.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isCharging}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isCharging || !hasEnoughCredits}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCharging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Use Credit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantEstimateConfirmModal;
