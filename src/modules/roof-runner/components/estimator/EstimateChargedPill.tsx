import React, { useState } from 'react';
import { Check, Sparkles, Clock } from 'lucide-react';
import type { PlanTierForBilling } from '../../types/instantEstimatorBilling';
import { isInstantEstimateFreeForTier, isChargeExpiringSoon, getChargeExpirationDays } from '../../types/instantEstimatorBilling';

interface EstimateChargedPillProps {
  planTier: PlanTierForBilling;
  creditsCharged: number;
  expiresAt?: string;
}

const EstimateChargedPill: React.FC<EstimateChargedPillProps> = ({
  planTier,
  creditsCharged,
  expiresAt,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isFree = isInstantEstimateFreeForTier(planTier);
  const expiringSoon = expiresAt ? isChargeExpiringSoon(expiresAt) : false;
  const daysRemaining = expiresAt ? getChargeExpirationDays(expiresAt) : 0;

  const formatExpirationDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const tooltipText = expiresAt
    ? `You won't be charged again for this property until ${formatExpirationDate(expiresAt)}`
    : 'This estimate has been generated';

  if (isFree) {
    return (
      <div
        className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Sparkles className="w-3 h-3" />
        <span>Included in {planTier === 'enterprise' ? 'Enterprise' : 'Pro'}</span>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
            {tooltipText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Check className="w-3 h-3" />
      <span>{creditsCharged} credit used</span>
      {expiringSoon && (
        <Clock className="w-3 h-3 text-amber-500" />
      )}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
          <div>{tooltipText}</div>
          {expiringSoon && daysRemaining > 0 && (
            <div className="text-amber-300 mt-1">
              Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateChargedPill;
