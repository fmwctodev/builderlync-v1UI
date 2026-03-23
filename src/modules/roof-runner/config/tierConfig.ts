import type { ProductId, AddOnId } from '../types/measurementOrder';
import type { TierType } from '../components/measurements/TierBadge';

const PRODUCT_TIER_MAP: Record<ProductId, TierType> = {
  property_roof_area_estimate: 'basic',
  measure_bidperfect: 'pro',
  measure_full_house: 'pro',
  measure_premium: 'upgrade-only',
  solar_solar_report: 'pro',
};

const ADDON_TIER_MAP: Record<AddOnId, TierType> = {
  addon_orthogonal_imagery: 'pro-addon',
};

export function getProductTier(productId: ProductId): TierType {
  return PRODUCT_TIER_MAP[productId] || 'basic';
}

export function getAddOnTier(addOnId: AddOnId): TierType {
  return ADDON_TIER_MAP[addOnId] || 'pro-addon';
}

export function getSubscriptionTier(subscriptionTierName: string | null): 'basic' | 'pro' {
  if (!subscriptionTierName) return 'basic';
  const normalized = subscriptionTierName.toLowerCase();
  if (normalized === 'pro' || normalized === 'enterprise') {
    return 'pro';
  }
  return 'basic';
}

export const TIER_HELPER_TEXT = {
  PROPERTY_DATA_BASIC: 'Fast roof area estimate for quick budgeting.',
  PROPERTY_DATA_PRO: 'Adds roof imagery for better job context.',
  ORTHOGONAL_IMAGERY: 'Recommended for better roof context.',
  PREMIUM_LOCKED: 'Available only after BidPerfect is delivered.',
  IMAGERY_UNAVAILABLE: 'Imagery not available for this property.',
} as const;
