import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
const getAccessToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const profileService = {
  async getUserProfile(): Promise<any> {
    const { data } = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return data.data;
  },

  async updateUserProfile(updates: { firstName?: string; lastName?: string; phone?: string; email?: string; avatar_url?: string | null }): Promise<any> {
    const formData = new FormData();
    
    if (updates.firstName) formData.append('firstName', updates.firstName);
    if (updates.lastName) formData.append('lastName', updates.lastName);
    if (updates.phone) formData.append('phone', updates.phone);
    if (updates.avatar_url !== undefined) formData.append('avatar_url', updates.avatar_url || '');

    const token = getAccessToken();
    const { data } = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return data.data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profile', file);

    const token = getAccessToken();
    const { data } = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return data.data.profile;
  },

  async deleteAvatar(): Promise<void> {
    // Not implemented in API yet
  },

  async createUserProfile(profile: any): Promise<any> {
    return this.updateUserProfile(profile);
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
    // Not used - using authApi.changePassword instead
  },

  async signOutEverywhere(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/sign-out-everywhere`, {}, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear and redirect even if API call fails
      localStorage.clear();
      window.location.href = '/auth/login';
    }
  },
};
