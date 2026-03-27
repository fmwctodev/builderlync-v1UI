import { supabase } from '../../../shared/lib/supabase';
import type { StormEvent, StormLayer, StormProvider } from '../types';
import {
  createStormProvider,
  mapStormEventResultToEntity,
  mapStormLayerResultToEntity,
} from '../providers/stormProvider';

export interface StormEventFilters {
  isActive?: boolean;
  provider?: StormProvider;
  dateFrom?: string;
  dateTo?: string;
}

export async function getStormEvents(
  organizationId: string,
  filters?: StormEventFilters
): Promise<StormEvent[]> {
  let query = supabase
    .from('storm_events')
    .select('*, storm_layers(*)')
    .eq('organization_id', organizationId)
    .order('event_date', { ascending: false });

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  if (filters?.provider) {
    query = query.eq('provider', filters.provider);
  }

  if (filters?.dateFrom) {
    query = query.gte('event_date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('event_date', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch storm events: ${error.message}`);
  }

  return (data || []).map((row) => ({
    ...row,
    layers: row.storm_layers || [],
  }));
}

export async function getStormEventById(
  organizationId: string,
  eventId: string
): Promise<StormEvent | null> {
  const { data, error } = await supabase
    .from('storm_events')
    .select('*, storm_layers(*)')
    .eq('organization_id', organizationId)
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch storm event: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    layers: data.storm_layers || [],
  };
}

export async function getStormEventByAlertId(
  organizationId: string,
  noaaAlertId: string
): Promise<StormEvent | null> {
  const { data, error } = await supabase
    .from('storm_events')
    .select('*, storm_layers(*)')
    .eq('organization_id', organizationId)
    .eq('noaa_alert_id', noaaAlertId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch storm event by alert ID: ${error.message}`);
  }

  if (!data) return null;
  return { ...data, layers: data.storm_layers || [] };
}

export async function createStormEvent(
  organizationId: string,
  eventData: Partial<StormEvent>,
  userId?: string
): Promise<StormEvent> {
  const { data, error } = await supabase
    .from('storm_events')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      name: eventData.name,
      description: eventData.description,
      provider: eventData.provider || 'MOCK',
      external_id: eventData.external_id,
      noaa_alert_id: eventData.noaa_alert_id,
      event_date: eventData.event_date,
      event_start: eventData.event_start,
      event_end: eventData.event_end,
      bbox: eventData.bbox,
      center_lat: eventData.center_lat,
      center_lng: eventData.center_lng,
      metadata: eventData.metadata || {},
      is_active: eventData.is_active ?? true,
      status: eventData.status,
      max_hail_estimate: eventData.max_hail_estimate,
      confidence_score: eventData.confidence_score,
      ingestion_job_id: eventData.ingestion_job_id,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create storm event: ${error.message}`);
  }

  return data;
}

export async function updateStormEvent(
  organizationId: string,
  eventId: string,
  updates: Partial<StormEvent>
): Promise<StormEvent> {
  const { data, error } = await supabase
    .from('storm_events')
    .update({
      name: updates.name,
      description: updates.description,
      event_date: updates.event_date,
      event_start: updates.event_start,
      event_end: updates.event_end,
      bbox: updates.bbox,
      center_lat: updates.center_lat,
      center_lng: updates.center_lng,
      metadata: updates.metadata,
      is_active: updates.is_active,
    })
    .eq('organization_id', organizationId)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update storm event: ${error.message}`);
  }

  return data;
}

export async function deleteStormEvent(
  organizationId: string,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from('storm_events')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to delete storm event: ${error.message}`);
  }
}

export async function importStormEventsFromProvider(
  organizationId: string,
  provider: StormProvider,
  apiKey?: string,
  dateRange?: [Date, Date],
  userId?: string
): Promise<StormEvent[]> {
  const stormProvider = createStormProvider({
    provider,
    hailtraceApiKey: provider === 'HAILTRACE' ? apiKey : undefined,
    hailReconApiKey: provider === 'HAIL_RECON' ? apiKey : undefined,
  });

  const events = await stormProvider.listEvents({ dateRange });
  const importedEvents: StormEvent[] = [];

  for (const eventResult of events) {
    const eventEntity = mapStormEventResultToEntity(eventResult, organizationId, provider);
    const event = await createStormEvent(organizationId, eventEntity, userId);

    const layers = await stormProvider.getLayers(eventResult.externalId);
    for (const layerResult of layers) {
      const layerEntity = mapStormLayerResultToEntity(layerResult, organizationId, event.id);

      if (layerResult.format === 'GEOJSON') {
        const geojson = await stormProvider.getLayerGeoJSON(layerResult.externalId);
        layerEntity.geojson = geojson;
      }

      await createStormLayer(organizationId, event.id, layerEntity);
    }

    const fullEvent = await getStormEventById(organizationId, event.id);
    if (fullEvent) {
      importedEvents.push(fullEvent);
    }
  }

  return importedEvents;
}

export async function createStormLayer(
  organizationId: string,
  stormEventId: string,
  layerData: Partial<StormLayer>
): Promise<StormLayer> {
  const { data, error } = await supabase
    .from('storm_layers')
    .insert({
      organization_id: organizationId,
      storm_event_id: stormEventId,
      name: layerData.name,
      layer_type: layerData.layer_type || 'HAIL',
      format: layerData.format || 'GEOJSON',
      geojson: layerData.geojson,
      source_url: layerData.source_url,
      min_threshold: layerData.min_threshold,
      max_threshold: layerData.max_threshold,
      style: layerData.style || {},
      is_visible: layerData.is_visible ?? true,
      display_order: layerData.display_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create storm layer: ${error.message}`);
  }

  return data;
}

export async function updateStormLayer(
  organizationId: string,
  layerId: string,
  updates: Partial<StormLayer>
): Promise<StormLayer> {
  const { data, error } = await supabase
    .from('storm_layers')
    .update({
      name: updates.name,
      is_visible: updates.is_visible,
      style: updates.style,
      min_threshold: updates.min_threshold,
      max_threshold: updates.max_threshold,
      display_order: updates.display_order,
    })
    .eq('organization_id', organizationId)
    .eq('id', layerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update storm layer: ${error.message}`);
  }

  return data;
}

export async function deleteStormLayer(
  organizationId: string,
  layerId: string
): Promise<void> {
  const { error } = await supabase
    .from('storm_layers')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', layerId);

  if (error) {
    throw new Error(`Failed to delete storm layer: ${error.message}`);
  }
}

export async function getLayerGeoJSON(
  organizationId: string,
  layerId: string
): Promise<GeoJSON.FeatureCollection | null> {
  const { data, error } = await supabase
    .from('storm_layers')
    .select('geojson')
    .eq('organization_id', organizationId)
    .eq('id', layerId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch layer GeoJSON: ${error.message}`);
  }

  return data?.geojson || null;
}
