import { useState, useEffect, useCallback } from 'react';
import { fetchOrderById } from '../services/measurementOrdersApi';
import type { MeasurementOrder } from '../types/measurementOrder';

interface UseOrderDetailResult {
  order: MeasurementOrder | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOrderDetail(orderId: string | null): UseOrderDetailResult {
  const [order, setOrder] = useState<MeasurementOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await fetchOrderById(orderId);

    if (result.error) {
      setError(result.error);
      setOrder(null);
    } else {
      setOrder(result.order);
    }

    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const refresh = useCallback(async () => {
    await loadOrder();
  }, [loadOrder]);

  return {
    order,
    isLoading,
    error,
    refresh,
  };
}
