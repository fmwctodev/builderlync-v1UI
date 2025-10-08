import { Contact } from './contacts';

export type EventType = 'meeting' | 'call' | 'task' | 'reminder' | 'blocked';
export type EventStatus = 'confirmed' | 'pending' | 'canceled';
export type ReminderType = 'notification' | 'email';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: EventType;
  contact_id?: string;
  contact?: Contact;
  location?: string;
  status?: EventStatus;
  opportunity_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: EventParticipant[];
  reminders?: EventReminder[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: EventStatus;
  created_at: string;
}

export interface EventReminder {
  id: string;
  event_id: string;
  reminder_time: string;
  reminder_type: ReminderType;
  created_at: string;
}

export interface CalendarViewState {
  view: 'month' | 'week' | 'day';
  date: Date;
}

export interface EventFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: EventType;
  contact_id?: string;
  contact?: Contact;
  location?: string;
  status?: EventStatus;
  opportunity_id?: string;
  participants?: string[];
  reminders?: {
    reminder_time: string;
    reminder_type: ReminderType;
  }[];
}