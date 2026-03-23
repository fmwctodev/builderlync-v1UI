import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, type FetchOrdersResult } from '../services/measurementOrdersApi';
import type { MeasurementOrder, OrderFilters, OrderStatus, ProductId } from '../types/measurementOrder';

interface UseOrderHistoryResult {
  orders: MeasurementOrder[];
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setProductFilter: (product: ProductId | 'all') => void;
  setSearchFilter: (search: string) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: OrderFilters = {
  status: 'all',
  product: 'all',
  search: '',
};

export function useOrderHistory(organizationId: string | null): UseOrderHistoryResult {
  const [orders, setOrders] = useState<MeasurementOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);

  const loadOrders = useCallback(async () => {
    if (!organizationId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await fetchOrders(organizationId, filters);

    if (result.error) {
      setError(result.error);
      setOrders([]);
    } else {
      setOrders(result.orders);
    }

    setIsLoading(false);
  }, [organizationId, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const setStatusFilter = useCallback((status: OrderStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setProductFilter = useCallback((product: ProductId | 'all') => {
    setFilters((prev) => ({ ...prev, product }));
  }, []);

  const setSearchFilter = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    error,
    filters,
    setStatusFilter,
    setProductFilter,
    setSearchFilter,
    clearFilters,
    refresh,
  };
}
