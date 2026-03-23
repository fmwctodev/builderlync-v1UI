import type { ProductId, AddOnId, ProductSelectionValidation } from '../types/measurementOrder';
import { getProductById, getAddOnById, productCatalog } from '../data/productCatalog';

export interface SelectabilityResult {
  canSelect: boolean;
  reason: string | null;
}

export function isProductSelectable(
  productId: ProductId,
  currentSelection: ProductId[]
): SelectabilityResult {
  const product = getProductById(productId);

  if (!product) {
    return { canSelect: false, reason: 'Product not found.' };
  }

  if (!product.isSelectable) {
    return { canSelect: false, reason: 'Upgrade only' };
  }

  if (product.isUpgradeOnly) {
    return { canSelect: false, reason: 'Upgrade only' };
  }

  if (currentSelection.includes(productId)) {
    return { canSelect: true, reason: null };
  }

  for (const selectedId of currentSelection) {
    const selectedProduct = getProductById(selectedId);
    if (selectedProduct) {
      if (product.includedIn.includes(selectedId)) {
        return {
          canSelect: false,
          reason: `Included in ${selectedProduct.name}.`
        };
      }

      if (product.conflictsWith.includes(selectedId)) {
        return {
          canSelect: false,
          reason: `Conflicts with ${selectedProduct.name}.`
        };
      }
    }
  }

  return { canSelect: true, reason: null };
}

export function getConflictingProducts(
  productId: ProductId,
  currentSelection: ProductId[]
): ProductId[] {
  const product = getProductById(productId);
  if (!product) return [];

  const conflicts: ProductId[] = [];

  for (const selectedId of currentSelection) {
    if (product.conflictsWith.includes(selectedId)) {
      conflicts.push(selectedId);
    }
  }

  return conflicts;
}

export function getAutoDeselectProducts(
  productId: ProductId,
  currentSelection: ProductId[]
): ProductId[] {
  const product = getProductById(productId);
  if (!product) return [];

  const toDeselect: ProductId[] = [];

  for (const selectedId of currentSelection) {
    const selectedProduct = getProductById(selectedId);
    if (!selectedProduct) continue;

    if (selectedProduct.includedIn.includes(productId)) {
      toDeselect.push(selectedId);
    }

    if (selectedProduct.conflictsWith.includes(productId)) {
      toDeselect.push(selectedId);
    }
  }

  return toDeselect;
}

export function getAutoDeselectAddOns(
  productId: ProductId,
  currentAddOns: AddOnId[]
): AddOnId[] {
  const toDeselect: AddOnId[] = [];

  for (const addOnId of currentAddOns) {
    const addOn = getAddOnById(addOnId);
    if (addOn && addOn.requiresProduct === productId) {
      toDeselect.push(addOnId);
    }
  }

  return toDeselect;
}

export function isAddOnSelectable(
  addOnId: AddOnId,
  currentProducts: ProductId[]
): SelectabilityResult {
  const addOn = getAddOnById(addOnId);

  if (!addOn) {
    return { canSelect: false, reason: 'Add-on not found.' };
  }

  if (!currentProducts.includes(addOn.requiresProduct)) {
    const requiredProduct = getProductById(addOn.requiresProduct);
    return {
      canSelect: false,
      reason: `Requires ${requiredProduct?.name || 'associated product'}.`
    };
  }

  return { canSelect: true, reason: null };
}

export function validateSelection(
  selectedProducts: ProductId[],
  selectedAddOns: AddOnId[]
): ProductSelectionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const addOnId of selectedAddOns) {
    const addOn = getAddOnById(addOnId);
    if (addOn && !selectedProducts.includes(addOn.requiresProduct)) {
      const requiredProduct = getProductById(addOn.requiresProduct);
      errors.push(
        `${addOn.name} requires ${requiredProduct?.name || 'associated product'} to be selected.`
      );
    }
  }

  for (let i = 0; i < selectedProducts.length; i++) {
    const productA = getProductById(selectedProducts[i]);
    if (!productA) continue;

    for (let j = i + 1; j < selectedProducts.length; j++) {
      const productB = getProductById(selectedProducts[j]);
      if (!productB) continue;

      if (productA.conflictsWith.includes(selectedProducts[j])) {
        errors.push(
          `${productA.name} and ${productB.name} cannot be selected together.`
        );
      }
    }
  }

  for (const productId of selectedProducts) {
    const product = getProductById(productId);
    if (product && !product.isSelectable) {
      errors.push(`${product.name} is not available for selection.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getDisabledReasonText(
  productId: ProductId,
  currentSelection: ProductId[]
): string | null {
  const result = isProductSelectable(productId, currentSelection);
  return result.reason;
}

export function canContinue(selectedProducts: ProductId[]): boolean {
  if (selectedProducts.length === 0) {
    return false;
  }

  for (const productId of selectedProducts) {
    const product = getProductById(productId);
    if (product && product.isSelectable) {
      return true;
    }
  }

  return false;
}

export function getIncludedProducts(productId: ProductId): ProductId[] {
  const includesProducts: ProductId[] = [];

  for (const product of productCatalog) {
    if (product.includedIn.includes(productId)) {
      includesProducts.push(product.id);
    }
  }

  return includesProducts;
}

export function formatAutoDeselectMessage(
  productId: ProductId,
  containingProductId: ProductId
): string {
  const product = getProductById(productId);
  const containingProduct = getProductById(containingProductId);

  if (product && containingProduct) {
    return `Removed ${product.name} because it's included in ${containingProduct.name}.`;
  }

  return 'Product removed due to selection conflict.';
}

export function formatAddOnAutoDeselectMessage(
  addOnId: AddOnId,
  productId: ProductId
): string {
  const addOn = getAddOnById(addOnId);
  const product = getProductById(productId);

  if (addOn && product) {
    return `Removed ${addOn.name} because ${product.name} was deselected.`;
  }

  return 'Add-on removed because required product was deselected.';
}
