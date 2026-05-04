import React, { useState, useMemo } from 'react';
import {
  Ruler,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Home,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Pencil,
  X,
  Check,
  Zap,
  Loader2,
} from 'lucide-react';
import type { PropertyData, PropertyDataStatus, PropertyDataError, PitchValue } from '../../types/propertyData';
import type { EstimateChargeStatus, InstantEstimateChargeRecord, PlanTierForBilling } from '../../types/instantEstimatorBilling';
import { formatRoofArea } from '../../types/propertyData';
import { validatePitch, formatPitchDisplay } from '../../utils/pitchUtils';
import { isFeatureEnabled, isNonProductionEnvironment } from '../../config/featureFlags';
import InstantEstimateEntitlementInfo from './InstantEstimateEntitlementInfo';
import EstimateChargedPill from './EstimateChargedPill';
import InstantEstimateInsufficientCredits from './InstantEstimateInsufficientCredits';

interface RoofDataPreviewCardProps {
  data: PropertyData | null;
  status: PropertyDataStatus;
  error: PropertyDataError | null;
  onRefresh: () => void;
  pitchOverride?: PitchValue;
  effectivePitch?: PitchValue;
  onPitchOverride?: (pitch: number | null) => void;
  chargeStatus?: EstimateChargeStatus;
  chargeRecord?: InstantEstimateChargeRecord | null;
  planTier?: PlanTierForBilling | null;
  creditBalance?: number | null;
  isLoadingOrgContext?: boolean;
  onGenerateEstimate?: () => void;
  canGenerate?: boolean;
  isInstantEstimateFree?: boolean;
  instantEstimateCreditCost?: number;
  onBuyCredits?: () => void;
  hasPropertySelected?: boolean;
}

export function RoofDataPreviewCard({
  data,
  status,
  error,
  onRefresh,
  pitchOverride,
  effectivePitch,
  onPitchOverride,
  chargeStatus = 'idle',
  chargeRecord,
  planTier,
  creditBalance,
  isLoadingOrgContext = false,
  onGenerateEstimate,
  canGenerate = true,
  isInstantEstimateFree = false,
  instantEstimateCreditCost = 1,
  onBuyCredits,
  hasPropertySelected = false,
}: RoofDataPreviewCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditingPitch, setIsEditingPitch] = useState(false);
  const [pitchInputValue, setPitchInputValue] = useState('');
  const [pitchInputError, setPitchInputError] = useState<string | null>(null);

  const apiPitch = data?.pitch ?? null;
  const hasOverride = pitchOverride !== null && pitchOverride !== undefined;
  const canEditPitch = apiPitch !== null && onPitchOverride;

  const showRawDataFeatureEnabled = useMemo(() => {
    return isFeatureEnabled('SHOW_RAW_PROPERTY_DATA');
  }, []);

  const canShowRawData = useMemo(() => {
    return showRawDataFeatureEnabled && data?.raw && Object.keys(data.raw).length > 0;
  }, [showRawDataFeatureEnabled, data?.raw]);

  const isNonProd = useMemo(() => isNonProductionEnvironment(), []);

  const hasMissingData = useMemo(() => {
    if (!data) return false;
    return data.roofAreaSqFt === null || data.pitch === null;
  }, [data]);

  const showInsufficientCredits =
    !isInstantEstimateFree &&
    !chargeRecord &&
    creditBalance !== null &&
    creditBalance < instantEstimateCreditCost;

  const isCharging = chargeStatus === 'charging' || chargeStatus === 'checking';

  const handleStartEditPitch = () => {
    setPitchInputValue(effectivePitch?.toString() || '');
    setPitchInputError(null);
    setIsEditingPitch(true);
  };

  const handleCancelEditPitch = () => {
    setIsEditingPitch(false);
    setPitchInputValue('');
    setPitchInputError(null);
  };

  const handleSavePitch = () => {
    const validation = validatePitch(pitchInputValue);
    if (!validation.valid) {
      setPitchInputError(validation.error || 'Invalid pitch');
      return;
    }
    onPitchOverride?.(validation.numericValue!);
    setIsEditingPitch(false);
    setPitchInputValue('');
    setPitchInputError(null);
  };

  const handleResetPitch = () => {
    onPitchOverride?.(null);
  };

  const handlePitchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitchInputValue(e.target.value);
    setPitchInputError(null);
  };

  const handlePitchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSavePitch();
    } else if (e.key === 'Escape') {
      handleCancelEditPitch();
    }
  };

  if (status === 'idle' && !hasPropertySelected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <Home className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select an address to load roof data
          </p>
        </div>
      </div>
    );
  }

  if (status === 'idle' && hasPropertySelected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Generate Instant Estimate
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-xs">
            Get roof area and pitch data for this property instantly.
          </p>

          <div className="mb-4">
            <InstantEstimateEntitlementInfo
              planTier={planTier || null}
              isLoading={isLoadingOrgContext}
            />
          </div>

          {showInsufficientCredits && onBuyCredits ? (
            <InstantEstimateInsufficientCredits
              currentBalance={creditBalance || 0}
              requiredCredits={instantEstimateCreditCost}
              onBuyCredits={onBuyCredits}
            />
          ) : (
            <button
              onClick={onGenerateEstimate}
              disabled={!canGenerate || isCharging}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isCharging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {chargeStatus === 'checking' ? 'Checking...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Estimate
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-1" />
          </div>
          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading roof data...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800/50 p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            Unable to load roof data
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {isNonProd && (
            <div className="mb-4 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg max-w-sm">
              <p className="text-xs text-sky-700 dark:text-sky-300">
                Test environment: This address may not have sample data configured. Try a different test address or check the Postman collection.
              </p>
            </div>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatRelativeTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Roof Data Preview
              </h3>
              {chargeRecord && planTier && (
                <EstimateChargedPill
                  planTier={planTier}
                  creditsCharged={chargeRecord.credits_charged}
                  expiresAt={chargeRecord.expires_at}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Powered by property data
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={status === 'loading'}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Ruler className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Roof Area</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRoofArea(data?.roofAreaSqFt ?? null)}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Pitch</span>
            </div>
            {isEditingPitch ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pitchInputValue}
                    onChange={handlePitchInputChange}
                    onKeyDown={handlePitchKeyDown}
                    placeholder="e.g., 6"
                    className={`w-16 px-2 py-1 text-lg font-bold border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      pitchInputError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    autoFocus
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">/12</span>
                  <button
                    onClick={handleSavePitch}
                    className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEditPitch}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {pitchInputError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{pitchInputError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPitchDisplay(effectivePitch ?? apiPitch, hasOverride)}
                </p>
                {canEditPitch && !hasOverride && (
                  <button
                    onClick={handleStartEditPitch}
                    className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 opacity-60 hover:opacity-100 transition-opacity"
                    title="Edit pitch"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {hasOverride && onPitchOverride && (
                  <button
                    onClick={handleResetPitch}
                    className="ml-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Source: {data?.source || 'Unknown'}</span>
          </div>
          {data?.fetchedAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(data.fetchedAt)}</span>
            </div>
          )}
        </div>

        {isNonProd && hasMissingData && (
          <div className="mt-4 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg">
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Test environment: Some data fields may be unavailable for this sample address. Production will have complete data.
            </p>
          </div>
        )}

        {canShowRawData && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View details
              </>
            )}
          </button>
        )}
      </div>

      {showDetails && canShowRawData && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-paper dark:bg-canvas/50 p-4">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Raw API Response
          </h4>
          <div className="max-h-64 overflow-auto rounded-lg bg-gray-900 dark:bg-gray-950 p-4">
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(data?.raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
