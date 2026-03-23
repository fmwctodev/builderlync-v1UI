import React from 'react';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { useABCSupply } from '../../context/ABCSupplyContext';
import ShipToAccountSelector from './ShipToAccountSelector';
import BranchSelector from './BranchSelector';

interface AccountBranchHeaderProps {
  onAddAccount?: () => void;
  onViewCart?: () => void;
  showCartSummary?: boolean;
  className?: string;
}

export default function AccountBranchHeader({
  onAddAccount,
  onViewCart,
  showCartSummary = true,
  className = '',
}: AccountBranchHeaderProps) {
  const {
    selectedAccount,
    selectedBranch,
    cartItemCount,
    cartSubtotal,
    hasInvalidPricing,
  } = useABCSupply();

  const showWarning = !selectedAccount || !selectedBranch;

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
      {showWarning && (
        <div className="mb-4 flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">
              Select Account and Branch First
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              You must select a ship-to account and branch before searching for products.
              Product availability and pricing vary by branch.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <ShipToAccountSelector onAddAccount={onAddAccount} />
        </div>
        <div className="flex-1">
          <BranchSelector showHours />
        </div>
        {showCartSummary && cartItemCount > 0 && (
          <div className="flex-shrink-0">
            <button
              onClick={onViewCart}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                hasInvalidPricing
                  ? 'bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-primary-500/20 border border-primary-500/30 hover:bg-primary-500/30'
              }`}
            >
              <div className="relative">
                <ShoppingCart className={`h-5 w-5 ${hasInvalidPricing ? 'text-amber-400' : 'text-primary-400'}`} />
                <span className={`absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-bold rounded-full ${
                  hasInvalidPricing ? 'bg-amber-500 text-white' : 'bg-primary-500 text-white'
                }`}>
                  {cartItemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Cart Total</p>
                <p className={`text-sm font-semibold ${hasInvalidPricing ? 'text-amber-400' : 'text-white'}`}>
                  ${cartSubtotal.toFixed(2)}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {selectedAccount && selectedBranch && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Browsing products available at{' '}
            <span className="text-white font-medium">{selectedBranch.branchName}</span>
            {' '}for account{' '}
            <span className="text-white font-medium">
              {selectedAccount.accountName || `#${selectedAccount.accountNumber}`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
