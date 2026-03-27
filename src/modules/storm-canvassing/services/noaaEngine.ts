import type { StormEvent, StormLayer, NOAAConfig, NOAAIngestionResult, HailSeverityBand, DoorStormMatch } from '../types';
import { getHailSeverityBand, HAIL_SEVERITY_COLORS } from '../types';
import { supabase } from '../../../shared/lib/supabase';
import { createStormEvent, createStormLayer, getStormEventByAlertId } from './stormEventsApi';
import { createIngestionJob, updateIngestionJobStatus } from './stormIngestionApi';
import {
  fetchAlertsForStates,
  buildGeoJSONFromAlert,
  type ParsedStormAlert,
} from './noaaAlertsService';

const DEFAULT_NOAA_CONFIG: NOAAConfig = {
  enabled: false,
  mrmsBaseUrl: 'https://mrms.ncep.noaa.gov/data',
  hailThresholdInches: 0.75,
  autoIngestEnabled: false,
  ingestIntervalMinutes: 60,
  operatingStates: [],
};

export function buildHailSeverityColorScale(): Array<{ value: number; color: string }> {
  return [
    { value: 0.25, color: HAIL_SEVERITY_COLORS.QUARTER },
    { value: 0.5, color: HAIL_SEVERITY_COLORS.HALF },
    { value: 0.75, color: HAIL_SEVERITY_COLORS.THREE_QUARTER },
    { value: 1.0, color: HAIL_SEVERITY_COLORS.ONE_INCH },
    { value: 1.75, color: HAIL_SEVERITY_COLORS.GOLF_BALL },
    { value: 2.75, color: HAIL_SEVERITY_COLORS.BASEBALL },
  ];
}

export function buildMockHailGeoJSON(
  centerLat: number,
  centerLng: number,
  radiusDeg: number = 0.3
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const bands: Array<{ size: number; band: HailSeverityBand; radiusMult: number }> = [
    { size: 2.75, band: 'BASEBALL', radiusMult: 0.15 },
    { size: 1.75, band: 'GOLF_BALL', radiusMult: 0.25 },
    { size: 1.0, band: 'ONE_INCH', radiusMult: 0.4 },
    { size: 0.75, band: 'THREE_QUARTER', radiusMult: 0.55 },
    { size: 0.5, band: 'HALF', radiusMult: 0.7 },
    { size: 0.25, band: 'QUARTER', radiusMult: 0.85 },
  ];

  for (const band of bands) {
    const r = radiusDeg * band.radiusMult;
    const coords: [number, number][] = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      coords.push([
        centerLng + r * Math.cos(angle),
        centerLat + r * Math.sin(angle),
      ]);
    }
    features.push({
      type: 'Feature',
      properties: {
        hail_size: band.size,
        severity_band: band.band,
        fill_color: HAIL_SEVERITY_COLORS[band.band],
      },
      geometry: { type: 'Polygon', coordinates: [coords] },
    });
  }

  return { type: 'FeatureCollection', features };
}

