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
      console.log(`[FeatureFlag] PostHog not loaded yet, defaulting "${flag}" to TRUE`);
      return true;
    }
    const val = posthog.isFeatureEnabled(flag);
    console.log(`[FeatureFlag] Initial check for "${flag}":`, val);
    return val === undefined ? true : Boolean(val);
  });

  useEffect(() => {
    console.log(`[FeatureFlag] Registering onFeatureFlags listener for "${flag}"`);

    posthog.onFeatureFlags(() => {
      const val = posthog.isFeatureEnabled(flag);
      const resolved = val === undefined ? false : Boolean(val);

      // Log the full PostHog state for debugging
      console.log(`[FeatureFlag] Flags loaded from PostHog:`);
      console.log(`  - Flag key:      "${flag}"`);
      console.log(`  - Raw value:     `, val);
      console.log(`  - Resolved:      `, resolved);
      console.log(`  - Distinct ID:   `, posthog.get_distinct_id());
      
      setIsEnabled(resolved);
    });
  }, [flag]);

  return isEnabled;
}
