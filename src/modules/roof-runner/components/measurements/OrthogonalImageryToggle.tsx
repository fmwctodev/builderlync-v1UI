import { Check, Image } from 'lucide-react';
import type { AccountMode } from '../../types/measurementOrder';
import { getAddOnPricingDisplay } from '../../services/productPricingService';
import { TierBadge } from './TierBadge';
import { TIER_HELPER_TEXT } from '../../config/tierConfig';

interface OrthogonalImageryToggleProps {
  isEnabled: boolean;
  isSelected: boolean;
  accountMode: AccountMode;
  onToggle: () => void;
}

export function OrthogonalImageryToggle({
  isEnabled,
  isSelected,
  accountMode,
  onToggle,
}: OrthogonalImageryToggleProps) {
  const pricing = getAddOnPricingDisplay('addon_orthogonal_imagery', accountMode);

  const handleClick = () => {
    if (!isEnabled) return;
    onToggle();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ml-6 mt-2 p-3 rounded-lg border-2 transition-all
        ${isEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${isSelected
          ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
          : isEnabled
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-200 dark:hover:border-blue-700'
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/30 opacity-50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            p-1.5 rounded
            ${isSelected
              ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }
          `}>
            <Image className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`
                text-sm font-medium
                ${isSelected
                  ? 'text-blue-800 dark:text-blue-200'
                  : isEnabled
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                Orthogonal Imagery
              </span>
              <TierBadge tier="pro-addon" size="sm" />
              <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                Recommended
              </span>
            </div>
            <p className={`
              text-xs mt-0.5
              ${isSelected
                ? 'text-blue-600 dark:text-blue-300'
                : isEnabled
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }
            `}>
              {TIER_HELPER_TEXT.ORTHOGONAL_IMAGERY}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`
            text-sm font-medium
            ${isSelected
              ? 'text-blue-600 dark:text-blue-300'
              : isEnabled
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-400 dark:text-gray-500'
            }
          `}>
            {pricing.text}
          </span>

          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
            ${isSelected
              ? 'border-blue-500 bg-blue-500'
              : isEnabled
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-200 dark:border-gray-600'
            }
          `}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>

      {!isEnabled && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Select Roof Area Estimate Data Pack to enable this add-on
        </p>
      )}
    </div>
  );
}
