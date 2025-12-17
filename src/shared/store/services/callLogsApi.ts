import { supabase } from '../../lib/supabase';

export interface CallLog {
  id: string;
  user_id: string;
  contact_id?: string;
  from_number: string;
  to_number: string;
  direction: 'inbound' | 'outbound';
  status: string;
  duration: number;
  recording_url?: string;
  notes?: string;
  call_sid?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export const callLogsApi = {
  async getRecentCalls(limit: number = 50): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent calls:', error);
      throw error;
    }

    return data || [];
  },

  async getCallById(id: string): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching call:', error);
      throw error;
    }

    return data;
  },

  async createCallLog(callLog: Partial<CallLog>): Promise<CallLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        ...callLog,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating call log:', error);
      throw error;
    }

    return data;
  },

  async updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog> {
    const { data, error } = await supabase
      .from('call_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating call log:', error);
      throw error;
    }

    return data;
  },

  async deleteCallLog(id: string): Promise<void> {
    const { error } = await supabase.from('call_logs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting call log:', error);
      throw error;
    }
  },

  async getCallsByContact(contactId: string): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('contact_id', contactId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching calls by contact:', error);
      throw error;
    }

    return data || [];
  },

  async getCallsByDateRange(startDate: string, endDate: string): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false});

    if (error) {
      console.error('Error fetching calls by date range:', error);
      throw error;
    }

    return data || [];
  },
};

export interface PhoneNumber {
  id: string;
  user_id: string;
  phone_number: string;
  friendly_name: string;
  phone_number_sid?: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  is_default: boolean;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export const phoneNumbersApi = {
  async getPhoneNumbers(): Promise<PhoneNumber[]> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching phone numbers:', error);
      throw error;
    }

    return data || [];
  },

  async getDefaultPhoneNumber(): Promise<PhoneNumber | null> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching default phone number:', error);
      throw error;
    }

    return data;
  },

  async createPhoneNumber(phoneNumber: Partial<PhoneNumber>): Promise<PhoneNumber> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('phone_numbers')
      .insert({
        ...phoneNumber,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating phone number:', error);
      throw error;
    }

    return data;
  },

  async updatePhoneNumber(id: string, updates: Partial<PhoneNumber>): Promise<PhoneNumber> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating phone number:', error);
      throw error;
    }

    return data;
  },

  async deletePhoneNumber(id: string): Promise<void> {
    const { error } = await supabase.from('phone_numbers').delete().eq('id', id);

    if (error) {
      console.error('Error deleting phone number:', error);
      throw error;
    }
  },

  async setDefaultPhoneNumber(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('phone_numbers')
      .update({ is_default: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('phone_numbers')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      console.error('Error setting default phone number:', error);
      throw error;
    }
  },
};
