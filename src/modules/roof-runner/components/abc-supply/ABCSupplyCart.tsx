import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  RefreshCw,
  Phone,
  ArrowRight,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { useABCSupply, CartItem } from '../../context/ABCSupplyContext';

interface ABCSupplyCartProps {
  onBack: () => void;
  onCheckout: () => void;
}

export default function ABCSupplyCart({ onBack, onCheckout }: ABCSupplyCartProps) {
  const {
    cartItems,
    selectedAccount,
    selectedBranch,
    cartSubtotal,
    cartItemCount,
    hasInvalidPricing,
    hasContactForPriceItems,
    isReadyToOrder,
    getValidationErrors,
    updateCartItemQuantity,
    updateCartItemUom,
    removeFromCart,
    clearCart,
    refreshPricing,
  } = useABCSupply();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleRefreshPricing = async () => {
    setIsRefreshing(true);
    try {
      await refreshPricing();
    } finally {
      setIsRefreshing(false);
    }
  };

  const validationErrors = getValidationErrors();

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-700 rounded-lg p-6">
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white text-sm mb-2"
          >
            ← Back to Products
          </button>
          <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Your Cart is Empty</h3>
          <p className="text-gray-400 mb-6">Add items from the product catalog to get started</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 rounded-lg p-6">
        <button
          onClick={onBack}
          className="text-white/70 hover:text-white text-sm mb-2"
        >
          ← Back to Products
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
            <p className="text-white/70 mt-1">
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshPricing}
              disabled={isRefreshing || !selectedAccount || !selectedBranch}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Prices
            </button>
            <button
              onClick={clearCart}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg text-red-300 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {selectedAccount && selectedBranch && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            Pricing for{' '}
            <span className="text-white font-medium">{selectedBranch.branchName}</span>
            {' '}(Branch #{selectedBranch.branchNumber}) using account{' '}
            <span className="text-white font-medium">
              {selectedAccount.accountName || `#${selectedAccount.accountNumber}`}
            </span>
          </p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400 mb-2">
                Please resolve the following before checkout:
              </p>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-amber-400/80 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                UOM
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.product.itemNumber}
                item={item}
                onUpdateQuantity={(qty) => updateCartItemQuantity(item.product.itemNumber, qty)}
                onUpdateUom={(uom) => updateCartItemUom(item.product.itemNumber, uom)}
                onRemove={() => removeFromCart(item.product.itemNumber)}
                isExpanded={expandedItem === item.product.itemNumber}
                onToggleExpand={() => setExpandedItem(
                  expandedItem === item.product.itemNumber ? null : item.product.itemNumber
                )}
                branchPhone={selectedBranch?.phone}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal ({cartItemCount} items)</span>
              <span className="text-white font-medium">${cartSubtotal.toFixed(2)}</span>
            </div>
            {hasInvalidPricing && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Some items have pricing issues
              </p>
            )}
            {hasContactForPriceItems && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Some items require contacting the branch
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Continue Shopping
            </button>
            <button
              onClick={onCheckout}
              disabled={!isReadyToOrder}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (qty: number) => void;
  onUpdateUom: (uom: string) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  branchPhone?: string | null;
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onUpdateUom,
  onRemove,
  isExpanded,
  onToggleExpand,
  branchPhone,
}: CartItemRowProps) {
  const { product, quantity, uom, pricing, isLoading, error } = item;

  return (
    <>
      <tr className={`${error || pricing?.requiresContactForPrice ? 'bg-amber-500/5' : ''}`}>
        <td className="px-6 py-4">
          <div>
            <p className="text-sm font-medium text-white">{product.familyName}</p>
            <p className="text-xs text-gray-400">{product.itemNumber}</p>
            <p className="text-xs text-gray-500 mt-1">{product.manufacturer}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          {product.availableUoms.length > 1 ? (
            <select
              value={uom}
              onChange={(e) => onUpdateUom(e.target.value)}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {product.availableUoms.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-300">{uom}</span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              <Minus className="h-4 w-4 text-gray-400" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onUpdateQuantity(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-center text-sm bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="p-1 rounded hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin ml-auto" />
          ) : pricing?.requiresContactForPrice ? (
            <span className="text-xs text-amber-400">Contact branch</span>
          ) : pricing?.isValid ? (
            <span className="text-sm text-white">${pricing.unitPrice.toFixed(2)}</span>
          ) : (
            <span className="text-xs text-red-400">No price</span>
          )}
        </td>
        <td className="px-6 py-4 text-right">
          {isLoading ? (
            <span className="text-gray-400">...</span>
          ) : pricing?.isValid && !pricing.requiresContactForPrice ? (
            <span className="text-sm font-medium text-white">
              ${pricing.totalPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {(error || pricing?.requiresContactForPrice) && (
              <button
                onClick={onToggleExpand}
                className="p-1 rounded hover:bg-gray-700"
              >
                <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (error || pricing?.requiresContactForPrice) && (
        <tr className="bg-amber-500/10">
          <td colSpan={6} className="px-6 py-3">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400">
                {pricing?.requiresContactForPrice
                  ? 'This item requires contacting the branch for pricing.'
                  : error}
              </span>
              {branchPhone && (
                <a
                  href={`tel:${branchPhone}`}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 rounded text-amber-300 hover:bg-amber-500/30"
                >
                  <Phone className="h-3 w-3" />
                  {branchPhone}
                </a>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
