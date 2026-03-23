import React from 'react';
import { X, ArrowUpRight, MapPin } from 'lucide-react';

interface UpgradeConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  orderNumber: string;
  addressText: string;
}

const UpgradeConfirmationModal: React.FC<UpgradeConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  orderNumber,
  addressText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upgrade to Premium?
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This places a new Premium order for the same property. The original BidPerfect order will remain in your history.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px]">
                Order:
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {orderNumber}
              </div>
            </div>
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
                Upgrade:
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">BidPerfect</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">Premium</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue to Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeConfirmationModal;
