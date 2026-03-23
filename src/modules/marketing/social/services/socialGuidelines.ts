import { supabase } from '../../../../shared/lib/supabase';
import type { SocialGuideline } from '../types';

export async function getGuidelines(orgId: string): Promise<SocialGuideline | null> {
  const { data, error } = await supabase
    .from('sierra_social_guidelines')
    .select('*')
    .eq('organization_id', orgId)
    .is('user_id', null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertGuidelines(
  orgId: string,
  updates: Partial<SocialGuideline>
): Promise<SocialGuideline> {
  const { data, error } = await supabase
    .from('sierra_social_guidelines')
    .upsert(
      {
        organization_id: orgId,
        user_id: null,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function mergeGuidelineFromChat(
  orgId: string,
  partialUpdate: Partial<SocialGuideline>
): Promise<void> {
  const existing = await getGuidelines(orgId);

  const mergeArrays = <T extends { content: string }>(
    existing: T[],
    incoming: T[]
  ): T[] => {
    const contents = new Set(existing.map((b) => b.content));
    const merged = [...existing];
    for (const item of incoming) {
      if (!contents.has(item.content)) {
        merged.push(item);
        contents.add(item.content);
      }
    }
    return merged;
  };

  const mergeStringArrays = (a: string[], b: string[]): string[] =>
    Array.from(new Set([...a, ...b]));

  const merged: Partial<SocialGuideline> = { ...partialUpdate };

  if (existing) {
    if (partialUpdate.content_themes) {
      merged.content_themes = mergeArrays(existing.content_themes, partialUpdate.content_themes);
    }
    if (partialUpdate.image_style) {
      merged.image_style = mergeArrays(existing.image_style, partialUpdate.image_style);
    }
    if (partialUpdate.writing_style) {
      merged.writing_style = mergeArrays(existing.writing_style, partialUpdate.writing_style);
    }
    if (partialUpdate.words_to_avoid) {
      merged.words_to_avoid = mergeStringArrays(existing.words_to_avoid, partialUpdate.words_to_avoid);
    }
    if (partialUpdate.cta_rules) {
      merged.cta_rules = mergeStringArrays(existing.cta_rules, partialUpdate.cta_rules);
    }
    if (partialUpdate.hashtag_preferences) {
      merged.hashtag_preferences = {
        preferred: mergeStringArrays(
          existing.hashtag_preferences.preferred,
          partialUpdate.hashtag_preferences.preferred ?? []
        ),
        banned: mergeStringArrays(
          existing.hashtag_preferences.banned,
          partialUpdate.hashtag_preferences.banned ?? []
        ),
      };
    }
    if (partialUpdate.tone_preferences) {
      merged.tone_preferences = {
        ...existing.tone_preferences,
        ...partialUpdate.tone_preferences,
      };
    }
  }

  await upsertGuidelines(orgId, merged);
}
