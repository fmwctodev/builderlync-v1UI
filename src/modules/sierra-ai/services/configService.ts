import { supabase, getUserId } from '../lib/supabase';
import type { DatabaseSierraConfig } from '../lib/database.types';

export class ConfigService {
  async getConfig(): Promise<DatabaseSierraConfig | null> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_config')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createConfig(config: Partial<DatabaseSierraConfig>): Promise<DatabaseSierraConfig> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_config')
      .insert({
        user_id: userId,
        ...config
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConfig(updates: Partial<DatabaseSierraConfig>): Promise<DatabaseSierraConfig> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_config')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(status: 'active' | 'paused'): Promise<DatabaseSierraConfig> {
    return this.updateConfig({ status });
  }

  async updateBusinessHours(businessHours: any): Promise<DatabaseSierraConfig> {
    return this.updateConfig({ business_hours: businessHours });
  }

  async publish(): Promise<DatabaseSierraConfig> {
    const userId = await getUserId();

    const config = await this.getConfig();
    if (!config) throw new Error('No config found');

    const { data, error } = await supabase
      .from('sierra_config')
      .update({
        published_version: config.draft_version
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateConfig(): Promise<DatabaseSierraConfig> {
    let config = await this.getConfig();

    if (!config) {
      config = await this.createConfig({
        status: 'paused',
        time_zone: 'America/New_York'
      });
    }

    return config;
  }
}

export const configService = new ConfigService();
