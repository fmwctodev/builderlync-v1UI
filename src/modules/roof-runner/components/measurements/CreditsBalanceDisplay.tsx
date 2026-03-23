import React from 'react';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';

interface CreditsBalanceDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
}

const CreditsBalanceDisplay: React.FC<CreditsBalanceDisplayProps> = ({
  className = '',
  showRefreshButton = false,
}) => {
  const { creditBalance, isLoadingCredits, refreshCreditBalance, error } = useMeasurementOrderContext();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoadingCredits) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-3 text-red-600 dark:text-red-400 ${className}`}>
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Failed to load balance</span>
        {showRefreshButton && (
          <button
            onClick={refreshCreditBalance}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  const balance = creditBalance?.balance ?? 0;
  const isZeroBalance = balance === 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        isZeroBalance
          ? 'bg-gray-100 dark:bg-gray-700'
          : 'bg-green-100 dark:bg-green-900/30'
      }`}>
        <Wallet className={`h-5 w-5 ${
          isZeroBalance
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-green-600 dark:text-green-400'
        }`} />
      </div>
      <div>
        <div className={`text-lg font-semibold ${
          isZeroBalance
            ? 'text-gray-600 dark:text-gray-400'
            : 'text-gray-900 dark:text-white'
        }`}>
          {formatCurrency(balance)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isZeroBalance ? (
            'No credits available'
          ) : creditBalance?.updatedAt ? (
            `Updated ${formatDate(creditBalance.updatedAt)}`
          ) : (
            'Available balance'
          )}
        </div>
      </div>
      {showRefreshButton && (
        <button
          onClick={refreshCreditBalance}
          disabled={isLoadingCredits}
          className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingCredits ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default CreditsBalanceDisplay;
