import { Package, Puzzle, AlertTriangle, FileText, Tag } from 'lucide-react';
import type { CreditBreakdownItem } from '../../types/measurementOrder';

interface CreditBreakdownTableProps {
  items: CreditBreakdownItem[];
  totalCredits: number;
  promoDiscount?: number;
  adjustedTotal?: number;
  promoName?: string;
}

export function CreditBreakdownTable({
  items,
  totalCredits,
  promoDiscount = 0,
  adjustedTotal,
  promoName,
}: CreditBreakdownTableProps) {
  const finalTotal = adjustedTotal ?? totalCredits;
  const hasPromo = promoDiscount > 0;
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No items selected
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Go back to select products for your order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Order Summary
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded ${
                item.type === 'product'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-teal-100 dark:bg-teal-900/30'
              }`}>
                {item.type === 'product' ? (
                  <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Puzzle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {item.type === 'addon' ? 'Add-on' : 'Product'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {item.credits !== null ? (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.credits} {item.credits === 1 ? 'Credit' : 'Credits'}
                </span>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-xs">Cost unavailable</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Subtotal
          </span>
          <span className={`text-sm ${hasPromo ? 'text-gray-500 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-white'}`}>
            {totalCredits} Credits
          </span>
        </div>

        {hasPromo && (
          <div className="flex items-center justify-between text-green-600 dark:text-green-400">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-sm">
                {promoName || 'Promo discount'}
              </span>
            </div>
            <span className="text-sm font-medium">
              -{promoDiscount} Credits
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Total Credits Required
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {finalTotal} Credits
          </span>
        </div>
      </div>
    </div>
  );
}
