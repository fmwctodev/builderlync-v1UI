import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getCatalogByOrg, seedDefaultCatalog } from '../services/orgPricingCatalogApi';
import type { PricingCatalogItem } from '../types/proposalIntegration';

interface UsePricingCatalogResult {
  catalog: PricingCatalogItem[];
  isLoading: boolean;
  error: string | null;
  lookupPrice: (sku: string) => number;
  lookupItem: (sku: string) => PricingCatalogItem | null;
  refresh: () => Promise<void>;
  ensureCatalogExists: () => Promise<void>;
}

export function usePricingCatalog(): UsePricingCatalogResult {
  const { currentOrganizationId } = useCurrentOrganization();

  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalogMap = useMemo(() => {
    return new Map(catalog.map(item => [item.sku, item]));
  }, [catalog]);

  const fetchCatalog = useCallback(async () => {
    if (!currentOrganizationId) {
      setCatalog([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCatalogByOrg(currentOrganizationId);
      if (result.success) {
        setCatalog(result.data);
      } else {
        setError(result.message || 'Failed to fetch pricing catalog');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pricing catalog';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const lookupPrice = useCallback((sku: string): number => {
    const item = catalogMap.get(sku);
    return item?.default_unit_price ?? 0;
  }, [catalogMap]);

  const lookupItem = useCallback((sku: string): PricingCatalogItem | null => {
    return catalogMap.get(sku) ?? null;
  }, [catalogMap]);

  const refresh = useCallback(async () => {
    await fetchCatalog();
  }, [fetchCatalog]);

  const ensureCatalogExists = useCallback(async () => {
    if (!currentOrganizationId) return;

    if (catalog.length === 0) {
      try {
        await seedDefaultCatalog(currentOrganizationId);
        await fetchCatalog();
      } catch (err) {
        console.error('Failed to seed default catalog:', err);
      }
    }
  }, [currentOrganizationId, catalog.length, fetchCatalog]);

  return {
    catalog,
    isLoading,
    error,
    lookupPrice,
    lookupItem,
    refresh,
    ensureCatalogExists,
  };
}
