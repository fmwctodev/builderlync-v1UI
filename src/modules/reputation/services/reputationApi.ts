import { supabase } from '../../../shared/lib/supabase';
import type {
  ReputationReview,
  ReputationAIDraft,
  ReviewFilters,
  ReviewListResult,
  DashboardStats,
} from '../types';

const PAGE_SIZE = 25;

export async function listReviews(
  orgId: string,
  filters: ReviewFilters = {},
  cursor?: string
): Promise<ReviewListResult> {
  let query = supabase
    .from('reputation_reviews')
    .select(`
      *,
      replies:reputation_review_replies(*)
    `, { count: 'exact' })
    .eq('org_id', orgId);

  if (filters.platform && filters.platform !== 'all') {
    query = query.eq('platform', filters.platform);
  }

  if (filters.minRating !== undefined) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters.maxRating !== undefined) {
    query = query.lte('rating', filters.maxRating);
  }

  if (filters.hasReply === true) {
    query = query.eq('has_reply', true);
  } else if (filters.hasReply === false) {
    query = query.eq('has_reply', false);
  }

  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }

  if (filters.search) {
    query = query.or(
      `reviewer_name.ilike.%${filters.search}%,review_text.ilike.%${filters.search}%`
    );
  }

  const sortColumn = filters.sortBy === 'rating' ? 'rating' : 'review_created_at';
  const ascending = filters.sortOrder === 'asc';
  query = query.order(sortColumn, { ascending });

  if (cursor) {
    query = query.lt('review_created_at', cursor);
  }

  query = query.limit(PAGE_SIZE + 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  const rows = (data ?? []) as ReputationReview[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? items[items.length - 1].review_created_at : null;

  return {
    data: items,
    total: count ?? 0,
    hasMore,
    nextCursor,
  };
}

export async function getReviewWithDrafts(
  orgId: string,
  reviewId: string
): Promise<ReputationReview | null> {
  const { data, error } = await supabase
    .from('reputation_reviews')
    .select(`
      *,
      replies:reputation_review_replies(*),
      ai_drafts:reputation_ai_drafts(*)
    `)
    .eq('id', reviewId)
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch review: ${error.message}`);
  }

  return data as ReputationReview | null;
}

export async function getDraftsForReview(
  orgId: string,
  reviewId: string
): Promise<ReputationAIDraft[]> {
  const { data, error } = await supabase
    .from('reputation_ai_drafts')
    .select('*')
    .eq('org_id', orgId)
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch AI drafts: ${error.message}`);
  }

  return (data ?? []) as ReputationAIDraft[];
}

export async function applyDraft(draftId: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_ai_drafts')
    .update({ applied: true, applied_at: new Date().toISOString() })
    .eq('id', draftId);

  if (error) {
    throw new Error(`Failed to apply draft: ${error.message}`);
  }
}

export async function getDistinctAccounts(
  orgId: string
): Promise<Array<{ account_id: string; account_username: string | null; platform: string }>> {
  const { data, error } = await supabase
    .from('reputation_reviews')
    .select('account_id, account_username, platform')
    .eq('org_id', orgId)
    .order('account_id');

  if (error) {
    throw new Error(`Failed to fetch accounts: ${error.message}`);
  }

  const seen = new Set<string>();
  const unique: Array<{ account_id: string; account_username: string | null; platform: string }> = [];
  for (const row of data ?? []) {
    if (!seen.has(row.account_id)) {
      seen.add(row.account_id);
      unique.push(row);
    }
  }

  return unique;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: reviews, error } = await supabase
    .from('reputation_reviews')
    .select('rating, has_reply, review_created_at')
    .eq('org_id', orgId)
    .gte('review_created_at', thirtyDaysAgo);

  if (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }

  const rows = reviews ?? [];
  const total = rows.length;
  const replied = rows.filter((r) => r.has_reply).length;
  const sumRating = rows.reduce((s, r) => s + (r.rating ?? 0), 0);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });

  const byDate: Record<string, number> = {};
  rows.forEach((r) => {
    const day = r.review_created_at.slice(0, 10);
    byDate[day] = (byDate[day] ?? 0) + 1;
  });

  const reviewsOverTime = Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    avgRating: total > 0 ? Math.round((sumRating / total) * 10) / 10 : 0,
    totalReviews: total,
    unrepliedCount: total - replied,
    responseRate: total > 0 ? Math.round((replied / total) * 100) : 0,
    ratingDistribution: distribution,
    reviewsOverTime,
  };
}

export async function getLastSyncMeta(
  orgId: string
): Promise<{ lastSyncedAt: string | null; failedAccounts: unknown[] }> {
  const { data } = await supabase
    .from('reputation_actions_audit')
    .select('created_at, metadata')
    .eq('org_id', orgId)
    .eq('action', 'sync_reviews')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { lastSyncedAt: null, failedAccounts: [] };

  const meta = data.metadata as Record<string, unknown> | null;
  return {
    lastSyncedAt: data.created_at,
    failedAccounts: (meta?.failed_accounts as unknown[]) ?? [],
  };
}
