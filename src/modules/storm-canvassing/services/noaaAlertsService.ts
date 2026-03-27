import type { StormLayerType } from '../types';

const NWS_BASE_URL = 'https://api.weather.gov';
const USER_AGENT = 'BuilderLynk-StormCanvassing/1.0 (contact@builderlynk.com)';

export interface NWSAlert {
  id: string;
  areaDesc: string;
  geocode: {
    FIPS6?: string[];
    UGC?: string[];
  };
  affectedZones: string[];
  references: Array<{ identifier: string; sender: string; sent: string }>;
  sent: string;
  effective: string;
  onset?: string;
  expires: string;
  ends?: string;
  status: string;
  messageType: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender: string;
  senderName: string;
  headline?: string;
  description?: string;
  instruction?: string;
  response: string;
  parameters: Record<string, string[]>;
  geometry?: GeoJSON.Geometry | null;
}

export interface NWSAlertsResponse {
  type: string;
  features: Array<{
    id: string;
    type: string;
    geometry: GeoJSON.Geometry | null;
    properties: NWSAlert;
  }>;
  title: string;
  updated: string;
}

export interface ParsedStormAlert {
  alertId: string;
  event: string;
  layerType: StormLayerType;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  stateCode: string;
  areaDescription: string;
  headline?: string;
  description?: string;
  effective: string;
  expires: string;
  senderName: string;
  maxHailEstimate?: number;
  geometry: GeoJSON.Geometry | null;
  centerLat?: number;
  centerLng?: number;
  bbox?: { minLng: number; minLat: number; maxLng: number; maxLat: number };
}

const HAIL_EVENT_KEYWORDS = ['hail', 'hailstorm', 'severe thunderstorm'];
const WIND_EVENT_KEYWORDS = ['wind', 'high wind', 'extreme wind'];
const TORNADO_EVENT_KEYWORDS = ['tornado'];
const HURRICANE_EVENT_KEYWORDS = ['hurricane', 'tropical storm', 'typhoon'];

export function classifyAlertEventType(eventName: string): StormLayerType {
  const lower = eventName.toLowerCase();
  if (TORNADO_EVENT_KEYWORDS.some((k) => lower.includes(k))) return 'TORNADO';
  if (HURRICANE_EVENT_KEYWORDS.some((k) => lower.includes(k))) return 'HURRICANE';
  if (HAIL_EVENT_KEYWORDS.some((k) => lower.includes(k))) return 'HAIL';
  if (WIND_EVENT_KEYWORDS.some((k) => lower.includes(k))) return 'WIND';
  return 'HAIL';
}

export function isStormRelatedAlert(eventName: string): boolean {
  const lower = eventName.toLowerCase();
  const stormKeywords = [
    'hail', 'tornado', 'thunderstorm', 'wind', 'hurricane',
    'tropical storm', 'severe', 'storm', 'typhoon',
  ];
  return stormKeywords.some((k) => lower.includes(k));
}

export function extractMaxHailFromDescription(description?: string): number | undefined {
  if (!description) return undefined;
  const match = description.match(/hail\s+up\s+to\s+([\d.]+)\s+inch/i)
    || description.match(/([\d.]+)\s*[""]\s*hail/i)
    || description.match(/([\d.]+)\s+inch\s+hail/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0 && val < 10) return val;
  }
  return undefined;
}

export function computeBBoxFromGeometry(
  geometry: GeoJSON.Geometry | null
): { minLng: number; minLat: number; maxLng: number; maxLat: number } | undefined {
  if (!geometry) return undefined;

  let coords: [number, number][] = [];

  function extractCoords(geom: GeoJSON.Geometry) {
    if (geom.type === 'Point') {
      coords.push(geom.coordinates as [number, number]);
    } else if (geom.type === 'MultiPoint' || geom.type === 'LineString') {
      coords = coords.concat(geom.coordinates as [number, number][]);
    } else if (geom.type === 'Polygon' || geom.type === 'MultiLineString') {
      for (const ring of geom.coordinates) {
        coords = coords.concat(ring as [number, number][]);
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          coords = coords.concat(ring as [number, number][]);
        }
      }
    } else if (geom.type === 'GeometryCollection') {
      for (const g of geom.geometries) extractCoords(g);
    }
  }

  extractCoords(geometry);
  if (coords.length === 0) return undefined;

  let minLng = coords[0][0], maxLng = coords[0][0];
  let minLat = coords[0][1], maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return { minLng, minLat, maxLng, maxLat };
}

export function computeCenterFromBBox(bbox: {
  minLng: number; minLat: number; maxLng: number; maxLat: number;
}): { lat: number; lng: number } {
  return {
    lat: (bbox.minLat + bbox.maxLat) / 2,
    lng: (bbox.minLng + bbox.maxLng) / 2,
  };
}

export async function fetchActiveAlerts(stateCode: string): Promise<NWSAlert[]> {
  const url = `${NWS_BASE_URL}/alerts/active?area=${stateCode.toUpperCase()}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/geo+json',
    },
  });

  if (!response.ok) {
    throw new Error(`NWS API error for state ${stateCode}: ${response.status} ${response.statusText}`);
  }

  const body: NWSAlertsResponse = await response.json();
  return body.features.map((f) => ({ ...f.properties, id: f.id, geometry: f.geometry })) as NWSAlert[];
}

export async function fetchAlertsForStates(stateCodes: string[]): Promise<ParsedStormAlert[]> {
  const results: ParsedStormAlert[] = [];
  const seenIds = new Set<string>();

  for (const state of stateCodes) {
    try {
      const alerts = await fetchActiveAlerts(state);
      for (const alert of alerts) {
        if (seenIds.has(alert.id)) continue;
        if (!isStormRelatedAlert(alert.event)) continue;

        seenIds.add(alert.id);

        const geometry = (alert as unknown as { geometry?: GeoJSON.Geometry | null }).geometry ?? null;
        const bbox = computeBBoxFromGeometry(geometry);
        const center = bbox ? computeCenterFromBBox(bbox) : undefined;

        results.push({
          alertId: alert.id,
          event: alert.event,
          layerType: classifyAlertEventType(alert.event),
          severity: alert.severity as ParsedStormAlert['severity'],
          stateCode: state,
          areaDescription: alert.areaDesc,
          headline: alert.headline,
          description: alert.description,
          effective: alert.effective,
          expires: alert.expires,
          senderName: alert.senderName,
          maxHailEstimate: extractMaxHailFromDescription(alert.description),
          geometry,
          centerLat: center?.lat,
          centerLng: center?.lng,
          bbox,
        });
      }
    } catch {
      // continue with next state on error
    }
  }

  return results;
}

export function buildGeoJSONFromAlert(alert: ParsedStormAlert): GeoJSON.FeatureCollection {
  if (alert.geometry) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: alert.geometry,
          properties: {
            alert_id: alert.alertId,
            event: alert.event,
            severity: alert.severity,
            layer_type: alert.layerType,
            hail_size: alert.maxHailEstimate,
          },
        },
      ],
    };
  }

  if (!alert.centerLat || !alert.centerLng) {
    return { type: 'FeatureCollection', features: [] };
  }

  const radiusDeg = 0.25;
  const steps = 32;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    coords.push([
      alert.centerLng + radiusDeg * Math.cos(angle),
      alert.centerLat + radiusDeg * Math.sin(angle),
    ]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: {
          alert_id: alert.alertId,
          event: alert.event,
          severity: alert.severity,
          layer_type: alert.layerType,
          hail_size: alert.maxHailEstimate,
        },
      },
    ],
  };
}
