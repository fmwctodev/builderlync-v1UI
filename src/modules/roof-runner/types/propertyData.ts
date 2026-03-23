export type SubscriptionTier = 'Starter' | 'Pro' | 'Enterprise';

export type PropertyDataTier = 'basic' | 'pro';

export type PitchValue = number | null;

export type PropertyDataStatus = 'idle' | 'loading' | 'success' | 'error';

export type ImageryStatus = 'idle' | 'loading' | 'success' | 'error';

export type ResponseFormatType = 'json' | 'xml' | 'unknown';

export interface PropertyDataError {
  message: string;
  code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'UNKNOWN';
}

export interface ImageryError {
  message: string;
  code?: 'NETWORK_ERROR' | 'NOT_AVAILABLE' | 'UNAUTHORIZED' | 'UNKNOWN';
}

export interface PropertyData {
  roofAreaSqFt: number | null;
  pitch: number | null;
  pitchDescription: string | null;
  confidence: number | null;
  images: string[];
  source: string;
  fetchedAt: string;
  raw?: Record<string, unknown>;
}

export interface NormalizedPropertyData {
  roofAreaSqFt: number | null;
  pitch: number | null;
  pitchDescription: string | null;
  confidence: number | null;
  images: string[];
  source: string;
  fetchedAt: string;
  responseFormat?: ResponseFormatType;
  raw?: Record<string, unknown>;
}

export interface FetchAndNormalizeParams {
  propertyId: string;
  addressText: string;
  includeImagery?: boolean;
  accountMode: 'credits' | 'eagleview' | 'internal';
  authToken?: string;
  organizationId?: string;
  forceRefresh?: boolean;
}

export type FetchAndNormalizeResult =
  | { success: true; data: NormalizedPropertyData }
  | { success: false; error: PropertyDataError };

export interface FetchPropertyDataParams {
  propertyId: string;
  addressText: string;
  tier: PropertyDataTier;
  accountMode: 'credits' | 'eagleview' | 'internal';
  eagleviewAuthToken?: string;
  organizationId?: string;
  includeImagery?: boolean;
}

export interface FetchImageryParams {
  propertyId: string;
  addressText: string;
  organizationId?: string;
}

export interface PropertyDataState {
  selectedPropertyId: string | null;
  selectedAddressText: string | null;
  propertyData: PropertyData | null;
  propertyDataStatus: PropertyDataStatus;
  propertyDataError: PropertyDataError | null;
}

export function getPropertyDataTierFromSubscription(subscriptionTier: SubscriptionTier | string | undefined | null): PropertyDataTier {
  if (!subscriptionTier) {
    return 'basic';
  }
  const tier = subscriptionTier.toLowerCase();
  if (tier === 'pro' || tier === 'enterprise') {
    return 'pro';
  }
  return 'basic';
}

export function isProOrEnterprise(subscriptionTier: SubscriptionTier | string | undefined | null): boolean {
  if (!subscriptionTier) {
    return false;
  }
  const tier = subscriptionTier.toLowerCase();
  return tier === 'pro' || tier === 'enterprise';
}

export function formatRoofArea(sqFt: number | null): string {
  if (sqFt === null || sqFt === undefined) {
    return 'Not available';
  }
  return `${sqFt.toLocaleString()} sq ft`;
}

export function formatPitch(pitch: number | null, description?: string | null): string {
  if (pitch === null || pitch === undefined) {
    return description || 'Not available';
  }
  return `${pitch}/12${description ? ` (${description})` : ''}`;
}
