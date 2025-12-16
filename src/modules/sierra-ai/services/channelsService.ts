import { supabase, getUserId } from '../lib/supabase';
import type { DatabaseChannelConfig, DatabaseSMSTemplate } from '../lib/database.types';

export class ChannelsService {
  async getChannelConfig(channelType: 'webchat' | 'sms' | 'voice'): Promise<DatabaseChannelConfig | null> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_channels_config')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_type', channelType)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllChannelConfigs(): Promise<DatabaseChannelConfig[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_channels_config')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async upsertChannelConfig(channelType: 'webchat' | 'sms' | 'voice', config: Record<string, any>, enabled: boolean = false): Promise<DatabaseChannelConfig> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_channels_config')
      .upsert({
        user_id: userId,
        channel_type: channelType,
        enabled,
        config
      }, {
        onConflict: 'user_id,channel_type'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateChannelStatus(channelType: 'webchat' | 'sms' | 'voice', enabled: boolean): Promise<DatabaseChannelConfig> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_channels_config')
      .update({ enabled })
      .eq('user_id', userId)
      .eq('channel_type', channelType)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSMSTemplates(): Promise<DatabaseSMSTemplate[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_sms_templates')
      .select('*')
      .eq('user_id', userId)
      .order('trigger_type');

    if (error) throw error;
    return data || [];
  }

  async createSMSTemplate(template: Partial<DatabaseSMSTemplate>): Promise<DatabaseSMSTemplate> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_sms_templates')
      .insert({
        user_id: userId,
        ...template
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSMSTemplate(id: string, updates: Partial<DatabaseSMSTemplate>): Promise<DatabaseSMSTemplate> {
    const { data, error } = await supabase
      .from('sierra_sms_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSMSTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('sierra_sms_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const channelsService = new ChannelsService();
