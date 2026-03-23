export type ContactStatus = 
  | 'new'
  | 'active'
  | 'inactive'
  | 'archived';

export type ContactSource = 
  | 'website'
  | 'import'
  | 'manual'
  | 'api'
  | 'referral';

export type ContactType =
  | 'Lead'
  | 'Customer'
  | 'Partner'
  | 'Vendor';

export type PhoneType =
  | 'Mobile'
  | 'Work'
  | 'Home'
  | 'Other';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  emails: Array<{ type: string; email: string; primary: boolean; }>;
  phones: Array<{ type: PhoneType; number: string; primary: boolean; }>;
  contact_type: ContactType;
  time_zone?: string;
  status: ContactStatus;
  source: ContactSource;
  assigned_to?: string;
  avatar_url?: string;
  dnd_settings: {
    all_channels: boolean;
    emails: boolean;
    text_messages: boolean;
    calls_voicemails: boolean;
    inbound_calls_sms: boolean;
  };
  created_at: string;
  updated_at: string;
  custom_fields?: Record<string, string | number | Date>;
}

export interface ContactNote {
  id: string;
  contact_id: string;
  user_id: string;
  content: string;
  type: 'note' | 'call' | 'email' | 'task';
  created_at: string;
}

export interface ContactCustomField {
  id: string;
  contact_id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'select';
  field_value: string;
  options?: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus[];
  source?: ContactSource[];
  assignedTo?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  company?: string;
  emails: Array<{ type: string; email: string; primary: boolean; }>;
  phones: Array<{ type: PhoneType; number: string; primary: boolean; }>;
  contact_type: ContactType;
  time_zone?: string;
  status: ContactStatus;
  source: ContactSource;
  assigned_to?: string;
  dnd_settings: {
    all_channels: boolean;
    emails: boolean;
    text_messages: boolean;
    calls_voicemails: boolean;
    inbound_calls_sms: boolean;
  };
  avatar_url?: string;
  custom_fields?: Record<string, string | number | Date>;
}