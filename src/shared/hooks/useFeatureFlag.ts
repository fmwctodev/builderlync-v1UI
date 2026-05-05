import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { isStagingMode } from '../utils/stagingAuth';

/**
 * Returns the feature flag status.
 * Defaults to TRUE while PostHog is still loading flags.
 * Only returns FALSE once PostHog has loaded and explicitly disabled the flag.
 *
 * Staging override: when isStagingMode() is true (e.g. on bl-v2.netlify.app
 * or with VITE_BYPASS_AUTH=1), every flag returns true so QA can navigate
 * the full feature surface without PostHog being initialized.
 */
export function useFeatureFlag(flag: string): boolean {
  const stagingOverride = isStagingMode();

  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (stagingOverride) return true;
    if (!posthog.__loaded) {
      // Don't log this on every mount to avoid spam, but keep it for the very first check if needed
      return false;
    }
    const val = posthog.isFeatureEnabled(flag);
    // Return false by default if undefined or not found
    return val === undefined ? false : Boolean(val);
  });

  useEffect(() => {
    if (stagingOverride) {
      setIsEnabled(true);
      return;
    }

    const checkFlag = () => {
      const val = posthog.isFeatureEnabled(flag);
      const resolved = val === undefined ? false : Boolean(val);

      console.log(`[FeatureFlag] Update for "${flag}":`, {
        raw: val,
        resolved,
        distinctId: posthog.get_distinct_id()
      });

      setIsEnabled(resolved);
    };

    // Initial check in case it loaded between state init and effect
    if (posthog.__loaded) {
      checkFlag();
    }

    // Register listener for flag updates
    const unregister = posthog.onFeatureFlags(checkFlag);

    // Cleanup listener on unmount
    return () => {
      if (typeof unregister === 'function') {
        unregister();
      }
    };
  }, [flag, stagingOverride]);

  return isEnabled;
}
