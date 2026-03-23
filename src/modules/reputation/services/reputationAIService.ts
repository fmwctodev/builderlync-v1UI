import { supabase } from '../../../shared/lib/supabase';
import type { ReputationAIDraft } from '../types';

export async function generateDrafts(params: {
  orgId: string;
  reviewId: string;
  userId: string;
  tonePreset?: string;
  instructions?: string;
}): Promise<ReputationAIDraft[]> {
  const { data, error } = await supabase.functions.invoke('reputation-ai-draft', {
    body: params,
  });

  if (error) throw new Error(`Failed to generate drafts: ${error.message}`);

  if (data?.code === 'OPENAI_NOT_CONFIGURED') {
    throw new Error('OpenAI API key is not configured for this platform.');
  }
  if (data?.code === 'OPENAI_AUTH_ERROR') {
    throw new Error('OpenAI authentication failed.');
  }
  if (!data?.success) throw new Error(data?.error ?? 'Failed to generate drafts');

  return (data.drafts ?? []) as ReputationAIDraft[];
}

export async function applyDraft(draftId: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_ai_drafts')
    .update({ applied: true, applied_at: new Date().toISOString() })
    .eq('id', draftId);

  if (error) throw new Error(`Failed to apply draft: ${error.message}`);
}
