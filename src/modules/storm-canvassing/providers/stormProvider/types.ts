import type { StormEvent, StormLayer } from '../../types';

export interface StormEventQueryParams {
  dateRange?: [Date, Date];
  bbox?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  limit?: number;
}

export interface StormProviderInterface {
  name: string;

  listEvents(params?: StormEventQueryParams): Promise<StormEventResult[]>;

  getEventById(externalId: string): Promise<StormEventResult | null>;

  getLayers(eventId: string): Promise<StormLayerResult[]>;

  getLayerGeoJSON(layerId: string): Promise<GeoJSON.FeatureCollection>;

  getLayerTileUrl?(layerId: string): Promise<string>;

  testConnection(): Promise<boolean>;
}

export interface StormEventResult {
  externalId: string;
  name: string;
  description?: string;
  eventDate?: Date;
  eventStart?: Date;
  eventEnd?: Date;
  bbox?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  centerLat?: number;
  centerLng?: number;
  metadata?: Record<string, unknown>;
}

export interface StormLayerResult {
  externalId: string;
  name: string;
  layerType: 'HAIL' | 'WIND' | 'TORNADO' | 'FLOOD';
  format: 'GEOJSON' | 'TILESET_URL';
  geojson?: GeoJSON.FeatureCollection;
  sourceUrl?: string;
  minThreshold?: number;
  maxThreshold?: number;
  style?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
  };
}

export function mapStormEventResultToEntity(
  result: StormEventResult,
  organizationId: string,
  provider: 'MOCK' | 'HAILTRACE' | 'HAIL_RECON'
): Partial<StormEvent> {
  return {
    organization_id: organizationId,
    provider,
    external_id: result.externalId,
    name: result.name,
    description: result.description,
    event_date: result.eventDate?.toISOString().split('T')[0],
    event_start: result.eventStart?.toISOString(),
    event_end: result.eventEnd?.toISOString(),
    bbox: result.bbox,
    center_lat: result.centerLat,
    center_lng: result.centerLng,
    metadata: result.metadata,
    is_active: true,
  };
}

export function mapStormLayerResultToEntity(
  result: StormLayerResult,
  organizationId: string,
  stormEventId: string
): Partial<StormLayer> {
  return {
    organization_id: organizationId,
    storm_event_id: stormEventId,
    name: result.name,
    layer_type: result.layerType,
    format: result.format,
    geojson: result.geojson,
    source_url: result.sourceUrl,
    min_threshold: result.minThreshold,
    max_threshold: result.maxThreshold,
    style: result.style,
    is_visible: true,
    display_order: 0,
  };
}
