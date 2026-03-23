import { X, Trash2, ArrowRight } from 'lucide-react';
import type { ProductId, AddOnId, AccountMode } from '../../types/measurementOrder';
import { getProductById, getAddOnById } from '../../data/productCatalog';
import { getTotalPricingDisplay } from '../../services/productPricingService';
import { canContinue } from '../../utils/productSelectionRules';
import { TierBadge } from './TierBadge';
import { getProductTier, getAddOnTier } from '../../config/tierConfig';

interface SelectionSummaryBarProps {
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  accountMode: AccountMode;
  onRemoveProduct: (productId: ProductId) => void;
  onRemoveAddOn: (addOnId: AddOnId) => void;
  onClearAll: () => void;
  onContinue: () => void;
}

export function SelectionSummaryBar({
  selectedProducts,
  selectedAddOns,
  accountMode,
  onRemoveProduct,
  onRemoveAddOn,
  onClearAll,
  onContinue,
}: SelectionSummaryBarProps) {
  const totalItems = selectedProducts.length + selectedAddOns.length;
  const canProceed = canContinue(selectedProducts);
  const totalPricing = getTotalPricingDisplay(selectedProducts, selectedAddOns, accountMode);

  if (totalItems === 0) {
    return (
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select at least one product to continue
          </p>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {totalPricing.text}
            </span>
            <button
              onClick={onClearAll}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              title="Clear all selections"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((productId) => {
              const product = getProductById(productId);
              if (!product) return null;
              const tier = getProductTier(productId);
              return (
                <span
                  key={productId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                >
                  {product.name}
                  <TierBadge tier={tier} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProduct(productId);
                    }}
                    className="ml-0.5 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedAddOns.map((addOnId) => {
              const addOn = getAddOnById(addOnId);
              if (!addOn) return null;
              const tier = getAddOnTier(addOnId);
              return (
                <span
                  key={addOnId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full"
                >
                  {addOn.name}
                  <TierBadge tier={tier} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAddOn(addOnId);
                    }}
                    className="ml-0.5 p-0.5 hover:bg-green-200 dark:hover:bg-green-800/50 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <button
          onClick={onContinue}
          disabled={!canProceed}
          className={`
            flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
            ${canProceed
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
