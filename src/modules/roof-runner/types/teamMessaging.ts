export interface TeamContact {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: 'staff' | 'sub-contractor';
  initials: string;
  avatar_color: string;
}

export interface TeamConversationListItem {
  id: string;
  name: string | null;
  is_group: boolean;
  participants: TeamContact[];
  last_message: string;
  last_message_time: string;
  unread_count: number;
  display_name: string;
  initials: string;
  avatar_color: string;
}

export interface TeamMessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  is_own_message: boolean;
  is_read: boolean;
}

export type MessageType = 'individual' | 'group';

export interface NewMessageFormData {
  messageType: MessageType;
  selectedContacts: string[];
  groupName: string;
  message: string;
}
