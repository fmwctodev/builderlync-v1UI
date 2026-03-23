import React from 'react';
import { ArrowUpRight, X, Info } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { TIER_HELPER_TEXT } from '../../config/tierConfig';

interface UpgradeModeBannerProps {
  fromProduct: string;
  toProduct: string;
  orderNumber: string;
  onCancel: () => void;
}

const UpgradeModeBanner: React.FC<UpgradeModeBannerProps> = ({
  fromProduct,
  toProduct,
  orderNumber,
  onCancel,
}) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
            <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Upgrade Mode
              </h3>
              <TierBadge tier="upgrade-only" />
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                {fromProduct} → {toProduct}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Upgrading Order <span className="font-medium">#{orderNumber}</span>
            </p>
            <div className="flex items-start gap-1.5 mt-2">
              <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {TIER_HELPER_TEXT.PREMIUM_LOCKED} Address and property are locked.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex-shrink-0"
          title="Cancel upgrade"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UpgradeModeBanner;
