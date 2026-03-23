import {
  offlineDb,
  PendingVisit,
  PendingMedia,
  CachedDoor,
  mapTurfToCache,
  mapDoorToCache,
  generateDeviceId,
} from './db';
import { bulkSyncVisits, CreateVisitData } from '../services/visitsApi';
import { getTurfById } from '../services/turfsApi';
import { getDoorsInTurf } from '../services/doorsApi';
import { supabase } from '../../../shared/lib/supabase';
import type { CanvassOutcome } from '../types';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export async function syncPendingVisits(
  organizationId: string,
  userId: string
): Promise<SyncResult> {
  const pendingVisits = await offlineDb.pendingVisits
    .where('organizationId')
    .equals(organizationId)
    .filter((v) => v.syncStatus === 'pending' || v.syncStatus === 'error')
    .toArray();

  if (pendingVisits.length === 0) {
    return { success: true, synced: 0, failed: 0, errors: [] };
  }

  await offlineDb.pendingVisits
    .where('id')
    .anyOf(pendingVisits.map((v) => v.id!))
    .modify({ syncStatus: 'syncing' });

  const visitsToSync: CreateVisitData[] = pendingVisits.map((v) => ({
    doorId: v.doorId,
    turfId: v.turfId,
    outcome: v.outcome,
    notes: v.notes,
    tags: v.tags,
    durationSeconds: v.durationSeconds,
    occurredAt: v.occurredAt,
    deviceVisitId: v.deviceVisitId,
    deviceLat: v.deviceLat,
    deviceLng: v.deviceLng,
  }));

  try {
    const result = await bulkSyncVisits(organizationId, userId, visitsToSync);

    const errors: string[] = [];

    for (const detail of result.details) {
      const pendingVisit = pendingVisits.find(
        (v) => v.deviceVisitId === detail.device_visit_id
      );
      if (!pendingVisit) continue;

      if (detail.status === 'created' || detail.status === 'duplicate') {
        await offlineDb.pendingVisits.update(pendingVisit.id!, {
          syncStatus: 'synced',
        });
      } else {
        await offlineDb.pendingVisits.update(pendingVisit.id!, {
          syncStatus: 'error',
          syncError: detail.error,
          syncAttempts: pendingVisit.syncAttempts + 1,
        });
        errors.push(`Visit ${detail.device_visit_id}: ${detail.error}`);
      }
    }

    return {
      success: result.errors === 0,
      synced: result.created + result.duplicates,
      failed: result.errors,
      errors,
    };
  } catch (err) {
    await offlineDb.pendingVisits
      .where('id')
      .anyOf(pendingVisits.map((v) => v.id!))
      .modify((v) => {
        v.syncStatus = 'error';
        v.syncError = err instanceof Error ? err.message : 'Unknown error';
        v.syncAttempts = v.syncAttempts + 1;
      });

    return {
      success: false,
      synced: 0,
      failed: pendingVisits.length,
      errors: [err instanceof Error ? err.message : 'Unknown sync error'],
    };
  }
}

export async function cacheTurfWithDoors(
  organizationId: string,
  turfId: string
): Promise<{ doors: number }> {
  const turf = await getTurfById(organizationId, turfId);
  if (!turf) {
    throw new Error('Turf not found');
  }

  await offlineDb.cachedTurfs.put(mapTurfToCache(turf));

  const doors = await getDoorsInTurf(organizationId, turfId);

  await offlineDb.cachedDoors
    .where('[organizationId+turfId]')
    .equals([organizationId, turfId])
    .delete();

  const cachedDoors = doors.map(mapDoorToCache);
  await offlineDb.cachedDoors.bulkPut(cachedDoors);

  return { doors: doors.length };
}

export async function getCachedTurf(turfId: string): Promise<ReturnType<typeof mapTurfToCache> | undefined> {
  return offlineDb.cachedTurfs.get(turfId);
}

export async function getCachedDoorsForTurf(turfId: string): Promise<CachedDoor[]> {
  return offlineDb.cachedDoors.where('turfId').equals(turfId).toArray();
}

