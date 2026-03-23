import React from 'react';
import { Info, X, Zap } from 'lucide-react';

export type PrefilledSource = 'instant_estimator' | 'upgrade' | 'proposal' | 'job';

interface PrefilledBannerProps {
  source: PrefilledSource;
  addressText?: string | null;
  onDismiss: () => void;
}

const SOURCE_DISPLAY: Record<PrefilledSource, { label: string; icon: React.ElementType }> = {
  instant_estimator: { label: 'Instant Estimator', icon: Zap },
  upgrade: { label: 'Order Upgrade', icon: Info },
  proposal: { label: 'Proposal', icon: Info },
  job: { label: 'Job', icon: Info },
};

export function PrefilledBanner({
  source,
  addressText,
  onDismiss,
}: PrefilledBannerProps) {
  const sourceInfo = SOURCE_DISPLAY[source] || SOURCE_DISPLAY.instant_estimator;
  const Icon = sourceInfo.icon;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-800/40 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Prefilled from {sourceInfo.label}
            </p>
            {addressText && (
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-0.5">
                {addressText}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PrefilledBanner;
