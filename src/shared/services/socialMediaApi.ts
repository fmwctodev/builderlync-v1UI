import { supabase } from '../lib/supabase';

export type SocialPlatform = 'google_business' | 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'youtube';
export type PostStatus = 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';

export interface SocialMediaAccount {
  id: string;
  organization_id: string;
  platform: SocialPlatform;
  account_name: string;
  account_id?: string;
  profile_image_url?: string;
  is_connected: boolean;
  last_sync_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  organization_id: string;
  user_id: string;
  title?: string;
  content: string;
  media_urls: string[];
  platforms: SocialPlatform[];
  platform_options: Record<string, any>;
  status: PostStatus;
  scheduled_at?: string;
  posted_at?: string;
  character_count: number;
  is_customize_per_channel: boolean;
  custom_content: Record<string, any>;
  tags: string[];
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPostAnalytics {
  id: string;
  post_id: string;
  platform: SocialPlatform;
  platform_post_id?: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  reach: number;
  metadata?: Record<string, any>;
  fetched_at: string;
}

export interface CreateSocialPostData {
  title?: string;
  content: string;
  media_urls?: string[];
  platforms: SocialPlatform[];
  platform_options?: Record<string, any>;
  status?: PostStatus;
  scheduled_at?: string;
  is_customize_per_channel?: boolean;
  custom_content?: Record<string, any>;
  tags?: string[];
}

export interface UpdateSocialPostData extends Partial<CreateSocialPostData> {
  id: string;
}

class SocialMediaAPI {
  async getAccounts(): Promise<SocialMediaAccount[]> {
    const { data, error } = await supabase
      .from('social_media_accounts')
      .select('*')
      .order('platform');

    if (error) throw error;
    return data || [];
  }

  async getAccountByPlatform(platform: SocialPlatform): Promise<SocialMediaAccount | null> {
    const { data, error } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('platform', platform)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async connectAccount(account: Omit<SocialMediaAccount, 'id' | 'created_at' | 'updated_at'>): Promise<SocialMediaAccount> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('social_media_accounts')
      .insert({
        ...account,
        organization_id: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAccount(id: string, updates: Partial<SocialMediaAccount>): Promise<SocialMediaAccount> {
    const { data, error } = await supabase
      .from('social_media_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async disconnectAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_media_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getPosts(status?: PostStatus): Promise<SocialPost[]> {
    let query = supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getPost(id: string): Promise<SocialPost | null> {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createPost(postData: CreateSocialPostData): Promise<SocialPost> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const characterCount = postData.content.length;

    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        ...postData,
        organization_id: user.user.id,
        user_id: user.user.id,
        character_count: characterCount,
        status: postData.status || 'draft',
        media_urls: postData.media_urls || [],
        platform_options: postData.platform_options || {},
        custom_content: postData.custom_content || {},
        tags: postData.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePost(updateData: UpdateSocialPostData): Promise<SocialPost> {
    const { id, ...updates } = updateData;

    if (updates.content) {
      updates.character_count = updates.content.length;
    }

    const { data, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async saveDraft(postData: CreateSocialPostData): Promise<SocialPost> {
    return this.createPost({
      ...postData,
      status: 'draft',
    });
  }

  async schedulePost(postData: CreateSocialPostData, scheduledAt: string): Promise<SocialPost> {
    return this.createPost({
      ...postData,
      status: 'scheduled',
      scheduled_at: scheduledAt,
    });
  }

  async publishPost(id: string): Promise<SocialPost> {
    return this.updatePost({
      id,
      status: 'posting',
    });
  }

  async getAnalytics(postId: string): Promise<SocialPostAnalytics[]> {
    const { data, error } = await supabase
      .from('social_post_analytics')
      .select('*')
      .eq('post_id', postId);

    if (error) throw error;
    return data || [];
  }

  async updateAnalytics(postId: string, platform: SocialPlatform, analytics: Partial<SocialPostAnalytics>): Promise<SocialPostAnalytics> {
    const { data, error } = await supabase
      .from('social_post_analytics')
      .upsert({
        post_id: postId,
        platform,
        ...analytics,
        fetched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const socialMediaApi = new SocialMediaAPI();
