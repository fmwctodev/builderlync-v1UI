import type { PropertyData } from '../types/propertyData';
import { parsePitchValue } from './pitchUtils';

export type ResponseFormat = 'json' | 'xml' | 'unknown';

export function detectResponseFormat(response: string): ResponseFormat {
  const trimmed = response.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return 'xml';
  }
  return 'unknown';
}

export function parseXMLToJSON(xmlString: string): Record<string, unknown> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Failed to parse XML response');
  }

  return xmlNodeToObject(doc.documentElement);
}

function xmlNodeToObject(node: Element): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  if (node.attributes && node.attributes.length > 0) {
    obj['@attributes'] = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      (obj['@attributes'] as Record<string, string>)[attr.name] = attr.value;
    }
  }

  if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() || '';
    if (Object.keys(obj).length === 0) {
      return { '#text': text } as Record<string, unknown>;
    }
    obj['#text'] = text;
    return obj;
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element;
      const childObj = xmlNodeToObject(childElement);
      const childName = childElement.nodeName;

      if (obj[childName]) {
        if (!Array.isArray(obj[childName])) {
          obj[childName] = [obj[childName]];
        }
        (obj[childName] as unknown[]).push(childObj);
      } else {
        obj[childName] = childObj;
      }
    }
  }

  return obj;
}

const ROOF_AREA_FIELD_NAMES = [
  'roofAreaSqFt',
  'roof_area_sqft',
  'roofArea',
  'roof_area',
  'totalRoofArea',
  'total_roof_area',
  'TotalRoofArea',
  'RoofArea',
  'squareFootage',
  'square_footage',
  'SquareFootage',
  'area',
  'Area',
];

const PITCH_FIELD_NAMES = [
  'pitch',
  'Pitch',
  'roofPitch',
  'roof_pitch',
  'RoofPitch',
  'primaryPitch',
  'primary_pitch',
  'PrimaryPitch',
  'slope',
  'Slope',
];

const IMAGERY_FIELD_NAMES = [
  'images',
  'orthogonalImages',
  'imagery',
  'propertyImages',
  'aerialImages',
  'roofImages',
  'orthogonal_images',
  'property_images',
  'aerial_images',
  'roof_images',
];

export function extractRoofArea(data: Record<string, unknown>): number | null {
  for (const fieldName of ROOF_AREA_FIELD_NAMES) {
    const value = findValueByKey(data, fieldName);
    if (value !== null && value !== undefined) {
      const numValue = parseNumericValue(value);
      if (numValue !== null && numValue > 0) {
        return Math.round(numValue);
      }
    }
  }
  return null;
}

export function extractPitch(data: Record<string, unknown>): number | null {
  for (const fieldName of PITCH_FIELD_NAMES) {
    const value = findValueByKey(data, fieldName);
    if (value !== null && value !== undefined) {
      const numValue = parsePitchValue(value);
      if (numValue !== null && numValue >= 0) {
        return numValue;
      }
    }
  }
  return null;
}

function isValidUrl(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length === 0) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:');
}

export function extractImageUrls(data: Record<string, unknown>): string[] {
  const urls: string[] = [];

  for (const fieldName of IMAGERY_FIELD_NAMES) {
    const value = findValueByKey(data, fieldName);
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && isValidUrl(item)) {
            urls.push(item.trim());
          } else if (typeof item === 'object' && item !== null) {
            const urlValue = (item as Record<string, unknown>)['url'] ||
                           (item as Record<string, unknown>)['src'] ||
                           (item as Record<string, unknown>)['#text'];
            if (typeof urlValue === 'string' && isValidUrl(urlValue)) {
              urls.push(urlValue.trim());
            }
          }
        }
      } else if (typeof value === 'string' && isValidUrl(value)) {
        urls.push(value.trim());
      }
    }
  }

  const uniqueUrls = [...new Set(urls)];
  return uniqueUrls;
}

function findValueByKey(obj: Record<string, unknown>, key: string): unknown {
  if (obj[key] !== undefined) {
    return obj[key];
  }

  for (const k of Object.keys(obj)) {
    const value = obj[k];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const found = findValueByKey(value as Record<string, unknown>, key);
      if (found !== undefined) {
        return found;
      }
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const found = findValueByKey(item as Record<string, unknown>, key);
          if (found !== undefined) {
            return found;
          }
        }
      }
    }
  }

  return undefined;
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  if (typeof value === 'object' && value !== null && '#text' in value) {
    return parseNumericValue((value as Record<string, unknown>)['#text']);
  }
  return null;
}

export function normalizeToPropertyData(
  raw: unknown,
  fetchedAt: string,
  source: string = 'EagleView Property Data'
): PropertyData {
  const data = raw as Record<string, unknown>;
  const roofAreaSqFt = extractRoofArea(data);
  const pitch = extractPitch(data);

  let pitchDescription: string | null = null;
  if (pitch !== null) {
    if (pitch <= 3) {
      pitchDescription = 'Low slope';
    } else if (pitch <= 6) {
      pitchDescription = 'Standard';
    } else if (pitch <= 9) {
      pitchDescription = 'Steep';
    } else {
      pitchDescription = 'Very steep';
    }
  }

  return {
    roofAreaSqFt,
    pitch,
    pitchDescription,
    confidence: null,
    images: [],
    source,
    fetchedAt,
    raw: data,
  };
}

export function parsePropertyDataResponse(
  responseText: string,
  source: string = 'EagleView Property Data'
): PropertyData {
  const format = detectResponseFormat(responseText);
  const fetchedAt = new Date().toISOString();

  let data: Record<string, unknown>;

  if (format === 'json') {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Failed to parse JSON response');
    }
  } else if (format === 'xml') {
    data = parseXMLToJSON(responseText);
  } else {
    throw new Error('Unknown response format');
  }

  return normalizeToPropertyData(data, fetchedAt, source);
}
