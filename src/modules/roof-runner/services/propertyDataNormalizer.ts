import type {
  NormalizedPropertyData,
  PropertyDataError,
  ResponseFormatType,
} from '../types/propertyData';
import {
  detectResponseFormat,
  parseXMLToJSON,
  extractRoofArea,
  extractPitch,
  extractImageUrls,
} from '../utils/propertyDataParser';
import { isFeatureEnabled } from '../config/featureFlags';

export interface NormalizationOptions {
  includeRaw?: boolean;
  source?: string;
}

export interface NormalizationResult {
  success: true;
  data: NormalizedPropertyData;
  format: ResponseFormatType;
}

export interface NormalizationError {
  success: false;
  error: PropertyDataError;
}

export type NormalizeResult = NormalizationResult | NormalizationError;

function getPitchDescription(pitch: number | null): string | null {
  if (pitch === null) return null;
  if (pitch <= 3) return 'Low slope';
  if (pitch <= 6) return 'Standard';
  if (pitch <= 9) return 'Steep';
  return 'Very steep';
}

function normalizeRoofArea(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value) || value <= 0) return null;
    return Math.round(value);
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }

  return null;
}

function normalizeImages(images: unknown): string[] {
  if (!images) return [];
  if (!Array.isArray(images)) return [];

  const uniqueUrls = new Set<string>();

  for (const img of images) {
    if (typeof img === 'string') {
      const trimmed = img.trim();
      if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:'))) {
        uniqueUrls.add(trimmed);
      }
    }
  }

  return Array.from(uniqueUrls);
}

export function shouldIncludeRawData(): boolean {
  return isFeatureEnabled('SHOW_RAW_PROPERTY_DATA');
}

export function createParseError(message: string): PropertyDataError {
  return {
    message,
    code: 'PARSE_ERROR',
  };
}

export function normalizePropertyDataResponse(
  rawData: unknown,
  format: ResponseFormatType,
  options: NormalizationOptions = {}
): NormalizeResult {
  const { includeRaw = shouldIncludeRawData(), source = 'EagleView Property Data' } = options;
  const fetchedAt = new Date().toISOString();

  try {
    if (!rawData || typeof rawData !== 'object') {
      return {
        success: false,
        error: createParseError('Invalid response data'),
      };
    }

    const data = rawData as Record<string, unknown>;

    const roofAreaSqFt = normalizeRoofArea(extractRoofArea(data));
    const pitch = extractPitch(data);
    const pitchDescription = getPitchDescription(pitch);
    const images = normalizeImages(extractImageUrls(data));

    const normalized: NormalizedPropertyData = {
      roofAreaSqFt,
      pitch,
      pitchDescription,
      confidence: null,
      images,
      source,
      fetchedAt,
      responseFormat: format,
    };

    if (includeRaw) {
      normalized.raw = data;
    }

    return {
      success: true,
      data: normalized,
      format,
    };
  } catch (error) {
    console.error('Property data normalization error:', error);
    return {
      success: false,
      error: createParseError(
        error instanceof Error ? error.message : 'Failed to normalize property data'
      ),
    };
  }
}

export function parseAndNormalizeResponse(
  responseText: string,
  options: NormalizationOptions = {}
): NormalizeResult {
  const format = detectResponseFormat(responseText);

  if (format === 'unknown') {
    return {
      success: false,
      error: createParseError('Unknown response format'),
    };
  }

  let data: Record<string, unknown>;

  try {
    if (format === 'json') {
      data = JSON.parse(responseText);
    } else if (format === 'xml') {
      data = parseXMLToJSON(responseText);
    } else {
      return {
        success: false,
        error: createParseError('Unsupported response format'),
      };
    }
  } catch (error) {
    console.error('Response parsing error:', error);
    return {
      success: false,
      error: createParseError(
        `Failed to parse ${format.toUpperCase()} response`
      ),
    };
  }

  return normalizePropertyDataResponse(data, format, options);
}

export function mergeWithExistingData(
  existing: NormalizedPropertyData,
  updates: Partial<NormalizedPropertyData>
): NormalizedPropertyData {
  return {
    ...existing,
    ...updates,
    images: updates.images && updates.images.length > 0 ? updates.images : existing.images,
    fetchedAt: new Date().toISOString(),
  };
}
