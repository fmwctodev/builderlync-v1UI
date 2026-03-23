import React from 'react';
import { Home, Ruler, TrendingUp, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import type { PropertyData, PropertyDataStatus, PropertyDataError } from '../../types/propertyData';
import { formatRoofArea, formatPitch } from '../../types/propertyData';
import { getTierDisplayName } from '../../config/creditMappingConfig';
import { TierBadge } from './TierBadge';
import { getSubscriptionTier, TIER_HELPER_TEXT } from '../../config/tierConfig';

interface PropertyDataPreviewCardProps {
  data: PropertyData | null;
  status: PropertyDataStatus;
  error: PropertyDataError | null;
  subscriptionTier: string | null;
  onRetry?: () => void;
}

function PropertyDataSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

function PropertyDataErrorState({
  error,
  onRetry,
}: {
  error: PropertyDataError;
  onRetry?: () => void;
}) {
  const getErrorMessage = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Check your internet connection.';
      case 'NOT_FOUND':
        return 'Property data not found for this address.';
      case 'UNAUTHORIZED':
        return 'Session expired. Please re-authenticate.';
      default:
        return error.message || 'Unable to fetch roof data.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {getErrorMessage()}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

function PropertyDataIdleState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Home className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select an address to preview roof data
      </p>
    </div>
  );
}

function PropertyDataContent({ data }: { data: PropertyData }) {
  const formattedDate = new Date(data.fetchedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Ruler className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Roof Area
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatRoofArea(data.roofAreaSqFt)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Pitch
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPitch(data.pitch, data.pitchDescription)}
            </p>
          </div>
        </div>
      </div>

      {data.confidence !== null && data.confidence > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.round(data.confidence * 100)}%` }}
            />
          </div>
          <span>{Math.round(data.confidence * 100)}% confidence</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Clock className="w-3 h-3" />
        <span>Updated {formattedDate}</span>
        {data.source && data.source !== 'mock' && (
          <span className="ml-1">via {data.source}</span>
        )}
      </div>
    </div>
  );
}

export function PropertyDataPreviewCard({
  data,
  status,
  error,
  subscriptionTier,
  onRetry,
}: PropertyDataPreviewCardProps) {
  const tierName = getTierDisplayName(subscriptionTier);
  const tierType = getSubscriptionTier(tierName);
  const helperText = tierType === 'pro' ? TIER_HELPER_TEXT.PROPERTY_DATA_PRO : TIER_HELPER_TEXT.PROPERTY_DATA_BASIC;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Property Data Preview
          </h3>
          <TierBadge tier={tierType} />
        </div>
        {status === 'loading' && (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {helperText}
      </p>

      {status === 'idle' && <PropertyDataIdleState />}
      {status === 'loading' && <PropertyDataSkeleton />}
      {status === 'error' && error && (
        <PropertyDataErrorState error={error} onRetry={onRetry} />
      )}
      {status === 'success' && data && <PropertyDataContent data={data} />}
    </div>
  );
}
