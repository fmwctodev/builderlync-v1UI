// import { Device, Call } from '@twilio/voice-sdk';
import { supabase } from '../lib/supabase';

export interface CallEvent {
  type: 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'error' | 'incoming';
  call?: any;
  error?: Error;
}

class TwilioService {
  private device: any | null = null;
  private activeCall: any | null = null;
  private eventListeners: ((event: CallEvent) => void)[] = [];
  private token: string | null = null;
  private tokenRefreshInterval: number | null = null;

  async initialize(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to get Twilio access token');
      }

      this.token = token;
      // this.device = new Device(token, {
      //   logLevel: 1,
      //   codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      // });

      this.setupDeviceListeners();
      await this.device.register();

      this.startTokenRefresh();

      console.log('Twilio Device initialized and registered');
    } catch (error) {
      console.error('Error initializing Twilio Device:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-twilio-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private startTokenRefresh(): void {
    this.tokenRefreshInterval = window.setInterval(async () => {
      try {
        const token = await this.getAccessToken();
        if (token && this.device) {
          await this.device.updateToken(token);
          this.token = token;
          console.log('Twilio token refreshed');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 50 * 60 * 1000);
  }

  private setupDeviceListeners(): void {
    if (!this.device) return;

    this.device.on('registered', () => {
      console.log('Twilio Device registered');
    });

    this.device.on('error', (error: Error) => {
      console.error('Twilio Device error:', error);
      this.notifyListeners({ type: 'error', error });
    });

    this.device.on('incoming', (call: Call) => {
      console.log('Incoming call from:', call.parameters.From);
      this.activeCall = call;
      this.setupCallListeners(call);
      this.notifyListeners({ type: 'incoming', call });
    });

    this.device.on('unregistered', () => {
      console.log('Twilio Device unregistered');
    });
  }

  private setupCallListeners(call: any): void {
    call.on('accept', () => {
      console.log('Call accepted');
      this.notifyListeners({ type: 'connected', call });
    });

    call.on('disconnect', () => {
      console.log('Call disconnected');
      this.activeCall = null;
      this.notifyListeners({ type: 'disconnected', call });
    });

    call.on('cancel', () => {
      console.log('Call cancelled');
      this.activeCall = null;
      this.notifyListeners({ type: 'disconnected', call });
    });

    call.on('reject', () => {
      console.log('Call rejected');
      this.activeCall = null;
      this.notifyListeners({ type: 'disconnected', call });
    });

    call.on('error', (error: Error) => {
      console.error('Call error:', error);
      this.notifyListeners({ type: 'error', error, call });
    });
  }

  async makeCall(phoneNumber: string, fromNumber?: string): Promise<void> {
    if (!this.device) {
      throw new Error('Twilio Device not initialized');
    }

    try {
      const params: Record<string, string> = {
        To: phoneNumber,
      };

      if (fromNumber) {
        params.From = fromNumber;
      }

      this.notifyListeners({ type: 'connecting' });

      const call = await this.device.connect({ params });
      this.activeCall = call;
      this.setupCallListeners(call);

      await this.logCall({
        from_number: fromNumber || '',
        to_number: phoneNumber,
        direction: 'outbound',
        status: 'in-progress',
        call_sid: call.parameters.CallSid || '',
      });

      console.log('Outbound call initiated to:', phoneNumber);
    } catch (error) {
      console.error('Error making call:', error);
      this.notifyListeners({ type: 'error', error: error as Error });
      throw error;
    }
  }

  acceptCall(): void {
    if (this.activeCall) {
      this.activeCall.accept();
    }
  }

  rejectCall(): void {
    if (this.activeCall) {
      this.activeCall.reject();
      this.activeCall = null;
    }
  }

  hangup(): void {
    if (this.activeCall) {
      this.activeCall.disconnect();
      this.activeCall = null;
    }
  }

  mute(muted: boolean): void {
    if (this.activeCall) {
      this.activeCall.mute(muted);
    }
  }

  sendDigits(digits: string): void {
    if (this.activeCall) {
      this.activeCall.sendDigits(digits);
    }
  }

  getCallStatus(): string | null {
    return this.activeCall?.status() || null;
  }

  isOnCall(): boolean {
    return this.activeCall !== null && this.activeCall.status() === 'open';
  }

  addEventListener(listener: (event: CallEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: CallEvent) => void): void {
    this.eventListeners = this.eventListeners.filter((l) => l !== listener);
  }

  private notifyListeners(event: CallEvent): void {
    this.eventListeners.forEach((listener) => listener(event));
  }

  private async logCall(callData: {
    from_number: string;
    to_number: string;
    direction: string;
    status: string;
    call_sid: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('call_logs').insert({
        user_id: user.id,
        ...callData,
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging call:', error);
    }
  }

  async destroy(): Promise<void> {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }

    if (this.activeCall) {
      this.activeCall.disconnect();
      this.activeCall = null;
    }

    if (this.device) {
      this.device.destroy();
      this.device = null;
    }

    this.eventListeners = [];
    console.log('Twilio Service destroyed');
  }

  getDevice(): any | null {
    return this.device;
  }

  getActiveCall(): any | null {
    return this.activeCall;
  }
}

export const twilioService = new TwilioService();
