import { supabase } from '../../../../shared/lib/supabase';
import type { SocialPost, SocialPostFilters, SocialPostStatus, PLATFORM_CHARACTER_LIMITS } from '../types';

export async function getSocialPosts(
  orgId: string,
  filters?: SocialPostFilters
): Promise<SocialPost[]> {
  let query = supabase
    .from('sierra_social_posts')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (filters?.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters?.search) {
    query = query.ilike('body', `%${filters.search}%`);
  }
  if (filters?.campaignId) {
    query = query.eq('campaign_id', filters.campaignId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSocialPostById(id: string): Promise<SocialPost | null> {
  const { data, error } = await supabase
    .from('sierra_social_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCalendarPosts(
  orgId: string,
  startDate: string,
  endDate: string
): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from('sierra_social_posts')
    .select('*')
    .eq('organization_id', orgId)
    .in('status', ['scheduled', 'queued', 'posting', 'posted', 'failed'])
    .gte('scheduled_at_utc', startDate)
    .lte('scheduled_at_utc', endDate)
    .order('scheduled_at_utc', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createSocialPost(
  orgId: string,
  userId: string,
  postData: Partial<SocialPost>
): Promise<SocialPost> {
  const approvalToken = postData.requires_approval ? crypto.randomUUID() : null;

  const { data, error } = await supabase
    .from('sierra_social_posts')
    .insert({
      organization_id: orgId,
      created_by: userId,
      approval_token: approvalToken,
      ...postData,
    })
    .select()
    .single();
  if (error) throw error;

  await createPostLog(data.id, null, 'created', {});
  return data;
}

export async function updateSocialPost(
  id: string,
  updates: Partial<SocialPost>
): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function schedulePost(
  id: string,
  scheduledAtUtc: string,
  timezone: string
): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .update({
      status: 'scheduled',
      scheduled_at_utc: scheduledAtUtc,
      scheduled_timezone: timezone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
  await createPostLog(id, null, 'scheduled', { scheduled_at: scheduledAtUtc });
}

export async function approvePost(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .update({
      status: 'scheduled',
      approved_by: userId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
  await createPostLog(id, null, 'approved', { approved_by: userId });
}

export async function cancelPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  await createPostLog(id, null, 'cancelled', {});
}

export async function duplicatePost(id: string, userId: string): Promise<SocialPost> {
  const original = await getSocialPostById(id);
  if (!original) throw new Error('Post not found');

  const { data, error } = await supabase
    .from('sierra_social_posts')
    .insert({
      organization_id: original.organization_id,
      created_by: userId,
      body: original.body,
      media: original.media,
      targets: original.targets,
      hashtags: original.hashtags,
      hook_text: original.hook_text,
      cta_text: original.cta_text,
      ai_generated: original.ai_generated,
      status: 'draft',
    })
    .select()
    .single();
  if (error) throw error;
  await createPostLog(data.id, null, 'created', { duplicated_from: id });
  return data;
}

export async function deleteSocialPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function createPostLog(
  postId: string,
  accountId: string | null,
  action: string,
  details: object
): Promise<void> {
  await supabase.from('sierra_social_post_logs').insert({
    post_id: postId,
    account_id: accountId,
    action,
    details,
  });
}

export async function submitForApproval(
  postId: string,
  scheduledAtUtc?: string,
  timezone?: string
): Promise<void> {
  const approvalToken = crypto.randomUUID();
  const updates: Record<string, unknown> = {
    status: 'pending_approval',
    approval_token: approvalToken,
    approval_requested_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (scheduledAtUtc) {
    updates.scheduled_at_utc = scheduledAtUtc;
    updates.scheduled_timezone = timezone ?? 'UTC';
  }
  const { error } = await supabase
    .from('sierra_social_posts')
    .update(updates)
    .eq('id', postId);
  if (error) throw error;
  await createPostLog(postId, null, 'approval_requested', { token: approvalToken });
}

export async function approvePostWithToken(token: string, userId: string): Promise<void> {
  const { data: post, error: fetchError } = await supabase
    .from('sierra_social_posts')
    .select('id')
    .eq('approval_token', token)
    .maybeSingle();
  if (fetchError || !post) throw new Error('Invalid approval token');
  await approvePost(post.id, userId);
}

export async function denyPostWithToken(
  token: string,
  userId: string,
  notes: string
): Promise<void> {
  const { data: post, error: fetchError } = await supabase
    .from('sierra_social_posts')
    .select('id')
    .eq('approval_token', token)
    .maybeSingle();
  if (fetchError || !post) throw new Error('Invalid approval token');

  const { error } = await supabase
    .from('sierra_social_posts')
    .update({
      status: 'denied',
      approval_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', post.id);
  if (error) throw error;
  await createPostLog(post.id, null, 'denied', { denied_by: userId, notes });
}

export async function publishPost(postId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('social-worker', {
    body: { post_id: postId },
  });
  if (error) throw error;
}

export function getCharacterLimits(): Record<string, number> {
  return {
    facebook: 63206,
    instagram: 2200,
    linkedin: 3000,
    google_business: 1500,
    tiktok: 2200,
    youtube: 5000,
    reddit: 40000,
  };
}
