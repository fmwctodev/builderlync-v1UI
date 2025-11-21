import { supabase } from '../lib/supabase';
import { Campaign, CampaignFormData, CampaignStats } from '../../modules/roof-runner/types/campaigns';

export const campaignsApi = {
  async createCampaign(data: CampaignFormData, sendNow: boolean): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const status = sendNow ? 'sending' : data.scheduled_date ? 'scheduled' : 'draft';

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name: data.name,
        type: data.type,
        status,
        subject: data.subject,
        from_name: data.from_name,
        from_email: data.from_email,
        content: data.content,
        target_audience: data.target_audience,
        scheduled_date: data.scheduled_date,
        tags: data.tags,
        sent_at: sendNow ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return campaign;
  },

  async updateCampaign(id: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        name: data.name,
        subject: data.subject,
        from_name: data.from_name,
        from_email: data.from_email,
        content: data.content,
        target_audience: data.target_audience,
        scheduled_date: data.scheduled_date,
        tags: data.tags,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return campaign;
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async getCampaigns(): Promise<Campaign[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getCampaign(id: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    const { data, error } = await supabase
      .from('campaign_stats')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async sendCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async pauseCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'paused',
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async duplicateCampaign(id: string): Promise<Campaign> {
    const original = await this.getCampaign(id);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name: `${original.name} (Copy)`,
        type: original.type,
        status: 'draft',
        subject: original.subject,
        from_name: original.from_name,
        from_email: original.from_email,
        content: original.content,
        target_audience: original.target_audience,
        tags: original.tags,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
