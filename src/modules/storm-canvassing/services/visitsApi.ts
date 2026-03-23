import { supabase } from '../../../shared/lib/supabase';
import type { CanvassVisit, CanvassOutcome, BulkSyncResult } from '../types';

export interface VisitFilters {
  doorId?: string;
  turfId?: string;
  userId?: string;
  outcome?: CanvassOutcome;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateVisitData {
  doorId: string;
  turfId?: string;
  outcome: CanvassOutcome;
  notes?: string;
  tags?: string[];
  durationSeconds?: number;
  occurredAt?: string;
  deviceVisitId?: string;
  deviceLat?: number;
  deviceLng?: number;
}

export async function getVisits(
  organizationId: string,
  filters?: VisitFilters,
  limit: number = 100,
  offset: number = 0
): Promise<{ visits: CanvassVisit[]; total: number }> {
  let query = supabase
    .from('canvass_visits')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('occurred_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.doorId) {
    query = query.eq('door_id', filters.doorId);
  }

  if (filters?.turfId) {
    query = query.eq('turf_id', filters.turfId);
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters?.outcome) {
    query = query.eq('outcome', filters.outcome);
  }

  if (filters?.dateFrom) {
    query = query.gte('occurred_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('occurred_at', filters.dateTo);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch visits: ${error.message}`);
  }

  return {
    visits: data || [],
    total: count || 0,
  };
}

export async function getVisitsByDoor(
  organizationId: string,
  doorId: string
): Promise<CanvassVisit[]> {
  const { data, error } = await supabase
    .from('canvass_visits')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('door_id', doorId)
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch door visits: ${error.message}`);
  }

  return data || [];
}

export async function createVisit(
  organizationId: string,
  userId: string,
  visitData: CreateVisitData
): Promise<CanvassVisit> {
  const { data, error } = await supabase
    .from('canvass_visits')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      door_id: visitData.doorId,
      turf_id: visitData.turfId,
      outcome: visitData.outcome,
      notes: visitData.notes,
      tags: visitData.tags || [],
      duration_seconds: visitData.durationSeconds,
      occurred_at: visitData.occurredAt || new Date().toISOString(),
      device_visit_id: visitData.deviceVisitId,
      device_lat: visitData.deviceLat,
      device_lng: visitData.deviceLng,
      is_offline_synced: !visitData.deviceVisitId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create visit: ${error.message}`);
  }

  return data;
}

export async function bulkSyncVisits(
  organizationId: string,
  userId: string,
  visits: CreateVisitData[]
): Promise<BulkSyncResult> {
  const result: BulkSyncResult = {
    created: 0,
    duplicates: 0,
    errors: 0,
    details: [],
  };

  for (const visit of visits) {
    if (!visit.deviceVisitId) {
      result.errors++;
      result.details.push({
        device_visit_id: 'unknown',
        status: 'error',
        error: 'Missing device_visit_id',
      });
      continue;
    }

    try {
      const { data: existing } = await supabase
        .from('canvass_visits')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('device_visit_id', visit.deviceVisitId)
        .maybeSingle();

      if (existing) {
        result.duplicates++;
        result.details.push({
          device_visit_id: visit.deviceVisitId,
          status: 'duplicate',
          id: existing.id,
        });
        continue;
      }

      const created = await createVisit(organizationId, userId, {
        ...visit,
        occurredAt: visit.occurredAt || new Date().toISOString(),
      });

      result.created++;
      result.details.push({
        device_visit_id: visit.deviceVisitId,
        status: 'created',
        id: created.id,
      });
    } catch (err) {
      result.errors++;
      result.details.push({
        device_visit_id: visit.deviceVisitId,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return result;
}

export async function updateVisit(
  organizationId: string,
  visitId: string,
  userId: string,
  updates: Partial<Pick<CanvassVisit, 'outcome' | 'notes' | 'tags'>>
): Promise<CanvassVisit> {
  const { data, error } = await supabase
    .from('canvass_visits')
    .update({
      outcome: updates.outcome,
      notes: updates.notes,
      tags: updates.tags,
    })
    .eq('organization_id', organizationId)
    .eq('id', visitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update visit: ${error.message}`);
  }

  return data;
}

export async function deleteVisit(
  organizationId: string,
  visitId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('canvass_visits')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', visitId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete visit: ${error.message}`);
  }
}

export async function getVisitStats(
  organizationId: string,
  filters?: {
    turfId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<{
  total: number;
  byOutcome: Record<CanvassOutcome, number>;
  byUser: Array<{ userId: string; count: number }>;
  byDate: Array<{ date: string; count: number }>;
}> {
  let query = supabase
    .from('canvass_visits')
    .select('outcome, user_id, occurred_at')
    .eq('organization_id', organizationId);

  if (filters?.turfId) {
    query = query.eq('turf_id', filters.turfId);
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters?.dateFrom) {
    query = query.gte('occurred_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('occurred_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch visit stats: ${error.message}`);
  }

  const visits = data || [];
  const byOutcome: Record<string, number> = {};
  const byUserMap: Record<string, number> = {};
  const byDateMap: Record<string, number> = {};

  for (const visit of visits) {
    byOutcome[visit.outcome] = (byOutcome[visit.outcome] || 0) + 1;
    byUserMap[visit.user_id] = (byUserMap[visit.user_id] || 0) + 1;

    const dateKey = visit.occurred_at.split('T')[0];
    byDateMap[dateKey] = (byDateMap[dateKey] || 0) + 1;
  }

  return {
    total: visits.length,
    byOutcome: byOutcome as Record<CanvassOutcome, number>,
    byUser: Object.entries(byUserMap).map(([userId, count]) => ({
      userId,
      count,
    })),
    byDate: Object.entries(byDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export async function getTodayVisitsForUser(
  organizationId: string,
  userId: string
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('canvass_visits')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .gte('occurred_at', today.toISOString());

  if (error) {
    throw new Error(`Failed to fetch today's visits: ${error.message}`);
  }

  return count || 0;
}