export async function runNOAAIngestion(
  organizationId: string,
  operatingStates: string[],
  userId?: string,
  hailThreshold: number = 0.75
): Promise<NOAAIngestionResult> {
  if (operatingStates.length === 0) {
    throw new Error('No operating states configured. Please add at least one state to monitor.');
  }

  const job = await createIngestionJob(
    organizationId,
    'NOAA',
    { mode: 'live', states: operatingStates, triggered_by: 'manual' },
    userId
  );

  await updateIngestionJobStatus(job.id, 'RUNNING', {
    started_at: new Date().toISOString(),
  });

  const importedEvents: StormEvent[] = [];
  let eventsCreated = 0;
  let layersCreated = 0;
  let duplicatesSkipped = 0;

  try {
    const alerts = await fetchAlertsForStates(operatingStates);
    const filtered = alerts.filter(
      (a) => !a.maxHailEstimate || a.maxHailEstimate >= hailThreshold
    );

    for (const alert of filtered) {
      try {
        const existing = await getStormEventByAlertId(organizationId, alert.alertId);
        if (existing) {
          duplicatesSkipped++;
          continue;
        }

        const bbox = alert.bbox;
        const event = await createStormEvent(
          organizationId,
          {
            name: alert.headline || `${alert.event} — ${alert.areaDescription.substring(0, 60)}`,
            description: alert.description,
            provider: 'NOAA',
            external_id: alert.alertId,
            noaa_alert_id: alert.alertId,
            event_date: alert.effective.substring(0, 10),
            event_start: alert.effective,
            event_end: alert.expires,
            center_lat: alert.centerLat,
            center_lng: alert.centerLng,
            bbox,
            is_active: true,
            status: 'ACTIVE',
            max_hail_estimate: alert.maxHailEstimate,
            confidence_score: 0.85,
            ingestion_job_id: job.id,
            metadata: {
              source: 'noaa_nws_alerts',
              severity: alert.severity,
              state: alert.stateCode,
              sender: alert.senderName,
              job_id: job.id,
            },
          },
          userId
        );

        const geojson = buildGeoJSONFromAlert(alert);
        await createStormLayer(organizationId, event.id, {
          name: `${alert.event} Layer`,
          layer_type: alert.layerType,
          format: 'GEOJSON',
          geojson,
          min_threshold: alert.maxHailEstimate ? Math.max(0.25, alert.maxHailEstimate * 0.5) : 0.25,
          max_threshold: alert.maxHailEstimate,
          is_visible: true,
          display_order: 0,
          style: {
            fillOpacity: 0.45,
            strokeWidth: 1,
            colorScale: {
              property: 'hail_size',
              stops: buildHailSeverityColorScale(),
            },
          },
        });

        importedEvents.push(event);
        eventsCreated++;
        layersCreated++;
      } catch {
        // continue on per-alert error
      }
    }

    await updateIngestionJobStatus(job.id, 'COMPLETED', {
      completed_at: new Date().toISOString(),
      events_found: alerts.length,
      events_imported: eventsCreated,
    });
  } catch (err) {
    await updateIngestionJobStatus(job.id, 'FAILED', {
      completed_at: new Date().toISOString(),
      error_message: err instanceof Error ? err.message : 'Unknown error',
    });
    throw err;
  }

  return { events: importedEvents, eventsCreated, layersCreated, duplicatesSkipped };
}

export async function runMockIngestion(
  organizationId: string,
  userId?: string
): Promise<NOAAIngestionResult> {
  const job = await createIngestionJob(
    organizationId,
    'MOCK',
    { mode: 'mock', triggered_by: 'manual' },
    userId
  );

  await updateIngestionJobStatus(job.id, 'RUNNING', {
    started_at: new Date().toISOString(),
  });

  const mockEventDefs = [
    {
      name: 'Austin Metro Hailstorm - Mar 15, 2026',
      centerLat: 30.2672,
      centerLng: -97.7431,
      maxHail: 1.75,
      date: '2026-03-15',
      description: 'Severe hail event affecting central Austin and surrounding areas. Max hail size 1.75" (golf ball).',
    },
    {
      name: 'Round Rock Severe Cell - Mar 18, 2026',
      centerLat: 30.5085,
      centerLng: -97.6789,
      maxHail: 2.75,
      date: '2026-03-18',
      description: 'Significant hailstorm cell tracking northeast through Williamson County. Baseball-size hail reported.',
    },
    {
      name: 'Cedar Park Storm Complex - Mar 20, 2026',
      centerLat: 30.5052,
      centerLng: -97.8203,
      maxHail: 1.0,
      date: '2026-03-20',
      description: 'Storm complex producing 1-inch hail across western Cedar Park residential areas.',
    },
  ];

  const importedEvents: StormEvent[] = [];
  let eventsImported = 0;

  for (const def of mockEventDefs) {
    try {
      const bbox = {
        minLng: def.centerLng - 0.35,
        minLat: def.centerLat - 0.3,
        maxLng: def.centerLng + 0.35,
        maxLat: def.centerLat + 0.3,
      };

      const event = await createStormEvent(organizationId, {
        name: def.name,
        description: def.description,
        provider: 'MOCK',
        external_id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        event_date: def.date,
        event_start: `${def.date}T14:00:00Z`,
        event_end: `${def.date}T18:00:00Z`,
        center_lat: def.centerLat,
        center_lng: def.centerLng,
        bbox,
        is_active: true,
        status: 'ACTIVE',
        max_hail_estimate: def.maxHail,
        confidence_score: 0.92,
        ingestion_job_id: job.id,
        metadata: { source: 'mock_noaa_engine', job_id: job.id },
      }, userId);

      const hailGeoJSON = buildMockHailGeoJSON(def.centerLat, def.centerLng, 0.3);

      await createStormLayer(organizationId, event.id, {
        name: 'Hail Swath',
        layer_type: 'HAIL',
        format: 'GEOJSON',
        geojson: hailGeoJSON,
        min_threshold: 0.25,
        max_threshold: def.maxHail,
        is_visible: true,
        display_order: 0,
        style: {
          fillOpacity: 0.5,
          strokeWidth: 1,
          colorScale: {
            property: 'hail_size',
            stops: buildHailSeverityColorScale(),
          },
        },
      });

      importedEvents.push(event);
      eventsImported++;
    } catch {
      // continue on individual event failure
    }
  }

  await updateIngestionJobStatus(job.id, 'COMPLETED', {
    completed_at: new Date().toISOString(),
    events_found: mockEventDefs.length,
    events_imported: eventsImported,
  });

  return {
    events: importedEvents,
    eventsCreated: eventsImported,
    layersCreated: eventsImported,
    duplicatesSkipped: 0,
  };
}