export async function createOfflineVisit(
  organizationId: string,
  userId: string,
  doorId: string,
  turfId: string | undefined,
  outcome: CanvassOutcome,
  notes?: string,
  tags: string[] = [],
  deviceLat?: number,
  deviceLng?: number
): Promise<PendingVisit> {
  const deviceVisitId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const visit: PendingVisit = {
    deviceVisitId,
    organizationId,
    doorId,
    turfId,
    userId,
    outcome,
    notes,
    tags,
    occurredAt: new Date().toISOString(),
    deviceLat,
    deviceLng,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
    syncAttempts: 0,
  };

  const id = await offlineDb.pendingVisits.add(visit);

  await offlineDb.cachedDoors.update(doorId, {
    lastOutcome: outcome,
    localVisitCount: (await offlineDb.cachedDoors.get(doorId))?.localVisitCount || 0 + 1,
  });

  return { ...visit, id };
}

export async function getPendingVisitsCount(organizationId: string): Promise<number> {
  return offlineDb.pendingVisits
    .where('organizationId')
    .equals(organizationId)
    .filter((v) => v.syncStatus === 'pending' || v.syncStatus === 'error')
    .count();
}

export async function clearSyncedVisits(organizationId: string): Promise<number> {
  const syncedIds = await offlineDb.pendingVisits
    .where('organizationId')
    .equals(organizationId)
    .filter((v) => v.syncStatus === 'synced')
    .primaryKeys();

  await offlineDb.pendingVisits.bulkDelete(syncedIds as number[]);
  return syncedIds.length;
}

export async function retryFailedVisits(organizationId: string): Promise<number> {
  const failedVisits = await offlineDb.pendingVisits
    .where('organizationId')
    .equals(organizationId)
    .filter((v) => v.syncStatus === 'error' && v.syncAttempts < 3)
    .toArray();

  await offlineDb.pendingVisits
    .where('id')
    .anyOf(failedVisits.map((v) => v.id!))
    .modify({ syncStatus: 'pending' });

  return failedVisits.length;
}

export async function queueMediaCapture(
  organizationId: string,
  userId: string,
  file: File,
  doorId?: string,
  visitDeviceId?: string,
  caption?: string
): Promise<PendingMedia> {
  const deviceMediaId = generateDeviceId();

  const media: PendingMedia = {
    deviceMediaId,
    organizationId,
    doorId,
    visitDeviceId,
    userId,
    mediaType: 'PHOTO',
    fileName: file.name,
    mimeType: file.type,
    blob: file,
    caption,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
  };

  const id = await offlineDb.pendingMedia.add(media);
  return { ...media, id };
}

export async function getPendingMediaCount(organizationId: string): Promise<number> {
  return offlineDb.pendingMedia
    .where('organizationId')
    .equals(organizationId)
    .filter((m) => m.syncStatus === 'pending' || m.syncStatus === 'error')
    .count();
}

export interface MediaSyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

export async function syncPendingMedia(
  organizationId: string,
  userId: string
): Promise<MediaSyncResult> {
  const pendingItems = await offlineDb.pendingMedia
    .where('organizationId')
    .equals(organizationId)
    .filter((m) => m.syncStatus === 'pending' || m.syncStatus === 'error')
    .toArray();

  if (pendingItems.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  await offlineDb.pendingMedia
    .where('id')
    .anyOf(pendingItems.map((m) => m.id!))
    .modify({ syncStatus: 'syncing' });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const media of pendingItems) {
    try {
      const ext = media.fileName?.split('.').pop() || 'jpg';
      const storagePath = `canvass-media/${organizationId}/${media.doorId || 'no-door'}/${media.deviceMediaId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('canvass-media')
        .upload(storagePath, media.blob, {
          contentType: media.mimeType || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('canvass-media')
        .getPublicUrl(storagePath);

      await supabase.from('canvass_media').insert({
        organization_id: organizationId,
        door_id: media.doorId,
        user_id: userId,
        device_media_id: media.deviceMediaId,
        media_type: media.mediaType,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        file_name: media.fileName,
        mime_type: media.mimeType,
        caption: media.caption,
        created_at: media.createdAt,
      });

      await offlineDb.pendingMedia.update(media.id!, { syncStatus: 'synced' });
      synced++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      await offlineDb.pendingMedia.update(media.id!, { syncStatus: 'error', syncError: msg });
      failed++;
      errors.push(`${media.fileName || media.deviceMediaId}: ${msg}`);
    }
  }

  return { synced, failed, errors };
}
