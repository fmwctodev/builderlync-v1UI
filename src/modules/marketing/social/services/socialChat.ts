import { supabase } from '../../../../shared/lib/supabase';
import type {
  SocialAIThread,
  SocialAIMessage,
  SocialAIMessageType,
  SocialAIAttachment,
  MediaPreferences,
  MediaItem,
  MediaJobInfo,
  PublishDraftParams,
  SendMessageResult,
} from '../types';

export async function getThreads(
  orgId: string,
  userId: string
): Promise<SocialAIThread[]> {
  const { data, error } = await supabase
    .from('sierra_social_ai_threads')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getThreadById(threadId: string): Promise<SocialAIThread | null> {
  const { data, error } = await supabase
    .from('sierra_social_ai_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getThreadMessages(threadId: string): Promise<SocialAIMessage[]> {
  const { data, error } = await supabase
    .from('sierra_social_ai_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createThread(
  orgId: string,
  userId: string,
  title?: string
): Promise<SocialAIThread> {
  const { data, error } = await supabase
    .from('sierra_social_ai_threads')
    .insert({
      organization_id: orgId,
      user_id: userId,
      title: title ?? 'New conversation',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveThread(threadId: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_ai_threads')
    .update({ status: 'archived' })
    .eq('id', threadId);
  if (error) throw error;
}

export async function deleteThread(threadId: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_ai_threads')
    .delete()
    .eq('id', threadId);
  if (error) throw error;
}

export async function sendMessage(
  threadId: string,
  content: string,
  messageType: SocialAIMessageType = 'text',
  attachments: SocialAIAttachment[] = [],
  mediaPrefs?: MediaPreferences
): Promise<SendMessageResult> {
  const { data: userMsg, error: userMsgError } = await supabase
    .from('sierra_social_ai_messages')
    .insert({
      thread_id: threadId,
      role: 'user',
      content,
      message_type: messageType,
      attachments,
    })
    .select()
    .single();
  if (userMsgError) throw userMsgError;

  let edgeFnResult: {
    response: string;
    drafts?: unknown[];
    media_jobs?: MediaJobInfo[];
    media_skipped_reason?: string;
    model_used?: string;
  };

  try {
    const { data, error } = await supabase.functions.invoke('ai-social-chat', {
      body: {
        thread_id: threadId,
        content,
        message_type: messageType,
        attachments,
        auto_generate_media: mediaPrefs?.auto_generate_media ?? true,
        video_model_id: mediaPrefs?.video_model_id,
        video_mode: mediaPrefs?.video_mode ?? 'std',
        aspect_ratio: mediaPrefs?.aspect_ratio ?? '9:16',
        style_preset_id: mediaPrefs?.style_preset_id,
      },
    });
    if (error) throw error;
    edgeFnResult = data;
  } catch (err) {
    await supabase.from('sierra_social_ai_messages').delete().eq('id', userMsg.id);
    throw err;
  }

  const { response, drafts = [], media_jobs = [], media_skipped_reason, model_used } = edgeFnResult;

  let fullContent = response;
  if (drafts.length > 0) {
    for (const draft of drafts) {
      fullContent += `\n---DRAFT---\n${JSON.stringify(draft)}\n---END_DRAFT---`;
    }
  }

  const autoDraftIds: string[] = [];
  if (drafts.length > 0) {
    const thread = await getThreadById(threadId);
    if (thread) {
      for (const draft of drafts as Array<{ platform: string; hook: string; body: string; cta: string; hashtags: string[] }>) {
        const fullBody = [draft.hook, draft.body, draft.cta].filter(Boolean).join('\n\n');
        const { data: post } = await supabase
          .from('sierra_social_posts')
          .insert({
            organization_id: thread.organization_id,
            created_by: thread.user_id,
            body: fullBody,
            hook_text: draft.hook,
            cta_text: draft.cta,
            hashtags: draft.hashtags,
            status: 'draft',
            ai_generated: true,
            thread_id: threadId,
          })
          .select('id')
          .single();
        if (post) autoDraftIds.push(post.id);
      }
    }
  }

  const { data: aiMsg, error: aiMsgError } = await supabase
    .from('sierra_social_ai_messages')
    .insert({
      thread_id: threadId,
      role: 'assistant',
      content: fullContent,
      message_type: drafts.length > 0 ? 'post_draft' : 'text',
      attachments: [],
      generated_posts: drafts.length > 0 ? drafts : null,
      metadata: {
        model_used,
        media_jobs,
        media_skipped_reason,
        auto_draft_ids: autoDraftIds,
      },
    })
    .select()
    .single();
  if (aiMsgError) throw aiMsgError;

  await supabase
    .from('sierra_social_ai_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId);

  const thread = await getThreadById(threadId);
  if (thread && thread.title === 'New conversation') {
    await supabase
      .from('sierra_social_ai_threads')
      .update({ title: content.slice(0, 60) })
      .eq('id', threadId);
  }

  return {
    userMessage: userMsg as SocialAIMessage,
    aiMessage: aiMsg as SocialAIMessage,
    mediaJobs: (media_jobs as MediaJobInfo[]).map((j) => ({ ...j, message_id: aiMsg.id })),
    mediaSkippedReason: media_skipped_reason,
  };
}

export async function publishDraftFromChat(params: PublishDraftParams): Promise<string> {
  const { orgId, userId, draft, accountIds, mode, scheduledAtUtc, media, mediaAssetIds, threadId, existingPostId } = params;

  const fullBody = [draft.hook, draft.body, draft.cta].filter(Boolean).join('\n\n');

  let status: string;
  let scheduledAt: string | null = null;

  if (mode === 'post_now') {
    status = 'scheduled';
    scheduledAt = new Date().toISOString();
  } else if (mode === 'schedule') {
    status = 'scheduled';
    scheduledAt = scheduledAtUtc ?? null;
  } else {
    status = 'draft';
  }

  const postData = {
    body: fullBody,
    hook_text: draft.hook,
    cta_text: draft.cta,
    hashtags: draft.hashtags,
    visual_style_suggestion: draft.visual_style_suggestion,
    engagement_prediction: draft.engagement_prediction,
    targets: accountIds,
    status,
    scheduled_at_utc: scheduledAt,
    media: media ?? [],
    media_asset_ids: mediaAssetIds ?? [],
    ai_generated: true,
    thread_id: threadId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existingPostId) {
    const { error } = await supabase
      .from('sierra_social_posts')
      .update(postData)
      .eq('id', existingPostId)
      .eq('status', 'draft');
    if (error) throw error;
    return existingPostId;
  }

  const { data, error } = await supabase
    .from('sierra_social_posts')
    .insert({
      organization_id: orgId,
      created_by: userId,
      ...postData,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateDraftMedia(
  postId: string,
  media: MediaItem[],
  mediaAssetIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_posts')
    .update({ media, media_asset_ids: mediaAssetIds, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('status', 'draft');
  if (error) throw error;
}
