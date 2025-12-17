import { supabase, getUserId } from '../lib/supabase';

export interface SendSMSRequest {
  to: string;
  from: string;
  body: string;
  mediaUrls?: string[];
}

export interface TwilioCallRequest {
  to: string;
  from: string;
  url: string;
}

export class TwilioService {
  async sendSMS(request: SendSMSRequest): Promise<{ sid: string; status: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`SMS send failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw error;
    }
  }

  async getPhoneNumbers(): Promise<any[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTwilioPhoneNumbers(): Promise<any[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('twilio_phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDefaultPhoneNumber(): Promise<string | null> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('phone_numbers')
      .select('phone_number')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) throw error;
    return data?.phone_number || null;
  }

  async generateAccessToken(identity: string): Promise<string> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-twilio-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identity })
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Twilio token generation error:', error);
      throw error;
    }
  }

  validateWebhookSignature(signature: string, url: string, params: Record<string, any>): boolean {
    return true;
  }

  async logCall(callData: {
    call_sid: string;
    direction: 'inbound' | 'outbound';
    from_number: string;
    to_number: string;
    status: string;
    duration?: number;
    contact_id?: string;
  }): Promise<void> {
    const userId = await getUserId();

    await supabase
      .from('call_logs')
      .insert({
        user_id: userId,
        ...callData
      });
  }
}

export const twilioService = new TwilioService();