export async function matchDoorsToStormEvent(
  organizationId: string,
  stormEventId: string
): Promise<number> {
  const { data: event } = await supabase
    .from('storm_events')
    .select('*, storm_layers(*)')
    .eq('organization_id', organizationId)
    .eq('id', stormEventId)
    .maybeSingle();

  if (!event || !event.bbox) return 0;

  const { data: doors } = await supabase
    .from('doors')
    .select('id, lat, lng')
    .eq('organization_id', organizationId)
    .gte('lat', event.bbox.minLat)
    .lte('lat', event.bbox.maxLat)
    .gte('lng', event.bbox.minLng)
    .lte('lng', event.bbox.maxLng);

  if (!doors || doors.length === 0) return 0;

  const hailLayer = event.storm_layers?.find(
    (l: { layer_type: string }) => l.layer_type === 'HAIL'
  );

  const matches: DoorStormMatch[] = doors.map((door) => {
    const distFromCenter = Math.sqrt(
      Math.pow(door.lat - (event.center_lat || 0), 2) +
      Math.pow(door.lng - (event.center_lng || 0), 2)
    );
    const maxRadius = Math.max(
      event.bbox.maxLat - event.bbox.minLat,
      event.bbox.maxLng - event.bbox.minLng
    ) / 2;
    const relDist = distFromCenter / maxRadius;
    const maxHail = event.max_hail_estimate || 1.0;
    const hailSize = Math.max(0.1, maxHail * (1 - relDist * 0.8));
    const severityBand = getHailSeverityBand(hailSize);

    return {
      id: '',
      door_id: door.id,
      storm_event_id: stormEventId,
      organization_id: organizationId,
      hail_size_inches: Math.round(hailSize * 100) / 100,
      severity_band: severityBand,
      confidence: Math.round((1 - relDist * 0.5) * 100) / 100,
      matched_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  });

  const toInsert = matches.map((m) => ({
    door_id: m.door_id,
    storm_event_id: m.storm_event_id,
    organization_id: m.organization_id,
    hail_size_inches: m.hail_size_inches,
    severity_band: m.severity_band,
    confidence: m.confidence,
    matched_at: m.matched_at,
  }));

  if (toInsert.length > 0) {
    await supabase
      .from('door_storm_matches')
      .upsert(toInsert, { onConflict: 'door_id,storm_event_id', ignoreDuplicates: true });
  }

  void hailLayer;
  return toInsert.length;
}
