import { supabase } from '../lib/supabase';
import type {
  AssistantThread,
  AssistantMessage,
  AssistantProfile,
  AssistantActionLog,
} from '../types/sierraAssistant';

export async function loadThreads(userId: string): Promise<AssistantThread[]> {
  const { data, error } = await supabase
    .from('assistant_threads')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as AssistantThread[];
}

export async function createThread(
  userId: string,
  title?: string,
  contextModule?: string,
  contextRecordId?: string
): Promise<AssistantThread> {
  const { data, error } = await supabase
    .from('assistant_threads')
    .insert({
      user_id: userId,
      title: title ?? 'New Conversation',
      context_module: contextModule ?? null,
      context_record_id: contextRecordId ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as AssistantThread;
}

export async function updateThreadTitle(threadId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('assistant_threads')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', threadId);
  if (error) throw error;
}

export async function archiveThread(threadId: string): Promise<void> {
  const { error } = await supabase
    .from('assistant_threads')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', threadId);
  if (error) throw error;
}

export async function loadMessages(threadId: string, limit = 60): Promise<AssistantMessage[]> {
  const { data, error } = await supabase
    .from('assistant_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AssistantMessage[];
}

export async function insertUserMessage(
  threadId: string,
  userId: string,
  content: string
): Promise<AssistantMessage> {
  const { data, error } = await supabase
    .from('assistant_messages')
    .insert({
      thread_id: threadId,
      user_id: userId,
      role: 'user',
      content,
      message_type: 'text',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as AssistantMessage;
}

export async function loadProfile(userId: string): Promise<AssistantProfile | null> {
  const { data } = await supabase
    .from('assistant_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as AssistantProfile) ?? null;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<AssistantProfile, 'id' | 'user_id' | 'created_at'>>
): Promise<AssistantProfile> {
  const { data, error } = await supabase
    .from('assistant_profiles')
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as AssistantProfile;
}

export async function loadActionLogs(userId: string, limit = 30): Promise<AssistantActionLog[]> {
  const { data, error } = await supabase
    .from('assistant_action_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AssistantActionLog[];
}
