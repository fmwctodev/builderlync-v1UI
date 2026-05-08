import { supabase } from '../../../shared/lib/supabase';
import type { SocialPost } from '../types/marketing';
import { isStagingMode } from '../../../shared/utils/stagingAuth';
import { DEMO_SOCIAL_POSTS } from '../../../shared/utils/demoFixtures';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

const buildStagingSocialPosts = (): SocialPost[] =>
  DEMO_SOCIAL_POSTS.map((p) => ({
    id: p.id,
    org_id: DEMO_ORG_ID,
    content: p.content,
    platforms: p.platforms as any,
    scheduled_at: (p as any).scheduled_at,
    published_at: (p as any).published_at,
    status: p.status as SocialPost['status'],
    source_type: 'manual' as any,
    source_id: undefined,
    image_url: p.media?.[0]?.url,
    created_at: (p as any).created_at,
  }));

function rowToPost(row: Record<string, unknown>): SocialPost {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    content: row.content as string,
    platforms: (row.platforms as string[]) ?? [],
    scheduled_at: row.scheduled_at as string | undefined,
    published_at: row.published_at as string | undefined,
    status: (row.status as SocialPost['status']) ?? 'draft',
    source_type: row.source_type as SocialPost['source_type'],
    source_id: row.source_id as string | undefined,
    image_url: row.image_url as string | undefined,
    created_at: row.created_at as string,
  };
}

export const socialPostsApi = {
  async getPosts(orgId: string | null): Promise<SocialPost[]> {
    if (isStagingMode()) return buildStagingSocialPosts();
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_social_posts_ai')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToPost);
  },

  async createPost(
    payload: Partial<SocialPost>,
    orgId: string | null
  ): Promise<SocialPost> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_social_posts_ai')
      .insert([{
        organization_id: organizationId,
        content: payload.content || '',
        platforms: payload.platforms || [],
        scheduled_at: payload.scheduled_at || null,
        status: payload.scheduled_at ? 'scheduled' : 'draft',
        source_type: payload.source_type || 'manual',
        source_id: payload.source_id || null,
        image_url: payload.image_url || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return rowToPost(data);
  },

  async updatePost(
    id: string,
    updates: Partial<SocialPost>,
    orgId: string | null
  ): Promise<SocialPost> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_social_posts_ai')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToPost(data);
  },

  async deletePost(id: string, orgId: string | null): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_social_posts_ai')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },
};
