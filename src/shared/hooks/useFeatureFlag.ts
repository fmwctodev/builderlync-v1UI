import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * Returns the feature flag status.
 * Defaults to TRUE while PostHog is still loading flags.
 * Only returns FALSE once PostHog has loaded and explicitly disabled the flag.
 */
export function useFeatureFlag(flag: string): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (!posthog.__loaded) {
      // Don't log this on every mount to avoid spam, but keep it for the very first check if needed
      return false;
    }
    const val = posthog.isFeatureEnabled(flag);
    // Return false by default if undefined or not found
    return val === undefined ? false : Boolean(val);
  });

  useEffect(() => {
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
  }, [flag]);

  return isEnabled;
}
