import React, { useState } from 'react';
import { Zap, Info, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { EstimateSnapshot } from '../../../types/proposalIntegration';

interface EstimatorSourceBannerProps {
  snapshot: EstimateSnapshot;
  onRefresh?: () => void;
}

export function EstimatorSourceBanner({ snapshot, onRefresh }: EstimatorSourceBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Created from Instant Estimator
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                {snapshot.address_text}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Snapshot created: {formatDate(snapshot.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Refresh from estimate"
              >
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title={isExpanded ? 'Hide details' : 'View details'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">Roof Area</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1">
                {snapshot.roof_area_sqft
                  ? `${snapshot.roof_area_sqft.toLocaleString()} sq ft`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pitch</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1">
                {snapshot.pitch_effective ? `${snapshot.pitch_effective}:12` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">Bundles</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1">
                {snapshot.materials_calc_outputs?.bundlesRequired
                  ? Math.ceil(snapshot.materials_calc_outputs.bundlesRequired)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">Imagery</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1">
                {snapshot.imagery_included ? 'Included' : 'Not included'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
