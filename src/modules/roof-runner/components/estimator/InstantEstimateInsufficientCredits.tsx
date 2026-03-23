import React from 'react';
import { AlertTriangle, Coins, ShoppingCart } from 'lucide-react';

interface InstantEstimateInsufficientCreditsProps {
  currentBalance: number;
  requiredCredits: number;
  onBuyCredits: () => void;
}

const InstantEstimateInsufficientCredits: React.FC<InstantEstimateInsufficientCreditsProps> = ({
  currentBalance,
  requiredCredits,
  onBuyCredits,
}) => {
  const shortfall = requiredCredits - currentBalance;

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Insufficient Credits
          </h4>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            You need {requiredCredits} credit{requiredCredits !== 1 ? 's' : ''} to run an Instant Estimate.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span>
              Current balance: {currentBalance} credit{currentBalance !== 1 ? 's' : ''}
              <span className="mx-1">|</span>
              Need: {shortfall} more
            </span>
          </div>
          <button
            onClick={onBuyCredits}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantEstimateInsufficientCredits;
