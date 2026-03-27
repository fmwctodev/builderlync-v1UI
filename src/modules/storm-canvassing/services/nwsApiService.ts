const NWS_BASE = 'https://api.weather.gov';
const NWS_HEADERS = {
  'User-Agent': 'Builderlync/1.0 (contact@builderlync.com)',
  Accept: 'application/geo+json',
};

export type NWSSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
export type NWSCertainty = 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';
export type NWSUrgency = 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';

export interface NWSAlertFeature {
  id: string;
  type: 'Feature';
  geometry: GeoJSON.Geometry | null;
  properties: {
    id: string;
    areaDesc: string;
    geocode: { FIPS6?: string[]; UGC?: string[] };
    affectedZones: string[];
    sent: string;
    effective: string;
    onset?: string;
    expires: string;
    ends?: string;
    status: string;
    messageType: string;
    category: string;
    severity: NWSSeverity;
    certainty: NWSCertainty;
    urgency: NWSUrgency;
    event: string;
    sender: string;
    senderName: string;
    headline?: string;
    description?: string;
    instruction?: string;
    response: string;
    parameters: Record<string, string[]>;
  };
}

export interface NWSAlertsCollection {
  type: 'FeatureCollection';
  features: NWSAlertFeature[];
  title: string;
  updated: string;
}

export interface NWSObservation {
  timestamp: string;
  textDescription?: string;
  presentWeather?: Array<{ intensity?: string; descriptor?: string; weather?: string; rawString: string }>;
  temperature?: { value: number | null; unitCode: string };
  dewpoint?: { value: number | null; unitCode: string };
  windDirection?: { value: number | null; unitCode: string };
  windSpeed?: { value: number | null; unitCode: string };
  precipitationLastHour?: { value: number | null; unitCode: string };
  precipitationLast3Hours?: { value: number | null; unitCode: string };
}

export interface NWSStation {
  stationIdentifier: string;
  name: string;
  state?: string;
  geometry?: GeoJSON.Point;
  elevation?: { value: number; unitCode: string };
  timeZone?: string;
}

export interface NWSGridpointForecast {
  updateTime: string;
  validTimes: string;
  elevation?: { value: number; unitCode: string };
  periods?: NWSForecastPeriod[];
}

export interface NWSForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  probabilityOfPrecipitation?: { value: number | null };
  icon?: string;
}

export interface NWSGridpointData {
  updateTime: string;
  validTimes?: string;
  weather?: {
    values: Array<{
      validTime: string;
      value: Array<{
        coverage?: string;
        weather?: string;
        intensity?: string;
        visibility?: { value: number; unitCode: string };
        attributes?: string[];
      }>;
    }>;
  };
  probabilityOfPrecipitation?: {
    values: Array<{ validTime: string; value: number | null }>;
  };
  skyCover?: {
    values: Array<{ validTime: string; value: number | null }>;
  };
  hazards?: {
    values: Array<{
      validTime: string;
      value: Array<{ phenomenon?: string; significance?: string; event_number?: number }>;
    }>;
  };
}

export interface NWSZone {
  id: string;
  type: 'Feature';
  geometry: GeoJSON.Geometry | null;
  properties: {
    id: string;
    type: string;
    name: string;
    state?: string;
    forecastOffice?: string;
    observationStations?: string[];
    radarStation?: string;
  };
}

export interface ParsedHailAlert {
  id: string;
  event: string;
  severity: NWSSeverity;
  certainty: NWSCertainty;
  urgency: NWSUrgency;
  headline?: string;
  description?: string;
  instruction?: string;
  areaDesc: string;
  ugcZones: string[];
  effective: string;
  onset?: string;
  expires: string;
  ends?: string;
  senderName: string;
  geometry: GeoJSON.Geometry | null;
  maxHailInches?: number;
  isHailRelated: boolean;
  isTornadoRelated: boolean;
  isThunderstormRelated: boolean;
}

export interface StationHailObservation {
  stationId: string;
  stationName: string;
  timestamp: string;
  hasHail: boolean;
  hailDescription?: string;
  precipitationMm?: number;
  windSpeedKph?: number;
  textDescription?: string;
}

export interface HailForecastPoint {
  validTime: string;
  hasHailWeather: boolean;
  weatherDescriptions: string[];
  precipitationProbability: number | null;
  skyCoverPercent: number | null;
  hazardPhenomena: string[];
}

const TYPE_SEVERITY_ORDER: Record<string, number> = {
  Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0,
};

export function isHailRelated(event: string, description?: string): boolean {
  const lower = (event + ' ' + (description || '')).toLowerCase();
  return lower.includes('hail') || lower.includes('hailstorm');
}

export function isTornadoRelated(event: string): boolean {
  return event.toLowerCase().includes('tornado');
}

export function isThunderstormRelated(event: string): boolean {
  return event.toLowerCase().includes('thunderstorm') || event.toLowerCase().includes('severe storm');
}

export function extractHailSizeFromText(text: string): number | undefined {
  const patterns = [
    /hail\s+up\s+to\s+([\d.]+)\s*(?:inch|in)/i,
    /([\d.]+)\s*[""]\s*hail/i,
    /([\d.]+)\s+inch\s+hail/i,
    /hail\s+to\s+([\d.]+)\s*(?:inch|in)/i,
    /quarter\s+size\s+hail/i,
    /golf\s+ball\s+(?:size\s+)?hail/i,
    /baseball\s+(?:size\s+)?hail/i,
    /ping.?pong\s+(?:ball\s+)?hail/i,
  ];

  if (/baseball\s+(?:size\s+)?hail/i.test(text)) return 2.75;
  if (/golf\s+ball\s+(?:size\s+)?hail/i.test(text)) return 1.75;
  if (/ping.?pong\s+(?:ball\s+)?hail/i.test(text)) return 1.5;
  if (/quarter\s+size\s+hail/i.test(text)) return 1.0;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0 && val < 12) return val;
    }
  }
  return undefined;
}

export function parseAlertFeature(feature: NWSAlertFeature): ParsedHailAlert {
  const p = feature.properties;
  const fullText = (p.headline || '') + ' ' + (p.description || '') + ' ' + (p.instruction || '');
  const maxHailInches = extractHailSizeFromText(fullText);

  return {
    id: feature.id,
    event: p.event,
    severity: p.severity,
    certainty: p.certainty as NWSCertainty,
    urgency: p.urgency as NWSUrgency,
    headline: p.headline,
    description: p.description,
    instruction: p.instruction,
    areaDesc: p.areaDesc,
    ugcZones: p.geocode?.UGC || [],
    effective: p.effective,
    onset: p.onset,
    expires: p.expires,
    ends: p.ends,
    senderName: p.senderName,
    geometry: feature.geometry,
    maxHailInches,
    isHailRelated: isHailRelated(p.event, p.description),
    isTornadoRelated: isTornadoRelated(p.event),
    isThunderstormRelated: isThunderstormRelated(p.event),
  };
}

export async function fetchActiveAlertsByArea(
  area: string,
  eventFilter?: string[]
): Promise<ParsedHailAlert[]> {
  const params = new URLSearchParams({ area: area.toUpperCase(), status: 'actual' });
  if (eventFilter && eventFilter.length > 0) {
    params.set('event', eventFilter.join(','));
  }

  const res = await fetch(`${NWS_BASE}/alerts/active?${params}`, { headers: NWS_HEADERS });
  if (!res.ok) throw new Error(`NWS alerts API error: ${res.status} for area ${area}`);

  const data: NWSAlertsCollection = await res.json();
  return data.features.map(parseAlertFeature);
}

export async function fetchActiveAlertsByZone(zoneId: string): Promise<ParsedHailAlert[]> {
  const res = await fetch(`${NWS_BASE}/alerts/active/zone/${zoneId}`, { headers: NWS_HEADERS });
  if (!res.ok) throw new Error(`NWS zone alerts API error: ${res.status} for zone ${zoneId}`);

  const data: NWSAlertsCollection = await res.json();
  return data.features.map(parseAlertFeature);
}

export async function fetchHailAlertsByStates(
  stateCodes: string[],
  minSeverity: NWSSeverity = 'Minor'
): Promise<ParsedHailAlert[]> {
  const results: ParsedHailAlert[] = [];
  const seenIds = new Set<string>();
  const minSevOrder = TYPE_SEVERITY_ORDER[minSeverity] ?? 0;

  for (const state of stateCodes) {
    try {
      const alerts = await fetchActiveAlertsByArea(state);
      for (const alert of alerts) {
        if (seenIds.has(alert.id)) continue;
        if (!alert.isHailRelated && !alert.isThunderstormRelated && !alert.isTornadoRelated) continue;
        const sevOrder = TYPE_SEVERITY_ORDER[alert.severity] ?? 0;
        if (sevOrder < minSevOrder) continue;
        seenIds.add(alert.id);
        results.push(alert);
      }
    } catch {
      // continue
    }
  }

  return results;
}

export async function fetchStationObservations(
  stationId: string,
  limit: number = 24
): Promise<NWSObservation[]> {
  const res = await fetch(
    `${NWS_BASE}/stations/${stationId}/observations?limit=${limit}`,
    { headers: NWS_HEADERS }
  );
  if (!res.ok) throw new Error(`NWS observations error: ${res.status} for station ${stationId}`);

  const data = await res.json();
  return (data.features || []).map((f: { properties: NWSObservation }) => f.properties);
}

export async function fetchHailObservationsNearBbox(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
): Promise<StationHailObservation[]> {
  const stationsRes = await fetch(
    `${NWS_BASE}/stations?state=&limit=50`,
    { headers: NWS_HEADERS }
  );

  const results: StationHailObservation[] = [];

  if (!stationsRes.ok) return results;

  const stationsData = await stationsRes.json();
  const stations: NWSStation[] = (stationsData.features || []).map(
    (f: { properties: NWSStation; geometry?: GeoJSON.Point }) => ({
      ...f.properties,
      geometry: f.geometry,
    })
  );

  const nearbyStations = stations.filter((s) => {
    if (!s.geometry) return false;
    const [lng, lat] = s.geometry.coordinates;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  });

  for (const station of nearbyStations.slice(0, 5)) {
    try {
      const obs = await fetchStationObservations(station.stationIdentifier, 48);
      for (const ob of obs) {
        const hasHail = ob.presentWeather?.some(
          (pw) => pw.weather?.toLowerCase().includes('hail') || pw.rawString?.toLowerCase().includes('hail')
        ) || false;

        if (hasHail || ob.textDescription?.toLowerCase().includes('hail')) {
          results.push({
            stationId: station.stationIdentifier,
            stationName: station.name,
            timestamp: ob.timestamp,
            hasHail: true,
            hailDescription: ob.presentWeather?.map((pw) => pw.rawString).join(', '),
            precipitationMm: ob.precipitationLastHour?.value ?? undefined,
            windSpeedKph: ob.windSpeed?.value ?? undefined,
            textDescription: ob.textDescription,
          });
        }
      }
    } catch {
      // continue
    }
  }

  return results;
}

export async function fetchGridpointData(
  wfo: string,
  gridX: number,
  gridY: number
): Promise<NWSGridpointData> {
  const res = await fetch(`${NWS_BASE}/gridpoints/${wfo}/${gridX},${gridY}`, {
    headers: { ...NWS_HEADERS, Accept: 'application/ld+json' },
  });
  if (!res.ok) throw new Error(`NWS gridpoint error: ${res.status} for ${wfo}/${gridX},${gridY}`);
  return res.json();
}

export async function fetchGridpointForecast(
  wfo: string,
  gridX: number,
  gridY: number
): Promise<NWSGridpointForecast> {
  const res = await fetch(`${NWS_BASE}/gridpoints/${wfo}/${gridX},${gridY}/forecast`, {
    headers: NWS_HEADERS,
  });
  if (!res.ok) throw new Error(`NWS forecast error: ${res.status}`);
  const data = await res.json();
  return data.properties as NWSGridpointForecast;
}

export async function fetchPointMetadata(
  lat: number,
  lng: number
): Promise<{ wfo: string; gridX: number; gridY: number; forecastZone: string; county: string; state: string } | null> {
  const res = await fetch(`${NWS_BASE}/points/${lat.toFixed(4)},${lng.toFixed(4)}`, {
    headers: NWS_HEADERS,
  });
  if (!res.ok) return null;

  const data = await res.json();
  const props = data.properties;

  const forecastGridDataUrl: string = props.forecastGridData || '';
  const wfoMatch = forecastGridDataUrl.match(/gridpoints\/([A-Z]{3})\/(\d+),(\d+)/);

  if (!wfoMatch) return null;

  const forecastZoneUrl: string = props.forecastZone || '';
  const countyUrl: string = props.county || '';

  return {
    wfo: wfoMatch[1],
    gridX: parseInt(wfoMatch[2]),
    gridY: parseInt(wfoMatch[3]),
    forecastZone: forecastZoneUrl.split('/').pop() || '',
    county: countyUrl.split('/').pop() || '',
    state: props.relativeLocation?.properties?.state || '',
  };
}

