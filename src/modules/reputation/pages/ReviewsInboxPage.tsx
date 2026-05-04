import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Loader2, AlertTriangle, X } from 'lucide-react';
import { ReviewFiltersPanel } from '../components/inbox/ReviewFilters';
import { ReviewList } from '../components/inbox/ReviewList';
import { ReviewDetailPanel } from '../components/inbox/ReviewDetailPanel';
import { listReviews, getDistinctAccounts } from '../services/reputationApi';
import { syncNow } from '../services/reputationSyncService';
import type { ReputationReview, ReviewFilters } from '../types';

interface Props {
  orgId: string;
  userId: string;
  permissions: {
    canReply: boolean;
    canDeleteReply: boolean;
    canAIDraft: boolean;
    canSync: boolean;
  };
}

export const ReviewsInboxPage: React.FC<Props> = ({ orgId, userId, permissions }) => {
  const [reviews, setReviews] = useState<ReputationReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReputationReview | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [accounts, setAccounts] = useState<Array<{ account_id: string; account_username: string | null; platform: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [failedAccounts, setFailedAccounts] = useState<Array<{ accountId: string; error: string }>>([]);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReviews = useCallback(
    async (resetCursor = true) => {
      setLoading(true);
      try {
        const result = await listReviews(orgId, filters, resetCursor ? undefined : cursor ?? undefined);
        if (resetCursor) {
          setReviews(result.data);
        } else {
          setReviews((prev) => [...prev, ...result.data]);
        }
        setHasMore(result.hasMore);
        setCursor(result.nextCursor);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, cursor]
  );

  const fetchAccounts = useCallback(async () => {
    try {
      const result = await getDistinctAccounts(orgId);
      setAccounts(result);
    } catch {
      // non-critical
    }
  }, [orgId]);

  useEffect(() => {
    fetchReviews(true);
    fetchAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, filters]);

  useEffect(() => {
    if (!permissions.canSync) return;

    const doSync = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        await syncNow(orgId);
        fetchReviews(true);
      } catch {
        // silent background sync
      }
    };

    syncIntervalRef.current = setInterval(doSync, 5 * 60 * 1000);
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [orgId, permissions.canSync, fetchReviews]);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncError(null);
    setFailedAccounts([]);
    try {
      const result = await syncNow(orgId);
      if (result.meta?.failedAccounts?.length > 0) {
        setFailedAccounts(result.meta.failedAccounts);
      }
      await fetchReviews(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      if (msg === 'LATE_NOT_CONNECTED') {
        setSyncError('Late integration is not connected. Add your API key in Settings.');
      } else if (msg === 'LATE_AUTH_ERROR') {
        setSyncError('Late API authentication failed. Please reconnect in Settings.');
      } else {
        setSyncError(msg);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleReviewUpdated = (reviewId: string, updates: Partial<ReputationReview>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...updates } : r))
    );
    if (selectedReview?.id === reviewId) {
      setSelectedReview((prev) => prev ? { ...prev, ...updates } : prev);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Reviews Inbox
          {reviews.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">({reviews.length} loaded)</span>
          )}
        </h2>
        {permissions.canSync && (
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        )}
      </div>

      {syncError && (
        <div className="mx-4 mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{syncError}</span>
          <button onClick={() => setSyncError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {failedAccounts.length > 0 && (
        <div className="mx-4 mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Some accounts failed to sync:</p>
            <ul className="mt-1 list-disc list-inside text-xs">
              {failedAccounts.map((a) => (
                <li key={a.accountId}>{a.accountId}: {a.error}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => setFailedAccounts([])}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <ReviewFiltersPanel
            filters={filters}
            accounts={accounts}
            onChange={(f) => setFilters(f)}
          />
        </aside>

        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          <ReviewList
            reviews={reviews}
            selectedId={selectedReview?.id ?? null}
            loading={loading}
            hasMore={hasMore}
            onSelect={(r) => setSelectedReview(r)}
            onLoadMore={() => fetchReviews(false)}
          />
        </div>

        <div className="flex-1 bg-paper dark:bg-canvas overflow-hidden">
          {selectedReview ? (
            <ReviewDetailPanel
              key={selectedReview.id}
              review={selectedReview}
              userId={userId}
              orgId={orgId}
              permissions={permissions}
              onReviewUpdated={handleReviewUpdated}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Select a review from the list to view details and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
