import React, { useState, useEffect } from 'react';
import { AlertTriangle, FlaskConical, X } from 'lucide-react';
import { useEnvironment } from '../../hooks/useEnvironment';

const STORAGE_KEY = 'staging_banner_dismissed';
const ESTIMATOR_STORAGE_KEY = 'estimator_staging_banner_dismissed';

interface StagingBannerProps {
  className?: string;
  variant?: 'default' | 'estimator';
}

const StagingBanner: React.FC<StagingBannerProps> = ({ className = '', variant = 'default' }) => {
  const { isNonProduction, environment } = useEnvironment();
  const [isDismissed, setIsDismissed] = useState(true);

  const storageKey = variant === 'estimator' ? ESTIMATOR_STORAGE_KEY : STORAGE_KEY;

  useEffect(() => {
    const dismissed = sessionStorage.getItem(storageKey);
    setIsDismissed(dismissed === 'true');
  }, [storageKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
  };

  if (!isNonProduction || isDismissed) {
    return null;
  }

  const environmentLabel = environment === 'staging' ? 'Staging' : 'Development';

  if (variant === 'estimator') {
    return (
      <div className={`bg-sky-50 dark:bg-sky-900/20 border-b border-sky-200 dark:border-sky-700 ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sky-800 dark:text-sky-200">
                  {environmentLabel} / Test Mode
                </p>
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  This environment uses limited sample property data. Some addresses may not return roof area, pitch, or imagery. Production behavior will differ.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {environmentLabel} Mode
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This environment uses limited sample addresses and may return only test reports. Production behavior will differ.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StagingBanner;
