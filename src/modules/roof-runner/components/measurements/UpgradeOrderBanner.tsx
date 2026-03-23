import React from 'react';
import { ArrowUpCircle, ExternalLink } from 'lucide-react';

interface UpgradeOrderBannerProps {
  upgradeFromOrderId: string;
  onViewSourceOrder?: (orderId: string) => void;
}

export function UpgradeOrderBanner({ upgradeFromOrderId, onViewSourceOrder }: UpgradeOrderBannerProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <ArrowUpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Upgrade Order
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          This order was upgraded from a previous BidPerfect report
        </p>
      </div>
      {onViewSourceOrder && (
        <button
          onClick={() => onViewSourceOrder(upgradeFromOrderId)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
        >
          View Source
          <ExternalLink className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
