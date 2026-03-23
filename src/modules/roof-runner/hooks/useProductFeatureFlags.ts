import { useState, useEffect } from 'react';
import { getFeatureFlags } from '../services/featureFlagsService';

export interface ProductFeatureFlags {
  solarProductsEnabled: boolean;
  isLoading: boolean;
}

export function useProductFeatureFlags(): ProductFeatureFlags {
  const [flags, setFlags] = useState<ProductFeatureFlags>({
    solarProductsEnabled: false,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchFlags() {
      try {
        const result = await getFeatureFlags(['solar_products_enabled']);

        if (isMounted) {
          setFlags({
            solarProductsEnabled: result.solar_products_enabled || false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching product feature flags:', error);
        if (isMounted) {
          setFlags({
            solarProductsEnabled: false,
            isLoading: false,
          });
        }
      }
    }

    fetchFlags();

    return () => {
      isMounted = false;
    };
  }, []);

  return flags;
}
