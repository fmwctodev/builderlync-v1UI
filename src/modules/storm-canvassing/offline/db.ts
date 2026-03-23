import Dexie, { Table } from 'dexie';
import type { CanvassOutcome, Turf, Door } from '../types';

export interface PendingVisit {
  id?: number;
  deviceVisitId: string;
  organizationId: string;
  doorId: string;
  turfId?: string;
  userId: string;
  outcome: CanvassOutcome;
  notes?: string;
  tags: string[];
  durationSeconds?: number;
  occurredAt: string;
  deviceLat?: number;
  deviceLng?: number;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncError?: string;
  syncAttempts: number;
}

export interface CachedTurf {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  geometry: GeoJSON.MultiPolygon;
  status: string;
  totalDoors: number;
  visitedDoors: number;
  color: string;
  cachedAt: string;
}

export interface CachedDoor {
  id: string;
  organizationId: string;
  turfId?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  lastOutcome?: CanvassOutcome;
  visitCount: number;
  isDoNotKnock: boolean;
  cachedAt: string;
  localVisitCount?: number;
}

export interface PendingMedia {
  id?: number;
  deviceMediaId: string;
  organizationId: string;
  doorId?: string;
  visitDeviceId?: string;
  userId: string;
  mediaType: 'PHOTO' | 'VIDEO';
  fileName?: string;
  mimeType?: string;
  blob: Blob;
  caption?: string;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncError?: string;
}

export interface SyncQueueItem {
  id?: number;
  type: 'visit' | 'media';
  relatedId: string;
  priority: number;
  createdAt: string;
  lastAttempt?: string;
  attempts: number;
}

export class CanvassingOfflineDB extends Dexie {
  pendingVisits!: Table<PendingVisit>;
  cachedTurfs!: Table<CachedTurf>;
  cachedDoors!: Table<CachedDoor>;
  pendingMedia!: Table<PendingMedia>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('CanvassingOfflineDB');

    this.version(1).stores({
      pendingVisits: '++id, deviceVisitId, organizationId, doorId, turfId, userId, syncStatus',
      cachedTurfs: 'id, organizationId',
      cachedDoors: 'id, organizationId, turfId, [organizationId+turfId]',
      pendingMedia: '++id, deviceMediaId, organizationId, doorId, visitDeviceId, syncStatus',
      syncQueue: '++id, type, relatedId, priority',
    });
  }
}

export const offlineDb = new CanvassingOfflineDB();

export function generateDeviceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function clearOrganizationCache(organizationId: string): Promise<void> {
  await offlineDb.cachedTurfs.where('organizationId').equals(organizationId).delete();
  await offlineDb.cachedDoors.where('organizationId').equals(organizationId).delete();
}

export async function clearAllCache(): Promise<void> {
  await offlineDb.cachedTurfs.clear();
  await offlineDb.cachedDoors.clear();
}

export async function getCacheStats(organizationId: string): Promise<{
  turfs: number;
  doors: number;
  pendingVisits: number;
  pendingMedia: number;
}> {
  const [turfs, doors, pendingVisits, pendingMedia] = await Promise.all([
    offlineDb.cachedTurfs.where('organizationId').equals(organizationId).count(),
    offlineDb.cachedDoors.where('organizationId').equals(organizationId).count(),
    offlineDb.pendingVisits
      .where('organizationId')
      .equals(organizationId)
      .filter((v) => v.syncStatus === 'pending' || v.syncStatus === 'error')
      .count(),
    offlineDb.pendingMedia
      .where('organizationId')
      .equals(organizationId)
      .filter((m) => m.syncStatus === 'pending' || m.syncStatus === 'error')
      .count(),
  ]);

  return { turfs, doors, pendingVisits, pendingMedia };
}

export function mapTurfToCache(turf: Turf): CachedTurf {
  return {
    id: turf.id,
    organizationId: turf.organization_id,
    name: turf.name,
    description: turf.description,
    geometry: turf.geometry,
    status: turf.status,
    totalDoors: turf.total_doors,
    visitedDoors: turf.visited_doors,
    color: turf.color,
    cachedAt: new Date().toISOString(),
  };
}

export function mapDoorToCache(door: Door): CachedDoor {
  return {
    id: door.id,
    organizationId: door.organization_id,
    turfId: door.turf_id,
    address1: door.address1,
    address2: door.address2,
    city: door.city,
    state: door.state,
    zip: door.zip,
    lat: door.lat,
    lng: door.lng,
    lastOutcome: door.last_outcome,
    visitCount: door.visit_count,
    isDoNotKnock: door.is_do_not_knock,
    cachedAt: new Date().toISOString(),
  };
}
