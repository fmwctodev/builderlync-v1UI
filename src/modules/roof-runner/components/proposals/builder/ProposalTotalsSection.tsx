import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ProposalTotals } from '../../../types/proposalIntegration';

interface ProposalTotalsSectionProps {
  totals: ProposalTotals;
}

export function ProposalTotalsSection({ totals }: ProposalTotalsSectionProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-4">
      {totals.items_needing_pricing > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {totals.items_needing_pricing} item(s) need pricing. Set unit prices to calculate totals.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${totals.subtotal.toFixed(2)}
            </span>
          </div>

          {totals.tax_rate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax ({(totals.tax_rate * 100).toFixed(1)}%)
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${totals.tax_amount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${totals.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
