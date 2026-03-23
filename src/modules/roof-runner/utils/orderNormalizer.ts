import type {
  MeasurementOrder,
  MeasurementOrderDbRow,
  OrderStatus,
  OrderedVia,
  OrderOutputs,
  OrderMetadata,
  ProductId,
  OrderListItem,
  UPGRADE_ELIGIBLE_PRODUCTS,
  UPGRADE_ELIGIBLE_STATUSES,
  PRODUCT_DISPLAY_NAMES,
} from '../types/measurementOrder';

function normalizeOrderStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    delivered: 'delivered',
    cancelled: 'cancelled',
    failed: 'failed',
    'in-process': 'processing',
    created: 'pending',
  };
  return statusMap[dbStatus.toLowerCase()] ?? 'pending';
}

function normalizeOrderedVia(dbRow: MeasurementOrderDbRow): OrderedVia {
  if (dbRow.ordered_via === 'credits' || dbRow.ordered_via === 'eagleview') {
    return dbRow.ordered_via;
  }
  if (dbRow.order_type === 'eagleview' || dbRow.order_type === 'hover') {
    return 'eagleview';
  }
  return 'credits';
}

function extractProductId(dbRow: MeasurementOrderDbRow): ProductId {
  const products = dbRow.products_ordered as { id?: string; productId?: string }[] | null;
  if (products && products.length > 0) {
    const first = products[0];
    const productId = first.productId || first.id;
    if (isValidProductId(productId)) {
      return productId;
    }
  }
  return 'measure_bidperfect';
}

function isValidProductId(id: unknown): id is ProductId {
  const validIds: ProductId[] = [
    'property_roof_area_estimate',
    'measure_bidperfect',
    'measure_full_house',
    'measure_premium',
    'solar_solar_report',
  ];
  return typeof id === 'string' && validIds.includes(id as ProductId);
}

function getProductDisplayName(productId: ProductId): string {
  const names: Record<ProductId, string> = {
    property_roof_area_estimate: 'Property Data',
    measure_bidperfect: 'BidPerfect',
    measure_full_house: 'Full House',
    measure_premium: 'Premium',
    solar_solar_report: 'Solar Report',
  };
  return names[productId] ?? productId;
}

function normalizeOutputs(dbRow: MeasurementOrderDbRow): OrderOutputs {
  const reportData = dbRow.report_data || dbRow.json_body || {};
  const rd = reportData as Record<string, unknown>;

  return {
    pdfUrl: dbRow.pdf_url || dbRow.eagleview_report_url || dbRow.hover_report_url || null,
    jsonUrl: dbRow.json_url || null,
    jsonBody: dbRow.json_body || dbRow.report_data || null,
    xmlUrl: dbRow.xml_url || null,
    xmlBody: dbRow.xml_body || null,
    totalArea: typeof rd.totalArea === 'number' ? rd.totalArea : undefined,
    roof_area: typeof rd.roof_area === 'number' ? rd.roof_area : undefined,
    perimeter: typeof rd.perimeter === 'number' ? rd.perimeter : undefined,
    primaryPitch: typeof rd.primaryPitch === 'string' ? rd.primaryPitch : undefined,
    primary_pitch: typeof rd.primary_pitch === 'string' ? rd.primary_pitch : undefined,
    facets: typeof rd.facets === 'number' ? rd.facets : undefined,
    facet_count: typeof rd.facet_count === 'number' ? rd.facet_count : undefined,
  };
}

function normalizeMetadata(dbRow: MeasurementOrderDbRow): OrderMetadata {
  return {
    isUpgradeOrder: dbRow.is_upgrade_order ?? false,
    upgradeFromOrderId: dbRow.upgrade_from_order_id || null,
  };
}

function generateOrderNumber(dbRow: MeasurementOrderDbRow): string {
  if (dbRow.eagleview_order_id) {
    return dbRow.eagleview_order_id;
  }
  if (dbRow.hover_order_id) {
    return dbRow.hover_order_id;
  }
  return dbRow.id.substring(0, 8).toUpperCase();
}

function formatDeliveryTime(dbRow: MeasurementOrderDbRow): string {
  if (dbRow.completed_at) {
    return new Date(dbRow.completed_at).toLocaleDateString();
  }
  const status = normalizeOrderStatus(dbRow.order_status);
  if (status === 'completed' || status === 'delivered') {
    return 'Delivered';
  }
  if (status === 'failed' || status === 'cancelled') {
    return '-';
  }
  return 'Processing';
}

export function normalizeOrder(dbRow: MeasurementOrderDbRow): MeasurementOrder {
  const productId = extractProductId(dbRow);
  const status = normalizeOrderStatus(dbRow.order_status);

  return {
    id: dbRow.id,
    orderNumber: generateOrderNumber(dbRow),
    productId,
    productName: getProductDisplayName(productId),
    address: dbRow.property_address,
    addressId: dbRow.id,
    propertyId: dbRow.id,
    datePlaced: dbRow.created_at,
    dateCompleted: dbRow.completed_at || null,
    delivery: formatDeliveryTime(dbRow),
    cost: dbRow.total_cost ?? 0,
    status,
    orderedVia: normalizeOrderedVia(dbRow),
    outputs: normalizeOutputs(dbRow),
    metadata: normalizeMetadata(dbRow),
    customerId: dbRow.created_by,
    jobId: dbRow.job_id ?? undefined,
    propertyType: dbRow.property_type ?? undefined,
  };
}

export function normalizeOrders(dbRows: MeasurementOrderDbRow[]): MeasurementOrder[] {
  return dbRows.map(normalizeOrder);
}

export function isUpgradeEligible(order: MeasurementOrder): boolean {
  const eligibleProducts: ProductId[] = ['measure_bidperfect'];
  const eligibleStatuses: OrderStatus[] = ['completed', 'delivered'];

  return (
    eligibleProducts.includes(order.productId) &&
    eligibleStatuses.includes(order.status)
  );
}

export function toOrderListItem(order: MeasurementOrder): OrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    productId: order.productId,
    productName: order.productName,
    address: order.address,
    datePlaced: order.datePlaced,
    status: order.status,
    orderedVia: order.orderedVia,
    hasPdfOutput: order.outputs.pdfUrl !== null,
    isUpgradeEligible: isUpgradeEligible(order),
  };
}

export function toOrderListItems(orders: MeasurementOrder[]): OrderListItem[] {
  return orders.map(toOrderListItem);
}
