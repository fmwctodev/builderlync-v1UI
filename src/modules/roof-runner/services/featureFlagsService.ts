import { supabase } from '../../../shared/lib/supabase';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string | null;
  status: 'off' | 'beta' | 'on';
  rollout_type: 'all' | 'beta' | 'percentage' | 'accounts';
  rollout_config: {
    percentage?: number;
    accountIds?: string[];
  };
}

const featureFlagsCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function checkFeatureFlag(flagKey: string): Promise<boolean> {
  // Check cache first
  const cached = featureFlagsCache.get(flagKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }

  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('status, rollout_type, rollout_config')
      .eq('key', flagKey)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching feature flag ${flagKey}:`, error);
      return false;
    }

    if (!data) {
      return false;
    }

    // Simple check: if status is 'on', feature is enabled
    const isEnabled = data.status === 'on';

    // Cache the result
    featureFlagsCache.set(flagKey, { value: isEnabled, timestamp: Date.now() });

    return isEnabled;
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
    return false;
  }
}

export async function getFeatureFlags(flagKeys: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('key, status, rollout_type, rollout_config')
      .in('key', flagKeys);

    if (error) {
      console.error('Error fetching feature flags:', error);
      flagKeys.forEach((key) => {
        results[key] = false;
      });
      return results;
    }

    // Initialize all flags to false
    flagKeys.forEach((key) => {
      results[key] = false;
    });

    // Update with actual values
    data?.forEach((flag) => {
      const isEnabled = flag.status === 'on';
      results[flag.key] = isEnabled;

      // Cache the result
      featureFlagsCache.set(flag.key, { value: isEnabled, timestamp: Date.now() });
    });

    return results;
  } catch (error) {
    console.error('Error getting feature flags:', error);
    flagKeys.forEach((key) => {
      results[key] = false;
    });
    return results;
  }
}

export function clearFeatureFlagsCache(): void {
  featureFlagsCache.clear();
}
