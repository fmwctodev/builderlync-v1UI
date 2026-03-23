import { useState } from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import BuyCreditsModal from './BuyCreditsModal';

interface InsufficientCreditsBannerProps {
  shortage: number;
  currentBalance?: number;
  requiredCredits?: number;
}

export function InsufficientCreditsBanner({
  shortage,
  currentBalance = 0,
  requiredCredits,
}: InsufficientCreditsBannerProps) {
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  return (
    <>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Insufficient credits to place this order
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              You need {shortage} more {shortage === 1 ? 'credit' : 'credits'} to complete this order.
              Purchase additional credits to continue.
            </p>
          </div>
          <button
            onClick={() => setShowBuyCreditsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            Buy Credits
          </button>
        </div>
      </div>

      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        currentBalance={currentBalance}
        requiredCredits={requiredCredits}
      />
    </>
  );
}
