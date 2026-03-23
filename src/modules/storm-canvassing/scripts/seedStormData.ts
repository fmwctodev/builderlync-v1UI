import { supabase } from '../../../shared/lib/supabase';

interface SeedConfig {
  organizationId: string;
  userId: string;
}

const SAMPLE_STORM_EVENTS = [
  {
    name: 'Denver Metro Hailstorm — May 2024',
    event_date: '2024-05-15',
    center_lat: 39.7392,
    center_lng: -104.9903,
    metadata: {
      storm_type: 'HAIL',
      severity: 'SEVERE',
      region: 'Denver Metro, CO',
      radius_miles: 15,
      estimated_homes: 45000,
      max_hail_size: 2.5,
    },
  },
  {
    name: 'Dallas-Fort Worth Supercell — April 2024',
    event_date: '2024-04-22',
    center_lat: 32.7767,
    center_lng: -96.7970,
    metadata: {
      storm_type: 'HAIL',
      severity: 'EXTREME',
      region: 'Dallas-Fort Worth, TX',
      radius_miles: 20,
      estimated_homes: 85000,
      max_hail_size: 3.0,
    },
  },
  {
    name: 'Oklahoma City Storm System — March 2024',
    event_date: '2024-03-10',
    center_lat: 35.4676,
    center_lng: -97.5164,
    metadata: {
      storm_type: 'HAIL',
      severity: 'MODERATE',
      region: 'Oklahoma City, OK',
      radius_miles: 12,
      estimated_homes: 32000,
      max_hail_size: 1.75,
    },
  },
];

const SAMPLE_TURFS = [
  {
    name: 'Highland Park North',
    description: 'Residential area with older roofs, high potential',
    status: 'IN_PROGRESS',
    color: '#3B82F6',
    bounds: { minLng: -104.9800, maxLng: -104.9700, minLat: 39.7400, maxLat: 39.7500 },
    city: 'Denver', state: 'CO', zip: '80203',
  },
  {
    name: 'Lakewood West',
    description: 'Mix of single family and townhomes',
    status: 'NOT_STARTED',
    color: '#10B981',
    bounds: { minLng: -105.1000, maxLng: -105.0900, minLat: 39.7200, maxLat: 39.7300 },
    city: 'Lakewood', state: 'CO', zip: '80226',
  },
  {
    name: 'Aurora Central',
    description: 'Dense residential, good foot traffic areas',
    status: 'NOT_STARTED',
    color: '#F59E0B',
    bounds: { minLng: -104.8500, maxLng: -104.8400, minLat: 39.7000, maxLat: 39.7100 },
    city: 'Aurora', state: 'CO', zip: '80010',
  },
];

const STREET_NAMES = [
  'Oak St', 'Maple Ave', 'Pine Dr', 'Cedar Ln', 'Elm Blvd',
  'Willow Way', 'Birch Ct', 'Ash Rd', 'Sycamore Pl', 'Walnut St',
  'Chestnut Ave', 'Poplar Dr', 'Spruce Ln', 'Aspen Blvd', 'Cottonwood Ct',
];

const OUTCOMES: string[] = [
  'NO_ANSWER', 'NO_ANSWER', 'NO_ANSWER',
  'INTERESTED', 'INTERESTED',
  'NOT_INTERESTED',
  'FOLLOW_UP',
  'NOT_HOME',
  'APPOINTMENT_SET',
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateDoorsForTurf(
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  count: number,
  city: string,
  state: string,
  zip: string
): Array<{ lat: number; lng: number; address1: string; city: string; state: string; zip: string }> {
  const doors = [];
  for (let i = 0; i < count; i++) {
    const lat = randomBetween(bounds.minLat, bounds.maxLat);
    const lng = randomBetween(bounds.minLng, bounds.maxLng);
    const num = 100 + Math.floor(Math.random() * 9900);
    const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
    doors.push({ lat, lng, address1: `${num} ${street}`, city, state, zip });
  }
  return doors;
}

function buildTurfGeometry(
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number }
): string {
  const { minLng, maxLng, minLat, maxLat } = bounds;
  return `MULTIPOLYGON(((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat})))`;
}

