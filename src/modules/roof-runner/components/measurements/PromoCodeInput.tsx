import React, { useState } from 'react';
import { Tag, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import { formatPromoDiscount } from '../../services/promoCodeService';

interface PromoCodeInputProps {
  className?: string;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ className = '' }) => {
  const {
    accountMode,
    promoCode,
    promoStatus,
    promoResult,
    promoError,
    creditBreakdown,
    applyPromoCode,
    clearPromoCode,
  } = useMeasurementOrderContext();

  const [inputValue, setInputValue] = useState('');

  const isCreditsMode = accountMode === 'credits';
  const isValidating = promoStatus === 'validating';
  const hasValidPromo = promoStatus === 'valid' && promoResult?.isValid;
  const hasError = promoStatus === 'invalid' || promoStatus === 'error';

  const handleApply = async () => {
    if (!inputValue.trim() || isValidating) return;
    await applyPromoCode(inputValue);
    if (promoStatus === 'valid') {
      setInputValue('');
    }
  };

  const handleClear = () => {
    clearPromoCode();
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  if (!isCreditsMode) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Tag className="w-4 h-4" />
        Promo Code
      </label>

      {hasValidPromo && promoResult ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {promoResult.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {promoCode}
                  </code>
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {formatPromoDiscount(promoResult)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Remove promo code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Original Total</span>
              <span className="text-gray-700 dark:text-gray-300">
                {creditBreakdown.totalCredits} credits
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-700 dark:text-green-400">Discount</span>
              <span className="text-green-700 dark:text-green-400 font-medium">
                -{promoResult.calculatedDiscount} credits
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter promo code"
                disabled={isValidating}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase placeholder:normal-case disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasError
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={!inputValue.trim() || isValidating}
              className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[80px] justify-center"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {hasError && promoError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{promoError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
