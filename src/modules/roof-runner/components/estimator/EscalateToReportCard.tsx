import React from 'react';
import {
  FileBarChart,
  History,
  MapPin,
  Ruler,
  Check,
  Loader2,
} from 'lucide-react';

interface EscalateToReportCardProps {
  propertyId: string | null;
  addressText: string | null;
  roofAreaSqFt: number | null;
  effectivePitch: number | null;
  onOrderReport: () => void;
  onViewHistory: () => void;
  disabled?: boolean;
  draftSaved?: boolean;
  isSaving?: boolean;
}

export function EscalateToReportCard({
  propertyId,
  addressText,
  roofAreaSqFt,
  onOrderReport,
  onViewHistory,
  disabled = false,
  draftSaved = false,
  isSaving = false,
}: EscalateToReportCardProps) {
  const isDisabled = disabled || !propertyId;

  const formatRoofArea = (area: number | null): string => {
    if (area === null) return '--';
    return `${area.toLocaleString()} sq ft`;
  };

  const truncateAddress = (address: string | null, maxLength: number = 40): string => {
    if (!address) return '--';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Ready for detailed measurements?
          </h3>
          {draftSaved && !isSaving && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">Saved</span>
            </div>
          )}
          {isSaving && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Saving...</span>
            </div>
          )}
        </div>

        {!isDisabled && addressText && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {truncateAddress(addressText)}
              </span>
            </div>
            {roofAreaSqFt !== null && (
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Est. {formatRoofArea(roofAreaSqFt)}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onOrderReport}
          disabled={isDisabled || isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Draft...
            </>
          ) : (
            <>
              <FileBarChart className="w-4 h-4" />
              Order a Measurement Report
            </>
          )}
        </button>

        {isDisabled && (
          <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
            Select an address first to order a report
          </p>
        )}

        <button
          onClick={onViewHistory}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
        >
          <History className="w-4 h-4" />
          View Order History
        </button>
      </div>
    </div>
  );
}

export default EscalateToReportCard;
