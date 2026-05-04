export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profile?: string;
  companyName?: string;
  companySlug?: string;
}

export interface WorkingHours {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarConnection {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook';
  email: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailConnection {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook';
  email: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  sync_status: 'active' | 'paused' | 'error';
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSignature {
  id: string;
  user_id: string;
  html_content: string;
  plain_text_content: string;
  enable_on_outgoing: boolean;
  include_before_quoted: boolean;
  created_at: string;
  updated_at: string;
}

export interface User2FASettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  secret_key: string | null;
  backup_codes: string[];
  sms_phone: string | null;
  sms_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  private_mode_enabled: boolean;
  meeting_location: string;
  custom_location: string;
  timezone?: string | null;
  bcc_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySchedule {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
