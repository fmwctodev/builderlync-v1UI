import React from 'react';
import { Sparkles, Coins } from 'lucide-react';
import type { PlanTierForBilling } from '../../types/instantEstimatorBilling';
import { isInstantEstimateFreeForTier, getInstantEstimateCreditCost } from '../../types/instantEstimatorBilling';

interface InstantEstimateEntitlementInfoProps {
  planTier: PlanTierForBilling | null;
  isLoading?: boolean;
}

const InstantEstimateEntitlementInfo: React.FC<InstantEstimateEntitlementInfoProps> = ({
  planTier,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse">
        <div className="w-3.5 h-3.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    );
  }

  const tier = planTier || 'standard';
  const isFree = isInstantEstimateFreeForTier(tier);
  const creditCost = getInstantEstimateCreditCost(tier);

  if (isFree) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Instant Estimate: Included</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
      <Coins className="w-3.5 h-3.5" />
      <span>Instant Estimate: {creditCost} credit</span>
    </div>
  );
};

export default InstantEstimateEntitlementInfo;
