import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PropertyData,
  PropertyDataStatus,
  PropertyDataError,
  PropertyDataTier,
} from '../types/propertyData';
import {
  fetchPropertyData,
  parsePropertyDataError,
  clearPropertyDataCache,
} from '../services/propertyDataService';

interface UsePropertyDataParams {
  propertyId: string | null;
  addressText: string | null;
  tier: PropertyDataTier;
  accountMode: 'credits' | 'eagleview' | null;
  eagleviewAuthToken?: string;
  enabled?: boolean;
}

interface UsePropertyDataResult {
  data: PropertyData | null;
  status: PropertyDataStatus;
  error: PropertyDataError | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isImageryAvailable: boolean;
}

export function usePropertyData({
  propertyId,
  addressText,
  tier,
  accountMode,
  eagleviewAuthToken,
  enabled = true,
}: UsePropertyDataParams): UsePropertyDataResult {
  const [data, setData] = useState<PropertyData | null>(null);
  const [status, setStatus] = useState<PropertyDataStatus>('idle');
  const [error, setError] = useState<PropertyDataError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchedPropertyIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId || !addressText || !accountMode) {
      setStatus('idle');
      setData(null);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setStatus('loading');
    setError(null);

    try {
      const result = await fetchPropertyData({
        propertyId,
        addressText,
        tier,
        accountMode,
        eagleviewAuthToken,
      });

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      lastFetchedPropertyIdRef.current = propertyId;
      setData(result);
      setStatus('success');
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const parsedError = parsePropertyDataError(err);
      setError(parsedError);
      setStatus('error');
      setData(null);
    }
  }, [propertyId, addressText, tier, accountMode, eagleviewAuthToken]);

  const refetch = useCallback(async () => {
    if (propertyId) {
      clearPropertyDataCache(propertyId);
    }
    await fetchData();
  }, [propertyId, fetchData]);

  const clearCache = useCallback(() => {
    if (propertyId) {
      clearPropertyDataCache(propertyId);
    }
  }, [propertyId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (propertyId && propertyId !== lastFetchedPropertyIdRef.current) {
      fetchData();
    } else if (!propertyId && lastFetchedPropertyIdRef.current) {
      setStatus('idle');
      setData(null);
      setError(null);
      lastFetchedPropertyIdRef.current = null;
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [propertyId, enabled, fetchData]);

  const isImageryAvailable = data !== null && data.images.length > 0;

  return {
    data,
    status,
    error,
    refetch,
    clearCache,
    isImageryAvailable,
  };
}