export async function extractHailForecastFromGridpoint(
  wfo: string,
  gridX: number,
  gridY: number
): Promise<HailForecastPoint[]> {
  try {
    const data = await fetchGridpointData(wfo, gridX, gridY);
    const results: HailForecastPoint[] = [];

    const weatherValues = data.weather?.values || [];
    const precipValues = data.probabilityOfPrecipitation?.values || [];
    const skyValues = data.skyCover?.values || [];
    const hazardValues = data.hazards?.values || [];

    const timeMap = new Map<string, HailForecastPoint>();

    for (const wv of weatherValues) {
      const hasHailWeather = wv.value.some(
        (v) =>
          v.weather?.toLowerCase().includes('hail') ||
          v.weather?.toLowerCase().includes('thunderstorm')
      );
      const descriptions = wv.value
        .filter((v) => v.weather)
        .map((v) => [v.coverage, v.weather, v.intensity].filter(Boolean).join(' '));

      timeMap.set(wv.validTime, {
        validTime: wv.validTime,
        hasHailWeather,
        weatherDescriptions: descriptions,
        precipitationProbability: null,
        skyCoverPercent: null,
        hazardPhenomena: [],
      });
    }

    for (const pv of precipValues) {
      const existing = timeMap.get(pv.validTime);
      if (existing) {
        existing.precipitationProbability = pv.value;
      }
    }

    for (const sv of skyValues) {
      const existing = timeMap.get(sv.validTime);
      if (existing) {
        existing.skyCoverPercent = sv.value;
      }
    }

    for (const hv of hazardValues) {
      const existing = timeMap.get(hv.validTime);
      if (existing) {
        existing.hazardPhenomena = hv.value
          .map((v) => [v.phenomenon, v.significance].filter(Boolean).join('.'))
          .filter(Boolean);
      }
    }

    results.push(...Array.from(timeMap.values()));
    return results.sort((a, b) => a.validTime.localeCompare(b.validTime));
  } catch {
    return [];
  }
}

export async function fetchZoneInfo(zoneId: string): Promise<NWSZone | null> {
  const res = await fetch(`${NWS_BASE}/zones/forecast/${zoneId}`, { headers: NWS_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  return data as NWSZone;
}

export async function fetchZonesByState(stateCode: string): Promise<NWSZone[]> {
  const res = await fetch(
    `${NWS_BASE}/zones/forecast?area=${stateCode.toUpperCase()}&include_geometry=false`,
    { headers: NWS_HEADERS }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []) as NWSZone[];
}

export function buildAlertGeoJSONLayer(alerts: ParsedHailAlert[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: alerts
      .filter((a) => a.geometry != null)
      .map((a) => ({
        type: 'Feature' as const,
        id: a.id,
        geometry: a.geometry as GeoJSON.Geometry,
        properties: {
          alert_id: a.id,
          event: a.event,
          severity: a.severity,
          certainty: a.certainty,
          headline: a.headline,
          max_hail_inches: a.maxHailInches,
          expires: a.expires,
          is_hail: a.isHailRelated,
          is_tornado: a.isTornadoRelated,
          fill_color: getAlertFillColor(a),
        },
      })),
  };
}

export function getAlertFillColor(alert: ParsedHailAlert): string {
  if (alert.isTornadoRelated) return '#ef4444';
  if (alert.severity === 'Extreme') return '#dc2626';
  if (alert.severity === 'Severe') {
    if (alert.isHailRelated) return '#f97316';
    return '#f59e0b';
  }
  if (alert.severity === 'Moderate') return '#eab308';
  return '#84cc16';
}

export function getSeverityLabel(severity: NWSSeverity): string {
  const labels: Record<NWSSeverity, string> = {
    Extreme: 'Extreme',
    Severe: 'Severe',
    Moderate: 'Moderate',
    Minor: 'Minor',
    Unknown: 'Unknown',
  };
  return labels[severity] ?? severity;
}

export function formatAlertExpiry(expires: string): string {
  const d = new Date(expires);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHrs > 0) return `Expires in ${diffHrs}h ${diffMins}m`;
  return `Expires in ${diffMins}m`;
}