export async function seedStormCanvassingData(config: SeedConfig): Promise<{
  success: boolean;
  stormEventIds: string[];
  turfIds: string[];
  doorCount: number;
  error?: string;
}> {
  const { organizationId, userId } = config;
  const stormEventIds: string[] = [];
  const turfIds: string[] = [];
  let doorCount = 0;

  try {
    for (const event of SAMPLE_STORM_EVENTS) {
      const { data: stormEvent, error: stormError } = await supabase
        .from('storm_events')
        .insert({
          organization_id: organizationId,
          created_by: userId,
          provider: 'MOCK',
          name: event.name,
          event_date: event.event_date,
          center_lat: event.center_lat,
          center_lng: event.center_lng,
          metadata: event.metadata,
          is_active: true,
        })
        .select('id')
        .single();

      if (stormError) {
        console.error('Error creating storm event:', stormError);
        continue;
      }

      stormEventIds.push(stormEvent.id);

      const hailSize = event.metadata.max_hail_size as number;
      const severity = event.metadata.severity as string;
      const cx = event.center_lng;
      const cy = event.center_lat;

      await supabase.from('storm_layers').insert({
        organization_id: organizationId,
        storm_event_id: stormEvent.id,
        layer_type: 'HAIL',
        name: `${event.name} — Hail Swath`,
        format: 'GEOJSON',
        min_threshold: hailSize * 0.5,
        max_threshold: hailSize,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { hail_size: hailSize, severity },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [cx - 0.15, cy + 0.12],
                  [cx + 0.12, cy + 0.15],
                  [cx + 0.18, cy],
                  [cx + 0.12, cy - 0.15],
                  [cx - 0.12, cy - 0.15],
                  [cx - 0.18, cy],
                  [cx - 0.15, cy + 0.12],
                ]],
              },
            },
          ],
        },
        style: {
          fillColor:
            severity === 'EXTREME' ? '#dc2626' :
            severity === 'SEVERE' ? '#f97316' :
            '#eab308',
          fillOpacity: 0.35,
          strokeColor: '#00000040',
          strokeWidth: 1,
        },
      });
    }

    if (stormEventIds.length === 0) {
      return { success: false, stormEventIds, turfIds, doorCount, error: 'No storm events created' };
    }

    for (const turf of SAMPLE_TURFS) {
      const geometryWkt = buildTurfGeometry(turf.bounds);

      const { data: createdTurf, error: turfError } = await supabase
        .from('turfs')
        .insert({
          organization_id: organizationId,
          storm_event_id: stormEventIds[0],
          created_by: userId,
          name: turf.name,
          description: turf.description,
          status: turf.status,
          color: turf.color,
          geometry: geometryWkt,
          bbox: {
            minLng: turf.bounds.minLng,
            minLat: turf.bounds.minLat,
            maxLng: turf.bounds.maxLng,
            maxLat: turf.bounds.maxLat,
          },
        })
        .select('id')
        .single();

      if (turfError) {
        console.error('Error creating turf:', turfError);
        continue;
      }

      turfIds.push(createdTurf.id);

      const doors = generateDoorsForTurf(turf.bounds, 65, turf.city, turf.state, turf.zip);

      const doorBatch = doors.map((door) => ({
        organization_id: organizationId,
        turf_id: createdTurf.id,
        address1: door.address1,
        city: door.city,
        state: door.state,
        zip: door.zip,
        location: `POINT(${door.lng} ${door.lat})`,
        normalized_address: `${door.address1}, ${door.city}, ${door.state} ${door.zip}`,
        property_type: 'RESIDENTIAL',
      }));

      const { data: insertedDoors, error: doorsError } = await supabase
        .from('doors')
        .insert(doorBatch)
        .select('id');

      if (doorsError) {
        console.error('Error inserting doors batch:', doorsError);
        continue;
      }

      doorCount += insertedDoors?.length || 0;

      const visitedDoorIds = (insertedDoors || [])
        .slice(0, Math.floor((insertedDoors?.length || 0) * 0.35));

      for (const visitedDoor of visitedDoorIds) {
        const outcome = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)];
        await supabase.from('canvass_visits').insert({
          organization_id: organizationId,
          door_id: visitedDoor.id,
          turf_id: createdTurf.id,
          user_id: userId,
          outcome,
          occurred_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          device_visit_id: `seed-${visitedDoor.id}-${Date.now()}`,
          is_offline_synced: true,
        });
      }

      await supabase
        .from('turfs')
        .update({ visited_doors: visitedDoorIds.length, total_doors: doorCount })
        .eq('id', createdTurf.id);
    }

    return { success: true, stormEventIds, turfIds, doorCount };
  } catch (error) {
    return {
      success: false,
      stormEventIds,
      turfIds,
      doorCount,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function clearStormCanvassingData(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('canvass_visits').delete().eq('organization_id', organizationId);
    await supabase.from('canvass_media').delete().eq('organization_id', organizationId);
    await supabase.from('canvass_leads').delete().eq('organization_id', organizationId);
    await supabase.from('contact_reveals').delete().eq('organization_id', organizationId);
    await supabase.from('doors').delete().eq('organization_id', organizationId);
    await supabase.from('turf_assignments').delete().eq('organization_id', organizationId);
    await supabase.from('turfs').delete().eq('organization_id', organizationId);

    const { data: events } = await supabase
      .from('storm_events')
      .select('id')
      .eq('organization_id', organizationId);

    if (events && events.length > 0) {
      await supabase
        .from('storm_layers')
        .delete()
        .in('storm_event_id', events.map((e) => e.id));
    }

    await supabase.from('storm_events').delete().eq('organization_id', organizationId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
