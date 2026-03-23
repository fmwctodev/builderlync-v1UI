export const FEATURE_FLAGS = {
  JSON_XML_DOWNLOADS: import.meta.env.VITE_FEATURE_JSON_XML_DOWNLOADS === 'true',
  SHOW_RAW_PROPERTY_DATA: import.meta.env.VITE_FEATURE_SHOW_RAW_PROPERTY_DATA === 'true',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

export function getEnvironment(): 'production' | 'staging' | 'development' {
  if (APP_ENV === 'production') return 'production';
  if (APP_ENV === 'staging') return 'staging';

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname.includes('staging') || hostname.includes('stage')) return 'staging';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';

  return 'development';
}

export function isNonProductionEnvironment(): boolean {
  return getEnvironment() !== 'production';
}

export function isStagingEnvironment(): boolean {
  return getEnvironment() === 'staging';
}

export function isDevelopmentEnvironment(): boolean {
  return getEnvironment() === 'development';
}
