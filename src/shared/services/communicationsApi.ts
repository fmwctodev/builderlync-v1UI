import { supabase } from '../lib/supabase';

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

export interface TwilioSettings {
  id: string;
  user_id: string;
  account_sid?: string;
  api_key?: string;
  api_secret?: string;
  twiml_app_sid?: string;
  call_recording_enabled: boolean;
  voicemail_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallRecording {
  id: string;
  call_log_id: string;
  recording_sid?: string;
  recording_url: string;
  duration: number;
  file_size: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface CreatePhoneNumberInput {
  phone_number: string;
  friendly_name: string;
  phone_number_sid?: string;
  capabilities?: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  is_default?: boolean;
  country_code?: string;
}

export interface UpdatePhoneNumberInput {
  friendly_name?: string;
  is_default?: boolean;
  capabilities?: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export interface UpdateTwilioSettingsInput {
  account_sid?: string;
  api_key?: string;
  api_secret?: string;
  twiml_app_sid?: string;
  call_recording_enabled?: boolean;
  voicemail_enabled?: boolean;
}

export const communicationsApi = {
  async getPhoneNumbers(userId: string): Promise<PhoneNumber[]> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching phone numbers:', error);
      throw new Error(`Failed to fetch phone numbers: ${error.message}`);
    }

    return data || [];
  },

  async getPhoneNumber(phoneNumberId: string): Promise<PhoneNumber | null> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', phoneNumberId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching phone number:', error);
      throw new Error(`Failed to fetch phone number: ${error.message}`);
    }

    return data;
  },

  async getDefaultPhoneNumber(userId: string): Promise<PhoneNumber | null> {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching default phone number:', error);
      throw new Error(`Failed to fetch default phone number: ${error.message}`);
    }

    return data;
  },

  async createPhoneNumber(
    userId: string,
    input: CreatePhoneNumberInput
  ): Promise<PhoneNumber> {
    if (input.is_default) {
      await this.clearDefaultPhoneNumber(userId);
    }

    const { data, error } = await supabase
      .from('phone_numbers')
      .insert({
        user_id: userId,
        ...input,
        capabilities: input.capabilities || {
          voice: true,
          sms: true,
          mms: false,
        },
        country_code: input.country_code || 'US',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating phone number:', error);
      throw new Error(`Failed to create phone number: ${error.message}`);
    }

    return data;
  },

  async updatePhoneNumber(
    phoneNumberId: string,
    input: UpdatePhoneNumberInput
  ): Promise<PhoneNumber> {
    if (input.is_default) {
      const phoneNumber = await this.getPhoneNumber(phoneNumberId);
      if (phoneNumber) {
        await this.clearDefaultPhoneNumber(phoneNumber.user_id);
      }
    }

    const { data, error } = await supabase
      .from('phone_numbers')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', phoneNumberId)
      .select()
      .single();

    if (error) {
      console.error('Error updating phone number:', error);
      throw new Error(`Failed to update phone number: ${error.message}`);
    }

    return data;
  },

  async deletePhoneNumber(phoneNumberId: string): Promise<void> {
    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', phoneNumberId);

    if (error) {
      console.error('Error deleting phone number:', error);
      throw new Error(`Failed to delete phone number: ${error.message}`);
    }
  },

  async setDefaultPhoneNumber(phoneNumberId: string): Promise<PhoneNumber> {
    const phoneNumber = await this.getPhoneNumber(phoneNumberId);
    if (!phoneNumber) {
      throw new Error('Phone number not found');
    }

    await this.clearDefaultPhoneNumber(phoneNumber.user_id);

    return this.updatePhoneNumber(phoneNumberId, { is_default: true });
  },

  async clearDefaultPhoneNumber(userId: string): Promise<void> {
    const { error } = await supabase
      .from('phone_numbers')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    if (error) {
      console.error('Error clearing default phone number:', error);
    }
  },

  async getTwilioSettings(userId: string): Promise<TwilioSettings | null> {
    const { data, error } = await supabase
      .from('twilio_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Twilio settings:', error);
      throw new Error(`Failed to fetch Twilio settings: ${error.message}`);
    }

    return data;
  },

  async createOrUpdateTwilioSettings(
    userId: string,
    input: UpdateTwilioSettingsInput
  ): Promise<TwilioSettings> {
    const existing = await this.getTwilioSettings(userId);

    if (existing) {
      const { data, error } = await supabase
        .from('twilio_settings')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating Twilio settings:', error);
        throw new Error(`Failed to update Twilio settings: ${error.message}`);
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('twilio_settings')
        .insert({
          user_id: userId,
          ...input,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Twilio settings:', error);
        throw new Error(`Failed to create Twilio settings: ${error.message}`);
      }

      return data;
    }
  },

  async updateCallRecordingSetting(
    userId: string,
    enabled: boolean
  ): Promise<TwilioSettings> {
    return this.createOrUpdateTwilioSettings(userId, {
      call_recording_enabled: enabled,
    });
  },

  async updateVoicemailSetting(
    userId: string,
    enabled: boolean
  ): Promise<TwilioSettings> {
    return this.createOrUpdateTwilioSettings(userId, {
      voicemail_enabled: enabled,
    });
  },

  async getCallRecordings(callLogId: string): Promise<CallRecording[]> {
    const { data, error } = await supabase
      .from('call_recordings')
      .select('*')
      .eq('call_log_id', callLogId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching call recordings:', error);
      throw new Error(`Failed to fetch call recordings: ${error.message}`);
    }

    return data || [];
  },

  async createCallRecording(
    callLogId: string,
    recording: Omit<CallRecording, 'id' | 'call_log_id' | 'created_at'>
  ): Promise<CallRecording> {
    const { data, error } = await supabase
      .from('call_recordings')
      .insert({
        call_log_id: callLogId,
        ...recording,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating call recording:', error);
      throw new Error(`Failed to create call recording: ${error.message}`);
    }

    return data;
  },
};
