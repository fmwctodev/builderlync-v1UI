import {
  getProductCreditCost,
  getAddOnCreditCost,
  getProductCreditCostForTier,
  getAddOnCreditCostForTier,
} from '../config/creditMappingConfig';
import { getProductById, getAddOnById } from '../data/productCatalog';
import type {
  ProductId,
  AddOnId,
  CreditBreakdownItem,
  CreditBreakdownResult,
  CreditEligibility,
} from '../types/measurementOrder';
import type { SubscriptionTier } from '../types/propertyData';

export function getItemDisplayName(itemId: string, type: 'product' | 'addon'): string {
  if (type === 'product') {
    const product = getProductById(itemId as ProductId);
    return product?.name ?? itemId;
  }
  const addOn = getAddOnById(itemId as AddOnId);
  return addOn?.name ?? itemId;
}

export function resolveCreditsForSelection(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[],
  subscriptionTier?: SubscriptionTier | string | null
): CreditBreakdownResult {
  const items: CreditBreakdownItem[] = [];
  const missingMappings: string[] = [];
  let totalCredits = 0;

  for (const productId of selectedProducts) {
    const credits = subscriptionTier
      ? getProductCreditCostForTier(productId, subscriptionTier)
      : getProductCreditCost(productId);
    const name = getItemDisplayName(productId, 'product');

    items.push({
      id: productId,
      name,
      type: 'product',
      credits,
    });

    if (credits === null) {
      missingMappings.push(name);
    } else {
      totalCredits += credits;
    }
  }

  for (const addOnId of selectedAddOns) {
    const credits = subscriptionTier
      ? getAddOnCreditCostForTier(addOnId, subscriptionTier)
      : getAddOnCreditCost(addOnId);
    const name = getItemDisplayName(addOnId, 'addon');

    items.push({
      id: addOnId,
      name,
      type: 'addon',
      credits,
    });

    if (credits === null) {
      missingMappings.push(name);
    } else {
      totalCredits += credits;
    }
  }

  return {
    items,
    totalCredits: Math.max(0, Math.floor(totalCredits)),
    missingMappings,
  };
}

export function checkCreditEligibility(
  balance: number | null,
  totalCredits: number,
  missingMappings: string[],
  hasLoadError: boolean
): CreditEligibility {
  const availableBalance = balance ?? 0;
  const shortage = Math.max(0, totalCredits - availableBalance);

  return {
    sufficient: availableBalance >= totalCredits && missingMappings.length === 0 && !hasLoadError,
    shortage,
    hasLoadError,
    hasMissingMappings: missingMappings.length > 0,
  };
}

export function getEmptyCreditBreakdown(): CreditBreakdownResult {
  return {
    items: [],
    totalCredits: 0,
    missingMappings: [],
  };
}

export function getDefaultCreditEligibility(): CreditEligibility {
  return {
    sufficient: true,
    shortage: 0,
    hasLoadError: false,
    hasMissingMappings: false,
  };
}
