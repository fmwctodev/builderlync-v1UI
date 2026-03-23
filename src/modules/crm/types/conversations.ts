export type Channel = 'email' | 'sms' | 'call';
export type Direction = 'inbound' | 'outbound';
export type ConversationStatus = 'active' | 'archived';
export type MessageType = 'email' | 'sms' | 'call_log';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  avatar_url?: string;
}

export interface Conversation {
  id: string;
  contact_id: string;
  contact?: Contact;
  channel: Channel;
  direction: Direction;
  status: ConversationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  message_type: MessageType;
  sent_by: string;
  sender?: User;
  sent_at: string;
  status: MessageStatus;
}

export interface ConversationFilters {
  search?: string;
  channel?: Channel;
  status?: ConversationStatus;
  contactId?: string;
}

export interface NewMessageData {
  conversation_id: string;
  content: string;
  message_type: MessageType;
}

export interface VerificationStatus {
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneVerifiedAt?: string;
  emailVerifiedAt?: string;
}