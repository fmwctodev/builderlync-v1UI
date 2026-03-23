import { supabase } from '../../../../shared/lib/supabase';
import type { SocialPostMetrics, AggregatedMetrics, SocialPost } from '../types';

export async function getMetricsForOrg(
  orgId: string
): Promise<Array<SocialPost & { metrics: SocialPostMetrics[] }>> {
  const { data: posts, error } = await supabase
    .from('sierra_social_posts')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'posted')
    .order('posted_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  if (!posts?.length) return [];

  const postIds = posts.map((p) => p.id);
  const { data: metrics } = await supabase
    .from('sierra_social_post_metrics')
    .select('*')
    .in('post_id', postIds);

  return posts.map((post) => ({
    ...post,
    metrics: metrics?.filter((m) => m.post_id === post.id) ?? [],
  }));
}

export async function getMetricsForPost(postId: string): Promise<SocialPostMetrics[]> {
  const { data, error } = await supabase
    .from('sierra_social_post_metrics')
    .select('*')
    .eq('post_id', postId);
  if (error) throw error;
  return data ?? [];
}

export async function refreshPostMetrics(postId: string): Promise<SocialPostMetrics> {
  const { data, error } = await supabase.functions.invoke('late-metrics', {
    body: { post_id: postId },
  });
  if (error) throw error;
  return data?.metrics ?? data;
}

export async function refreshAllMetrics(): Promise<{ synced: number }> {
  const { data, error } = await supabase.functions.invoke('late-metrics', {
    body: { bulk: true },
  });
  if (error) throw error;
  return data ?? { synced: 0 };
}

export function aggregateMetrics(metrics: SocialPostMetrics[]): AggregatedMetrics {
  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions ?? 0),
      reach: acc.reach + (m.reach ?? 0),
      likes: acc.likes + (m.likes ?? 0),
      comments: acc.comments + (m.comments ?? 0),
      shares: acc.shares + (m.shares ?? 0),
      saves: acc.saves + (m.saves ?? 0),
      clicks: acc.clicks + (m.clicks ?? 0),
    }),
    { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 }
  );

  const engagementRate =
    totals.impressions > 0
      ? ((totals.likes + totals.comments + totals.shares) / totals.impressions) * 100
      : 0;

  return { ...totals, engagementRate };
}
