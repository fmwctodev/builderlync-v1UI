import { supabase, getUserId } from '../lib/supabase';
import type { DatabaseBehaviorProfile } from '../lib/database.types';

export class BehaviorService {
  async getProfile(): Promise<DatabaseBehaviorProfile | null> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_behavior_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getDraftProfile(): Promise<DatabaseBehaviorProfile | null> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_behavior_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProfile(profile: Partial<DatabaseBehaviorProfile>): Promise<DatabaseBehaviorProfile> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_behavior_profiles')
      .insert({
        user_id: userId,
        ...profile
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(id: string, updates: Partial<DatabaseBehaviorProfile>): Promise<DatabaseBehaviorProfile> {
    const { data, error } = await supabase
      .from('sierra_behavior_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async publishProfile(draftId: string): Promise<DatabaseBehaviorProfile> {
    return this.updateProfile(draftId, { status: 'published' });
  }

  async getOrCreateProfile(): Promise<DatabaseBehaviorProfile> {
    let profile = await this.getProfile();

    if (!profile) {
      profile = await this.createProfile({
        name: 'Default',
        persona_description: 'Professional and helpful AI assistant',
        tone_tags: ['professional', 'friendly', 'direct'],
        formality_level: 'neutral',
        status: 'published'
      });
    }

    return profile;
  }
}

export const behaviorService = new BehaviorService();
