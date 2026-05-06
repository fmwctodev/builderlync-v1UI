import { supabase } from '../../../shared/lib/supabase';
import type { Door, CanvassOutcome } from '../types';
import { isStagingMode } from '../../../shared/utils/stagingAuth';
import { getStagingStormDoors } from '../../../shared/utils/stagingMocks';

export interface DoorFilters {
  turfId?: string;
  search?: string;
  lastOutcome?: CanvassOutcome;
  isDoNotKnock?: boolean;
  hasBeenVisited?: boolean;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export async function getDoors(
  organizationId: string,
  filters?: DoorFilters,
  limit: number = 500,
  offset: number = 0
): Promise<{ doors: Door[]; total: number }> {
  // Staging short-circuit
  if (isStagingMode()) {
    let mocks = getStagingStormDoors(organizationId, filters?.turfId) as unknown as Door[];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      mocks = mocks.filter(
        (d) =>
          d.address1.toLowerCase().includes(q) ||
          (d.city && d.city.toLowerCase().includes(q)),
      );
    }
    if (filters?.lastOutcome) {
      mocks = mocks.filter((d) => d.last_outcome === filters.lastOutcome);
    }
    if (filters?.hasBeenVisited === true) mocks = mocks.filter((d) => d.visit_count > 0);
    else if (filters?.hasBeenVisited === false) mocks = mocks.filter((d) => d.visit_count === 0);
    const sliced = mocks.slice(offset, offset + limit);
    return { doors: sliced, total: mocks.length };
  }

  let query = supabase
    .from('doors')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.turfId) {
    query = query.eq('turf_id', filters.turfId);
  }

  if (filters?.search) {
    query = query.or(
      `address1.ilike.%${filters.search}%,city.ilike.%${filters.search}%,normalized_address.ilike.%${filters.search}%`
    );
  }

  if (filters?.lastOutcome) {
    query = query.eq('last_outcome', filters.lastOutcome);
  }

  if (filters?.isDoNotKnock !== undefined) {
    query = query.eq('is_do_not_knock', filters.isDoNotKnock);
  }

  if (filters?.hasBeenVisited === true) {
    query = query.gt('visit_count', 0);
  } else if (filters?.hasBeenVisited === false) {
    query = query.eq('visit_count', 0);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch doors: ${error.message}`);
  }

  return {
    doors: data || [],
    total: count || 0,
  };
}

export async function getDoorsByBbox(
  organizationId: string,
  bbox: BoundingBox,
  limit: number = 1000
): Promise<Door[]> {
  // Staging short-circuit — return all mock doors that fall inside the bbox.
  if (isStagingMode()) {
    const all = getStagingStormDoors(organizationId) as unknown as Door[];
    return all
      .filter(
        (d) =>
          d.lng >= bbox.minLng &&
          d.lng <= bbox.maxLng &&
          d.lat >= bbox.minLat &&
          d.lat <= bbox.maxLat,
      )
      .slice(0, limit);
  }

  const { data, error } = await supabase.rpc('get_doors_in_bbox', {
    p_org_id: organizationId,
    p_min_lng: bbox.minLng,
    p_min_lat: bbox.minLat,
    p_max_lng: bbox.maxLng,
    p_max_lat: bbox.maxLat,
  });

  if (error) {
    throw new Error(`Failed to fetch doors by bbox: ${error.message}`);
  }

  return (data || []).slice(0, limit);
}

export async function getDoorsInTurf(
  organizationId: string,
  turfId: string
): Promise<Door[]> {
  // Staging short-circuit
  if (isStagingMode()) {
    return getStagingStormDoors(organizationId, turfId) as unknown as Door[];
  }

  const { data, error } = await supabase.rpc('get_doors_in_turf', {
    p_turf_id: turfId,
  });

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('doors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('turf_id', turfId);

    if (fallbackError) {
      throw new Error(`Failed to fetch doors in turf: ${fallbackError.message}`);
    }

    return fallbackData || [];
  }

  return data || [];
}

export async function getDoorById(
  organizationId: string,
  doorId: string
): Promise<Door | null> {
  const { data, error } = await supabase
    .from('doors')
    .select(`
      *,
      canvass_visits(
        id,
        outcome,
        notes,
        tags,
        occurred_at,
        user_id
      )
    `)
    .eq('organization_id', organizationId)
    .eq('id', doorId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch door: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    visits: data.canvass_visits || [],
  };
}

export async function createDoor(
  organizationId: string,
  doorData: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    lat: number;
    lng: number;
    turfId?: string;
    parcelId?: string;
    propertyType?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<Door> {
  const normalizedAddress = `${doorData.address1} ${doorData.city} ${doorData.state} ${doorData.zip}`.toLowerCase();

  const { data, error } = await supabase
    .from('doors')
    .insert({
      organization_id: organizationId,
      address1: doorData.address1,
      address2: doorData.address2,
      city: doorData.city,
      state: doorData.state,
      zip: doorData.zip,
      country: doorData.country || 'US',
      location: `POINT(${doorData.lng} ${doorData.lat})`,
      turf_id: doorData.turfId,
      parcel_id: doorData.parcelId,
      property_type: doorData.propertyType,
      metadata: doorData.metadata || {},
      normalized_address: normalizedAddress,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create door: ${error.message}`);
  }

  return data;
}

