import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Bug, Database, Clock, MapPin, Server } from 'lucide-react';
import { useEnvironment } from '../../hooks/useEnvironment';
import type { NormalizedPropertyData } from '../../types/propertyData';

interface EstimatorDebugPanelProps {
  propertyData: NormalizedPropertyData | null;
  addressText: string | null;
  accountMode: 'credits' | 'eagleview' | 'internal';
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const EstimatorDebugPanel: React.FC<EstimatorDebugPanelProps> = ({
  propertyData,
  addressText,
  accountMode,
  isLoading = false,
  error = null,
  className = '',
}) => {
  const { isNonProduction, environment, hostname } = useEnvironment();
  const [isExpanded, setIsExpanded] = useState(false);

  const debugInfo = useMemo(() => {
    return {
      environment,
      hostname,
      accountMode,
      hasPropertyData: !!propertyData,
      hasRoofArea: propertyData?.roofAreaSqFt !== null && propertyData?.roofAreaSqFt !== undefined,
      hasPitch: propertyData?.pitch !== null && propertyData?.pitch !== undefined,
      hasImages: (propertyData?.images?.length ?? 0) > 0,
      imageCount: propertyData?.images?.length ?? 0,
      responseFormat: propertyData?.responseFormat ?? 'unknown',
      source: propertyData?.source ?? 'N/A',
      fetchedAt: propertyData?.fetchedAt ?? null,
      hasRawData: !!propertyData?.raw,
    };
  }, [environment, hostname, accountMode, propertyData]);

  if (!isNonProduction) {
    return null;
  }

  const getStatusColor = (hasValue: boolean) => {
    return hasValue
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600 dark:text-amber-400';
  };

  const getStatusIcon = (hasValue: boolean) => {
    return hasValue ? 'check' : 'x';
  };

  return (
    <div className={`bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            QA Debug Panel
          </span>
          <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
            {environment}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Server className="w-3 h-3" />
                <span>Environment</span>
              </div>
              <div className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {debugInfo.environment} ({debugInfo.hostname})
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Database className="w-3 h-3" />
                <span>Account Mode</span>
              </div>
              <div className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {debugInfo.accountMode}
              </div>
            </div>
          </div>

          {addressText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>Address</span>
              </div>
              <div className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                {addressText}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
              Property Data Status
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(debugInfo.hasPropertyData)}`}>
                  {debugInfo.hasPropertyData ? 'Yes' : 'No'}
                </span>
                <span className="text-xs text-slate-500">Data Loaded</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(debugInfo.hasRoofArea)}`}>
                  {debugInfo.hasRoofArea ? 'Yes' : 'No'}
                </span>
                <span className="text-xs text-slate-500">Roof Area</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(debugInfo.hasPitch)}`}>
                  {debugInfo.hasPitch ? 'Yes' : 'No'}
                </span>
                <span className="text-xs text-slate-500">Pitch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(debugInfo.hasImages)}`}>
                  {debugInfo.imageCount > 0 ? debugInfo.imageCount : 'No'}
                </span>
                <span className="text-xs text-slate-500">Images</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
              Response Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Format:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {debugInfo.responseFormat}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Source:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {debugInfo.source}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Has Raw Data:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {debugInfo.hasRawData ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo.fetchedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Fetched:
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(debugInfo.fetchedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="bg-sky-100 dark:bg-sky-900/30 rounded px-3 py-2 text-sm text-sky-700 dark:text-sky-300">
              Loading property data...
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 rounded px-3 py-2 text-sm text-red-700 dark:text-red-300 break-all">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EstimatorDebugPanel;
