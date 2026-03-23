import { supabase } from '../../../../shared/lib/supabase';
import type { SocialCampaign, SocialCampaignStatus, SocialPost } from '../types';

export async function getCampaigns(
  orgId: string,
  status?: SocialCampaignStatus
): Promise<SocialCampaign[]> {
  let query = supabase
    .from('sierra_social_campaigns')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (status) {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCampaignById(id: string): Promise<SocialCampaign | null> {
  const { data, error } = await supabase
    .from('sierra_social_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCampaign(
  orgId: string,
  userId: string,
  input: Omit<SocialCampaign, 'id' | 'organization_id' | 'created_by' | 'post_count' | 'created_at' | 'updated_at'>
): Promise<SocialCampaign> {
  const { data, error } = await supabase
    .from('sierra_social_campaigns')
    .insert({
      organization_id: orgId,
      created_by: userId,
      ...input,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(
  id: string,
  updates: Partial<SocialCampaign>
): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_campaigns')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function toggleAutopilot(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_campaigns')
    .update({ autopilot_mode: enabled, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function generateCampaignPosts(
  campaignId: string
): Promise<{ generated: number }> {
  const { data, error } = await supabase.functions.invoke('ai-social-campaign-generator', {
    body: { campaign_id: campaignId },
  });
  if (error) throw error;
  return data ?? { generated: 0 };
}

export async function getCampaignPosts(campaignId: string): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from('sierra_social_posts')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
