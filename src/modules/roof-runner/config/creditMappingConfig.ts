import type { ProductId, AddOnId } from '../types/measurementOrder';
import type { SubscriptionTier } from '../types/propertyData';

export interface CreditMappingEntry {
  creditCost: number;
}

export interface TieredCreditMappingEntry {
  starter: number;
  pro: number;
  enterprise: number;
}

export type CreditMappingConfig = {
  products: Partial<Record<ProductId, CreditMappingEntry>>;
  addOns: Partial<Record<AddOnId, CreditMappingEntry>>;
};

export type TieredCreditMappingConfig = {
  products: Partial<Record<ProductId, TieredCreditMappingEntry>>;
  addOns: Partial<Record<AddOnId, TieredCreditMappingEntry>>;
};

export const tieredCreditMappingConfig: TieredCreditMappingConfig = {
  products: {
    property_roof_area_estimate: { starter: 1, pro: 1, enterprise: 1 },
    measure_bidperfect: { starter: 3, pro: 2, enterprise: 2 },
    measure_full_house: { starter: 5, pro: 3, enterprise: 3 },
    measure_premium: { starter: 5, pro: 3, enterprise: 3 },
    solar_solar_report: { starter: 3, pro: 2, enterprise: 2 },
  },
  addOns: {
    addon_orthogonal_imagery: { starter: 2, pro: 1, enterprise: 1 },
  },
};

export const creditMappingConfig: CreditMappingConfig = {
  products: {
    property_roof_area_estimate: { creditCost: 1 },
    measure_bidperfect: { creditCost: 2 },
    measure_full_house: { creditCost: 3 },
    measure_premium: { creditCost: 3 },
    solar_solar_report: { creditCost: 2 },
  },
  addOns: {
    addon_orthogonal_imagery: { creditCost: 1 },
  },
};

function normalizeTier(tier: SubscriptionTier | string | undefined | null): 'starter' | 'pro' | 'enterprise' {
  if (!tier) return 'starter';
  const normalized = tier.toLowerCase();
  if (normalized === 'pro') return 'pro';
  if (normalized === 'enterprise') return 'enterprise';
  return 'starter';
}

export function getProductCreditCostForTier(
  productId: ProductId,
  subscriptionTier: SubscriptionTier | string | undefined | null
): number | null {
  const entry = tieredCreditMappingConfig.products[productId];
  if (!entry) return null;
  const tier = normalizeTier(subscriptionTier);
  return entry[tier];
}

export function getAddOnCreditCostForTier(
  addOnId: AddOnId,
  subscriptionTier: SubscriptionTier | string | undefined | null
): number | null {
  const entry = tieredCreditMappingConfig.addOns[addOnId];
  if (!entry) return null;
  const tier = normalizeTier(subscriptionTier);
  return entry[tier];
}

export function getProductCreditCost(productId: ProductId): number | null {
  const entry = creditMappingConfig.products[productId];
  return entry?.creditCost ?? null;
}

export function getAddOnCreditCost(addOnId: AddOnId): number | null {
  const entry = creditMappingConfig.addOns[addOnId];
  return entry?.creditCost ?? null;
}

export function getTierDisplayName(subscriptionTier: SubscriptionTier | string | undefined | null): string {
  if (!subscriptionTier) return 'Starter';
  const tier = subscriptionTier.toLowerCase();
  if (tier === 'pro') return 'Pro';
  if (tier === 'enterprise') return 'Enterprise';
  return 'Starter';
}

export function getTierDiscount(subscriptionTier: SubscriptionTier | string | undefined | null): number {
  const tier = normalizeTier(subscriptionTier);
  if (tier === 'pro' || tier === 'enterprise') {
    return 0.33;
  }
  return 0;
}
