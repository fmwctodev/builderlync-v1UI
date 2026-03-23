import type {
  MeasurementOrder,
  ProductId,
  OrderStatus,
  UpgradeEligibleProductId,
} from '../types/measurementOrder';
import {
  UPGRADE_ELIGIBLE_PRODUCTS,
  UPGRADE_ELIGIBLE_STATUSES,
  UPGRADE_TARGET_PRODUCT,
} from '../types/measurementOrder';

export function isUpgradeEligibleProduct(productId: ProductId): productId is UpgradeEligibleProductId {
  return (UPGRADE_ELIGIBLE_PRODUCTS as readonly ProductId[]).includes(productId);
}

export function isUpgradeEligibleStatus(status: OrderStatus): boolean {
  return (UPGRADE_ELIGIBLE_STATUSES as readonly OrderStatus[]).includes(status);
}

export function isOrderUpgradeEligible(order: MeasurementOrder): boolean {
  return isUpgradeEligibleProduct(order.productId) && isUpgradeEligibleStatus(order.status);
}

export function getUpgradeTargetProduct(): typeof UPGRADE_TARGET_PRODUCT {
  return UPGRADE_TARGET_PRODUCT;
}

export function getUpgradeEligibilityReason(order: MeasurementOrder): string | null {
  if (isOrderUpgradeEligible(order)) {
    return null;
  }

  if (!isUpgradeEligibleProduct(order.productId)) {
    if (order.productId === 'measure_premium') {
      return 'This order is already Premium';
    }
    if (order.productId === 'measure_full_house') {
      return 'Full House orders cannot be upgraded';
    }
    if (order.productId === 'solar_solar_report') {
      return 'Solar reports cannot be upgraded';
    }
    if (order.productId === 'property_roof_area_estimate') {
      return 'Property data packs cannot be upgraded';
    }
    return 'This product type is not eligible for upgrade';
  }

  if (!isUpgradeEligibleStatus(order.status)) {
    if (order.status === 'cancelled' || order.status === 'failed') {
      return 'Cannot upgrade cancelled or failed orders';
    }
    if (order.status === 'pending' || order.status === 'processing') {
      return 'Order must be completed before upgrading';
    }
    return 'Order status is not eligible for upgrade';
  }

  return 'Order is not eligible for upgrade';
}
