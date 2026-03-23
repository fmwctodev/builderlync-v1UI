import { Check, Lock, Info } from 'lucide-react';
import type { ProductId, AccountMode } from '../../types/measurementOrder';
import type { ProductCatalogItem } from '../../data/productCatalog';
import { getProductPricingDisplay } from '../../services/productPricingService';
import { isProductSelectable } from '../../utils/productSelectionRules';
import { TierBadge } from './TierBadge';
import { getProductTier, TIER_HELPER_TEXT } from '../../config/tierConfig';

interface ProductCardProps {
  product: ProductCatalogItem;
  isSelected: boolean;
  currentSelection: ProductId[];
  accountMode: AccountMode;
  onSelect: () => void;
  onDeselect: () => void;
  featureFlagsEnabled?: Record<string, boolean>;
}

export function ProductCard({
  product,
  isSelected,
  currentSelection,
  accountMode,
  onSelect,
  onDeselect,
  featureFlagsEnabled = {},
}: ProductCardProps) {
  const selectability = isProductSelectable(product.id, currentSelection);
  const isDisabled = !selectability.canSelect && !isSelected;
  const isLocked = product.isUpgradeOnly;
  const pricing = getProductPricingDisplay(product.id, accountMode);
  const tier = getProductTier(product.id);

  // Check if product requires a feature flag that is not enabled
  const isComingSoon = product.requiresFeatureFlag && !featureFlagsEnabled[product.requiresFeatureFlag];

  const handleClick = () => {
    if (isLocked || isDisabled || isComingSoon) return;
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isDisabled || isLocked || isComingSoon
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`
              font-medium text-base
              ${isSelected
                ? 'text-blue-900 dark:text-blue-100'
                : isDisabled || isLocked || isComingSoon
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }
            `}>
              {product.name}
            </h3>
            <TierBadge tier={tier} />
            {isComingSoon && product.comingSoonLabel && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Coming Soon - {product.comingSoonLabel}
              </span>
            )}
          </div>
          <p className={`
            mt-1 text-sm
            ${isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : isDisabled || isLocked || isComingSoon
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-600 dark:text-gray-400'
            }
          `}>
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <span className={`
              text-sm font-medium
              ${isSelected
                ? 'text-blue-700 dark:text-blue-300'
                : isDisabled || isLocked || isComingSoon
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-700 dark:text-gray-300'
              }
            `}>
              {pricing.text}
            </span>
          </div>

          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${isSelected
              ? 'border-blue-500 bg-blue-500'
              : isDisabled || isLocked || isComingSoon
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-300 dark:border-gray-600'
            }
          `}>
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      </div>

      {isComingSoon && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Info className="w-3 h-3" />
          <span>This product will be available in {product.comingSoonLabel || 'a future release'}</span>
        </div>
      )}

      {!isComingSoon && isDisabled && selectability.reason && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-3 h-3" />
          <span>{selectability.reason}</span>
        </div>
      )}

      {!isComingSoon && isLocked && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Info className="w-3 h-3" />
          <span>{TIER_HELPER_TEXT.PREMIUM_LOCKED}</span>
        </div>
      )}

      <div className="group relative inline-block mt-2">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          View details
        </button>
        <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
          <p className="font-medium mb-2">{product.name}</p>
          <ul className="space-y-1">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-blue-400 mt-0.5">-</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45" />
        </div>
      </div>
    </div>
  );
}