export async function bulkCreateDoors(
  organizationId: string,
  doors: Array<{
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    turfId?: string;
  }>
): Promise<{ created: number; errors: number }> {
  const doorsToInsert = doors.map((d) => ({
    organization_id: organizationId,
    address1: d.address1,
    address2: d.address2,
    city: d.city,
    state: d.state,
    zip: d.zip,
    country: 'US',
    location: `POINT(${d.lng} ${d.lat})`,
    turf_id: d.turfId,
    normalized_address: `${d.address1} ${d.city} ${d.state} ${d.zip}`.toLowerCase(),
  }));

  const { data, error } = await supabase
    .from('doors')
    .insert(doorsToInsert)
    .select('id');

  if (error) {
    console.error('Bulk door creation error:', error);
    return { created: 0, errors: doors.length };
  }

  return { created: data?.length || 0, errors: 0 };
}

export async function updateDoor(
  organizationId: string,
  doorId: string,
  updates: Partial<Pick<Door, 'address1' | 'address2' | 'city' | 'state' | 'zip' | 'is_do_not_knock' | 'metadata'>>
): Promise<Door> {
  const updateData: Record<string, unknown> = {};

  if (updates.address1 !== undefined) updateData.address1 = updates.address1;
  if (updates.address2 !== undefined) updateData.address2 = updates.address2;
  if (updates.city !== undefined) updateData.city = updates.city;
  if (updates.state !== undefined) updateData.state = updates.state;
  if (updates.zip !== undefined) updateData.zip = updates.zip;
  if (updates.is_do_not_knock !== undefined) updateData.is_do_not_knock = updates.is_do_not_knock;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

  if (updates.address1 || updates.city || updates.state || updates.zip) {
    const { data: current } = await supabase
      .from('doors')
      .select('address1, city, state, zip')
      .eq('id', doorId)
      .single();

    if (current) {
      const addr = updates.address1 || current.address1;
      const city = updates.city || current.city;
      const state = updates.state || current.state;
      const zip = updates.zip || current.zip;
      updateData.normalized_address = `${addr} ${city} ${state} ${zip}`.toLowerCase();
    }
  }

  const { data, error } = await supabase
    .from('doors')
    .update(updateData)
    .eq('organization_id', organizationId)
    .eq('id', doorId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update door: ${error.message}`);
  }

  return data;
}

export async function deleteDoor(
  organizationId: string,
  doorId: string
): Promise<void> {
  const { error } = await supabase
    .from('doors')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', doorId);

  if (error) {
    throw new Error(`Failed to delete door: ${error.message}`);
  }
}

export async function findNearestUnvisitedDoor(
  organizationId: string,
  turfId: string,
  currentLat: number,
  currentLng: number
): Promise<Door | null> {
  const { data, error } = await supabase
    .from('doors')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('turf_id', turfId)
    .eq('visit_count', 0)
    .eq('is_do_not_knock', false);

  if (error) {
    throw new Error(`Failed to find nearest door: ${error.message}`);
  }

  if (!data || data.length === 0) return null;

  let nearestDoor: Door | null = null;
  let minDistance = Infinity;

  for (const door of data) {
    const distance = Math.sqrt(
      Math.pow(door.lat - currentLat, 2) + Math.pow(door.lng - currentLng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestDoor = door;
    }
  }

  return nearestDoor;
}

export async function getDoorStats(
  organizationId: string,
  turfId?: string
): Promise<{
  total: number;
  visited: number;
  unvisited: number;
  doNotKnock: number;
  byOutcome: Record<string, number>;
}> {
  let query = supabase
    .from('doors')
    .select('visit_count, last_outcome, is_do_not_knock')
    .eq('organization_id', organizationId);

  if (turfId) {
    query = query.eq('turf_id', turfId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch door stats: ${error.message}`);
  }

  const doors = data || [];
  const byOutcome: Record<string, number> = {};

  let visited = 0;
  let doNotKnock = 0;

  for (const door of doors) {
    if (door.visit_count > 0) visited++;
    if (door.is_do_not_knock) doNotKnock++;
    if (door.last_outcome) {
      byOutcome[door.last_outcome] = (byOutcome[door.last_outcome] || 0) + 1;
    }
  }

  return {
    total: doors.length,
    visited,
    unvisited: doors.length - visited,
    doNotKnock,
    byOutcome,
  };
}
