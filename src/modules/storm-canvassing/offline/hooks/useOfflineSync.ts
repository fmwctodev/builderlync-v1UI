import { useState, useEffect, useCallback, useRef } from 'react';
import { useOfflineStatus } from './useOfflineStatus';
import {
  syncPendingVisits,
  syncPendingMedia,
  getPendingVisitsCount,
  getPendingMediaCount,
  clearSyncedVisits,
  SyncResult,
} from '../syncService';
import { getCacheStats } from '../db';

export interface OfflineSyncState {
  isSyncing: boolean;
  pendingCount: number;
  pendingMediaCount: number;
  lastSyncResult: SyncResult | null;
  lastSyncTime: Date | null;
  cacheStats: {
    turfs: number;
    doors: number;
    pendingVisits: number;
    pendingMedia: number;
  } | null;
}

export function useOfflineSync(
  organizationId: string | null,
  userId: string | null,
  autoSyncOnReconnect: boolean = true
) {
  const { isOnline, isActuallyOnline } = useOfflineStatus();
  const [state, setState] = useState<OfflineSyncState>({
    isSyncing: false,
    pendingCount: 0,
    pendingMediaCount: 0,
    lastSyncResult: null,
    lastSyncTime: null,
    cacheStats: null,
  });

  const syncInProgressRef = useRef(false);
  const previousOnlineRef = useRef(isActuallyOnline);

  const refreshPendingCount = useCallback(async () => {
    if (!organizationId) return;

    try {
      const [count, mediaCount, cacheStats] = await Promise.all([
        getPendingVisitsCount(organizationId),
        getPendingMediaCount(organizationId),
        getCacheStats(organizationId),
      ]);

      setState((prev) => ({
        ...prev,
        pendingCount: count,
        pendingMediaCount: mediaCount,
        cacheStats,
      }));
    } catch (err) {
      console.error('Error refreshing pending count:', err);
    }
  }, [organizationId]);

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (!organizationId || !userId || syncInProgressRef.current) {
      return null;
    }

    if (!isActuallyOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      };
    }

    syncInProgressRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const result = await syncPendingVisits(organizationId, userId);

      if (result.success) {
        await clearSyncedVisits(organizationId);
      }

      await syncPendingMedia(organizationId, userId);

      const [pendingCount, pendingMediaCount, cacheStats] = await Promise.all([
        getPendingVisitsCount(organizationId),
        getPendingMediaCount(organizationId),
        getCacheStats(organizationId),
      ]);

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        pendingCount,
        pendingMediaCount,
        lastSyncResult: result,
        lastSyncTime: new Date(),
        cacheStats,
      }));

      return result;
    } catch (err) {
      const errorResult: SyncResult = {
        success: false,
        synced: 0,
        failed: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error'],
      };

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncResult: errorResult,
        lastSyncTime: new Date(),
      }));

      return errorResult;
    } finally {
      syncInProgressRef.current = false;
    }
  }, [organizationId, userId, isActuallyOnline]);

  useEffect(() => {
    if (
      autoSyncOnReconnect &&
      isActuallyOnline &&
      !previousOnlineRef.current &&
      organizationId &&
      userId
    ) {
      sync();
    }

    previousOnlineRef.current = isActuallyOnline;
  }, [isActuallyOnline, autoSyncOnReconnect, organizationId, userId, sync]);

  useEffect(() => {
    refreshPendingCount();

    const intervalId = setInterval(refreshPendingCount, 10000);

    return () => clearInterval(intervalId);
  }, [refreshPendingCount]);

  return {
    ...state,
    isOnline,
    isActuallyOnline,
    sync,
    refreshPendingCount,
  };
}
