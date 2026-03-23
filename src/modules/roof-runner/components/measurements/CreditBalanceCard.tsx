import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';

interface CreditBalanceCardProps {
  balance: number | null;
  isLoading: boolean;
  hasError: boolean;
  shortage: number;
  onRefresh: () => void;
}

export function CreditBalanceCard({
  balance,
  isLoading,
  hasError,
  shortage,
  onRefresh,
}: CreditBalanceCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
            <div className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Unable to load credit balance
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Please try again or contact support
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const displayBalance = balance ?? 0;
  const hasShortage = shortage > 0;

  return (
    <div className={`rounded-lg border p-4 ${
      hasShortage
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          hasShortage
            ? 'bg-amber-100 dark:bg-amber-900/30'
            : 'bg-green-100 dark:bg-green-900/30'
        }`}>
          <Wallet className={`w-5 h-5 ${
            hasShortage
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-green-600 dark:text-green-400'
          }`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Available Credits
          </p>
          <p className={`text-xl font-semibold ${
            hasShortage
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-gray-900 dark:text-white'
          }`}>
            {displayBalance} Credits
          </p>
          {hasShortage && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Need: {shortage} more credits
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh balance"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
