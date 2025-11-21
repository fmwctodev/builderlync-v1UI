import { supabase, getCurrentUserId } from '../lib/supabase';
import { UserProfile, WorkingHours, CalendarConnection, EmailConnection, UserSignature, User2FASettings, UserPreferences } from '../types/profile';

export const profileService = {
  async getUserProfile(): Promise<UserProfile | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ ...profile, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteAvatar(avatarUrl: string): Promise<void> {
    const path = avatarUrl.split('/').slice(-2).join('/');

    const { error } = await supabase.storage
      .from('user-assets')
      .remove([path]);

    if (error) throw error;
  },
};

export const workingHoursService = {
  async getWorkingHours(): Promise<WorkingHours[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('user_working_hours')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async saveWorkingHours(hours: Partial<WorkingHours>[]): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    await supabase
      .from('user_working_hours')
      .delete()
      .eq('user_id', userId);

    if (hours.length === 0) return;

    const { error } = await supabase
      .from('user_working_hours')
      .insert(hours.map(h => ({ ...h, user_id: userId })));

    if (error) throw error;
  },
};

export const calendarService = {
  async getCalendarConnections(): Promise<CalendarConnection[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addCalendarConnection(connection: Partial<CalendarConnection>): Promise<CalendarConnection> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('calendar_connections')
      .insert({ ...connection, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCalendarConnection(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async setPrimaryCalendar(id: string): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    await supabase
      .from('calendar_connections')
      .update({ is_primary: false })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('calendar_connections')
      .update({ is_primary: true })
      .eq('id', id);

    if (error) throw error;
  },
};

export const emailService = {
  async getEmailConnection(): Promise<EmailConnection | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('email_connections')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async addEmailConnection(connection: Partial<EmailConnection>): Promise<EmailConnection> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_connections')
      .insert({ ...connection, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmailConnection(): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('email_connections')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateSyncStatus(status: 'active' | 'paused' | 'error'): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('email_connections')
      .update({ sync_status: status, last_synced_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  },
};

export const signatureService = {
  async getUserSignature(): Promise<UserSignature | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveUserSignature(signature: Partial<UserSignature>): Promise<UserSignature> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const existing = await this.getUserSignature();

    if (existing) {
      const { data, error } = await supabase
        .from('user_signatures')
        .update({ ...signature, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_signatures')
        .insert({ ...signature, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
};

export const twoFactorService = {
  async get2FASettings(): Promise<User2FASettings | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async enable2FA(settings: Partial<User2FASettings>): Promise<User2FASettings> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const existing = await this.get2FASettings();

    if (existing) {
      const { data, error } = await supabase
        .from('user_2fa_settings')
        .update({ ...settings, is_enabled: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_2fa_settings')
        .insert({ ...settings, user_id: userId, is_enabled: true })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async disable2FA(): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_2fa_settings')
      .update({ is_enabled: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  },
};

export const preferencesService = {
  async getUserPreferences(): Promise<UserPreferences | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const existing = await this.getUserPreferences();

    if (existing) {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ ...preferences, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({ ...preferences, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
};

export const passwordService = {
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  async signOutEverywhere(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  },
};
