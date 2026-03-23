import type {
  PropertyData,
  PropertyDataError,
  PropertyDataTier,
  FetchPropertyDataParams,
  FetchImageryParams,
  ImageryError,
  NormalizedPropertyData,
  FetchAndNormalizeParams,
  FetchAndNormalizeResult,
  ResponseFormatType,
} from '../types/propertyData';
import { supabase } from '../../../shared/lib/supabase';
import {
  normalizePropertyDataResponse,
  shouldIncludeRawData,
} from './propertyDataNormalizer';

const CACHE_KEY_PREFIX = 'property_data_';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedPropertyData {
  data: PropertyData;
  expiresAt: number;
  includesImagery?: boolean;
}

function getCacheKey(propertyId: string, includeImagery: boolean = false): string {
  return `${CACHE_KEY_PREFIX}${propertyId}_imagery_${includeImagery}`;
}

function getLegacyCacheKey(propertyId: string): string {
  return `${CACHE_KEY_PREFIX}${propertyId}`;
}

export function getCachedPropertyData(propertyId: string, includeImagery: boolean = false): PropertyData | null {
  try {
    const cacheKey = getCacheKey(propertyId, includeImagery);
    let cached = sessionStorage.getItem(cacheKey);

    if (!cached) {
      const legacyKey = getLegacyCacheKey(propertyId);
      cached = sessionStorage.getItem(legacyKey);
      if (cached) {
        const parsed: CachedPropertyData = JSON.parse(cached);
        if (includeImagery && (!parsed.includesImagery || !parsed.data.images?.length)) {
          return null;
        }
      }
    }

    if (!cached) return null;

    const parsed: CachedPropertyData = JSON.parse(cached);
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(getCacheKey(propertyId, includeImagery));
      return null;
    }

    if (includeImagery && (!parsed.includesImagery || !parsed.data.images?.length)) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function cachePropertyData(propertyId: string, data: PropertyData, includeImagery: boolean = false): void {
  try {
    const cached: CachedPropertyData = {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
      includesImagery: includeImagery || (data.images && data.images.length > 0),
    };
    sessionStorage.setItem(getCacheKey(propertyId, includeImagery), JSON.stringify(cached));

    if (includeImagery && data.images && data.images.length > 0) {
      sessionStorage.setItem(getCacheKey(propertyId, true), JSON.stringify(cached));
    }
  } catch {
    console.warn('Failed to cache property data');
  }
}

export function clearPropertyDataCache(propertyId?: string): void {
  if (propertyId) {
    sessionStorage.removeItem(getCacheKey(propertyId, false));
    sessionStorage.removeItem(getCacheKey(propertyId, true));
    sessionStorage.removeItem(getLegacyCacheKey(propertyId));
  } else {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  }
}

function generateMockImages(): string[] {
  return [
    'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];
}

export function createMockPropertyData(propertyId: string, _tier: PropertyDataTier): PropertyData {
  const roofAreas = [1850, 2200, 2750, 3100, 1650, 2450];
  const pitches = [4, 5, 6, 7, 8, 9, 10, 12];
  const pitchDescriptions = ['Low slope', 'Walkable', 'Standard', 'Steep', 'Very steep'];

  const randomIndex = Math.abs(propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

  return {
    roofAreaSqFt: roofAreas[randomIndex % roofAreas.length],
    pitch: pitches[randomIndex % pitches.length],
    pitchDescription: pitchDescriptions[randomIndex % pitchDescriptions.length],
    confidence: 0.85 + (Math.random() * 0.1),
    images: generateMockImages(),
    source: 'mock',
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromInternalProxy(params: FetchPropertyDataParams): Promise<PropertyData> {
  const { propertyId, addressText, organizationId } = params;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token || supabaseAnonKey;

  const response = await fetch(`${supabaseUrl}/functions/v1/property-data-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      propertyId,
      addressText,
      organizationId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data as PropertyData;
}

export async function fetchPropertyData(params: FetchPropertyDataParams): Promise<PropertyData> {
  const { propertyId, tier, accountMode, eagleviewAuthToken } = params;

  const cached = getCachedPropertyData(propertyId);
  if (cached) {
    return cached;
  }

  if (accountMode === 'internal') {
    const data = await fetchFromInternalProxy(params);
    cachePropertyData(propertyId, data);
    return data;
  }

  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  if (accountMode === 'eagleview' && !eagleviewAuthToken) {
    const error: PropertyDataError = {
      message: 'EagleView authentication required',
      code: 'UNAUTHORIZED',
    };
    throw error;
  }

  const mockData = createMockPropertyData(propertyId, tier);
  cachePropertyData(propertyId, mockData);

  return mockData;
}

export function parsePropertyDataError(error: unknown): PropertyDataError {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as PropertyDataError;
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { message: 'Unable to connect. Check your internet connection.', code: 'NETWORK_ERROR' };
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return { message: 'Session expired. Please re-authenticate.', code: 'UNAUTHORIZED' };
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return { message: 'Property data not found for this address.', code: 'NOT_FOUND' };
    }
    return { message: error.message, code: 'UNKNOWN' };
  }

  return { message: 'Unable to fetch roof data.', code: 'UNKNOWN' };
}

function generateOrthogonalMockImagery(propertyId: string): string[] {
  const baseIndex = Math.abs(
    propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  const orthogonalImages = [
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const count = 4 + (baseIndex % 3);
  const startIdx = baseIndex % orthogonalImages.length;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(orthogonalImages[(startIdx + i) % orthogonalImages.length]);
  }

  return result;
}

export async function fetchOrthogonalImagery(params: FetchImageryParams): Promise<string[]> {
  const { propertyId, addressText, organizationId } = params;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token || supabaseAnonKey;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/property-data-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        propertyId,
        addressText,
        organizationId,
        includeImagery: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.images || [];
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
    return generateOrthogonalMockImagery(propertyId);
  }
}

export function parseImageryError(error: unknown): ImageryError {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as ImageryError;
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { message: 'Unable to load imagery. Check your connection.', code: 'NETWORK_ERROR' };
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return { message: 'Authentication required for imagery.', code: 'UNAUTHORIZED' };
    }
    if (error.message.includes('not available') || error.message.includes('404')) {
      return { message: 'Imagery not available for this property.', code: 'NOT_AVAILABLE' };
    }
    return { message: error.message, code: 'UNKNOWN' };
  }

  return { message: 'Unable to load imagery.', code: 'UNKNOWN' };
}

export async function fetchAndNormalize(params: FetchAndNormalizeParams): Promise<FetchAndNormalizeResult> {
  const {
    propertyId,
    addressText,
    includeImagery = false,
    accountMode,
    organizationId,
    forceRefresh = false,
  } = params;

  if (!forceRefresh) {
    const cached = getCachedPropertyData(propertyId, includeImagery);
    if (cached) {
      const normalizeResult = normalizePropertyDataResponse(
        cached,
        'json',
        { includeRaw: shouldIncludeRawData(), source: cached.source }
      );
      if (normalizeResult.success) {
        return {
          success: true,
          data: normalizeResult.data,
        };
      }
    }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: {
        message: 'Configuration error',
        code: 'UNKNOWN',
      },
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/property-data-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        propertyId,
        addressText,
        organizationId,
        includeImagery,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          message: errorData.error || `API request failed with status ${response.status}`,
          code: response.status === 401 ? 'UNAUTHORIZED' : response.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
        },
      };
    }

    const rawData = await response.json();

    const normalizeResult = normalizePropertyDataResponse(
      rawData,
      'json',
      {
        includeRaw: shouldIncludeRawData(),
        source: rawData.source || 'EagleView Property Data',
      }
    );

    if (!normalizeResult.success) {
      return {
        success: false,
        error: normalizeResult.error,
      };
    }

    const normalizedData: NormalizedPropertyData = normalizeResult.data;

    const propertyDataForCache: PropertyData = {
      roofAreaSqFt: normalizedData.roofAreaSqFt,
      pitch: normalizedData.pitch,
      pitchDescription: normalizedData.pitchDescription,
      confidence: normalizedData.confidence,
      images: normalizedData.images,
      source: normalizedData.source,
      fetchedAt: normalizedData.fetchedAt,
      raw: normalizedData.raw,
    };

    cachePropertyData(propertyId, propertyDataForCache, includeImagery);

    return {
      success: true,
      data: normalizedData,
    };
  } catch (error) {
    console.error('fetchAndNormalize error:', error);
    return {
      success: false,
      error: parsePropertyDataError(error),
    };
  }
}
