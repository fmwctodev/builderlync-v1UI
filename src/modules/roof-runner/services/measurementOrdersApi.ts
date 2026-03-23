import { supabase } from '../../../shared/lib/supabase';
import { normalizeOrder, normalizeOrders } from '../utils/orderNormalizer';
import type {
  MeasurementOrder,
  MeasurementOrderDbRow,
  OrderFilters,
  OrderStatus,
  ProductId,
} from '../types/measurementOrder';

export interface FetchOrdersResult {
  orders: MeasurementOrder[];
  error: string | null;
}

export interface FetchOrderResult {
  order: MeasurementOrder | null;
  error: string | null;
}

const DB_STATUS_MAP: Record<OrderStatus, string[]> = {
  pending: ['pending', 'created'],
  processing: ['processing', 'in-process'],
  completed: ['completed'],
  delivered: ['delivered'],
  cancelled: ['cancelled'],
  failed: ['failed'],
};

const PRODUCT_TO_DB_PRODUCT: Record<ProductId, string> = {
  property_roof_area_estimate: 'property_roof_area_estimate',
  measure_bidperfect: 'measure_bidperfect',
  measure_full_house: 'measure_full_house',
  measure_premium: 'measure_premium',
  solar_solar_report: 'solar_solar_report',
};

export async function fetchOrders(
  organizationId: string,
  filters?: OrderFilters
): Promise<FetchOrdersResult> {
  try {
    let query = supabase
      .from('measurement_orders')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      const dbStatuses = DB_STATUS_MAP[filters.status] || [filters.status];
      query = query.in('order_status', dbStatuses);
    }

    if (filters?.search) {
      query = query.ilike('property_address', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], error: error.message };
    }

    let orders = normalizeOrders(data as MeasurementOrderDbRow[]);

    if (filters?.product && filters.product !== 'all') {
      orders = orders.filter((order) => order.productId === filters.product);
    }

    return { orders, error: null };
  } catch (err) {
    console.error('Unexpected error fetching orders:', err);
    return {
      orders: [],
      error: err instanceof Error ? err.message : 'Failed to fetch orders',
    };
  }
}

export async function fetchOrderById(orderId: string): Promise<FetchOrderResult> {
  try {
    const { data, error } = await supabase
      .from('measurement_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order:', error);
      return { order: null, error: error.message };
    }

    if (!data) {
      return { order: null, error: 'Order not found' };
    }

    const order = normalizeOrder(data as MeasurementOrderDbRow);
    return { order, error: null };
  } catch (err) {
    console.error('Unexpected error fetching order:', err);
    return {
      order: null,
      error: err instanceof Error ? err.message : 'Failed to fetch order',
    };
  }
}

export async function fetchOrdersByStatus(
  organizationId: string,
  status: OrderStatus
): Promise<FetchOrdersResult> {
  return fetchOrders(organizationId, { status });
}

export async function fetchOrdersByProduct(
  organizationId: string,
  product: ProductId
): Promise<FetchOrdersResult> {
  return fetchOrders(organizationId, { product });
}

export async function searchOrders(
  organizationId: string,
  searchText: string
): Promise<FetchOrdersResult> {
  return fetchOrders(organizationId, { search: searchText });
}
