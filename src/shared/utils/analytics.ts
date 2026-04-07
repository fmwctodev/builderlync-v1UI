import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const analytics = {
  init: () => {
    if (!POSTHOG_KEY) {
      console.warn('PostHog API key is missing. Analytics will not be initialized.');
      return;
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      // Capture pageview by default
      capture_pageview: true,
      // Useful for SPA navigation tracking
      autocapture: true,
    });
    
    console.log('[Analytics] PostHog initialized.');
  },

  identify: (userId: string | number, properties: Record<string, any> = {}) => {
    if (!POSTHOG_KEY) return;
    posthog.identify(String(userId), properties);
    console.log('[Analytics] User identified with PostHog:');
    console.log('  - User ID:   ', userId);
    console.log('  - Email:     ', properties.email ?? '(not provided)');
    console.log('  - Name:      ', properties.name ?? '(not provided)');
    console.log('  - All props: ', properties);
    console.log('  - Distinct ID after identify:', posthog.get_distinct_id());
  },

  capture: (eventName: string, properties: Record<string, any> = {}) => {
    if (!POSTHOG_KEY) return;
    posthog.capture(eventName, properties);
  },

  reset: () => {
    if (!POSTHOG_KEY) return;
    posthog.reset();
    console.log('[Analytics] User reset.');
  },

  isFeatureEnabled: (key: string) => {
    if (!POSTHOG_KEY) return false;
    return posthog.isFeatureEnabled(key);
  },

  onFeatureFlags: (callback: (flags: string[], variants: Record<string, any>) => void) => {
    if (!POSTHOG_KEY) return;
    posthog.onFeatureFlags(callback);
  }
};
