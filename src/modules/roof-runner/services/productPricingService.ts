import type { ProductId, AddOnId, AccountMode } from '../types/measurementOrder';
import { getProductById, getAddOnById } from '../data/productCatalog';

export interface PricingDisplay {
  text: string;
  value: number | null;
  isLoading?: boolean;
}

const eagleViewPricingCache: Map<string, number> = new Map();

export function getCreditPricing(productId: ProductId): number | null {
  const product = getProductById(productId);
  if (!product) return null;
  return product.pricing.creditCost;
}

export function getAddOnCreditPricing(addOnId: AddOnId): number | null {
  const addOn = getAddOnById(addOnId);
  if (!addOn) return null;
  return addOn.pricing.creditCost;
}

export function getEagleViewBasePricing(productId: ProductId): number | null {
  const product = getProductById(productId);
  if (!product) return null;
  return product.pricing.eagleViewBasePrice;
}

export function getAddOnEagleViewPricing(addOnId: AddOnId): number | null {
  const addOn = getAddOnById(addOnId);
  if (!addOn) return null;
  return addOn.pricing.eagleViewBasePrice;
}

export async function fetchEagleViewPricing(
  productId: ProductId,
  _eagleViewAuthToken: string
): Promise<number | null> {
  const cacheKey = `${productId}`;
  if (eagleViewPricingCache.has(cacheKey)) {
    return eagleViewPricingCache.get(cacheKey) || null;
  }

  const basePricing = getEagleViewBasePricing(productId);
  if (basePricing !== null) {
    eagleViewPricingCache.set(cacheKey, basePricing);
  }

  return basePricing;
}

export function clearEagleViewPricingCache(): void {
  eagleViewPricingCache.clear();
}

export function formatPriceDisplay(
  accountMode: AccountMode,
  creditCost: number | null,
  eagleViewPrice: number | null
): PricingDisplay {
  if (accountMode === 'credits') {
    if (creditCost === null) {
      return { text: 'Price TBD', value: null };
    }
    const creditText = creditCost === 1 ? 'Credit' : 'Credits';
    return { text: `${creditCost} ${creditText}`, value: creditCost };
  }

  if (eagleViewPrice === null) {
    return { text: 'Price TBD', value: null };
  }

  return {
    text: `$${eagleViewPrice.toFixed(2)}`,
    value: eagleViewPrice,
  };
}

export function getProductPricingDisplay(
  productId: ProductId,
  accountMode: AccountMode
): PricingDisplay {
  const product = getProductById(productId);
  if (!product) {
    return { text: 'N/A', value: null };
  }

  return formatPriceDisplay(
    accountMode,
    product.pricing.creditCost,
    product.pricing.eagleViewBasePrice
  );
}

export function getAddOnPricingDisplay(
  addOnId: AddOnId,
  accountMode: AccountMode
): PricingDisplay {
  const addOn = getAddOnById(addOnId);
  if (!addOn) {
    return { text: 'N/A', value: null };
  }

  return formatPriceDisplay(
    accountMode,
    addOn.pricing.creditCost,
    addOn.pricing.eagleViewBasePrice
  );
}

export function calculateTotalCreditCost(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[]
): number {
  let total = 0;

  for (const productId of selectedProducts) {
    const cost = getCreditPricing(productId);
    if (cost !== null) {
      total += cost;
    }
  }

  for (const addOnId of selectedAddOns) {
    const cost = getAddOnCreditPricing(addOnId);
    if (cost !== null) {
      total += cost;
    }
  }

  return total;
}

export function calculateTotalEagleViewPrice(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[]
): number {
  let total = 0;

  for (const productId of selectedProducts) {
    const price = getEagleViewBasePricing(productId);
    if (price !== null) {
      total += price;
    }
  }

  for (const addOnId of selectedAddOns) {
    const price = getAddOnEagleViewPricing(addOnId);
    if (price !== null) {
      total += price;
    }
  }

  return total;
}

export function getTotalPricingDisplay(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[],
  accountMode: AccountMode
): PricingDisplay {
  if (accountMode === 'credits') {
    const total = calculateTotalCreditCost(selectedProducts, selectedAddOns);
    const creditText = total === 1 ? 'Credit' : 'Credits';
    return { text: `${total} ${creditText}`, value: total };
  }

  const total = calculateTotalEagleViewPrice(selectedProducts, selectedAddOns);
  return { text: `$${total.toFixed(2)}`, value: total };
}
