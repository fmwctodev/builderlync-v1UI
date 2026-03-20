import { getAuthToken } from '../utils/auth';

export interface Conversation {
  id: string;
  contact_id: string;
  subject: string | null;
  channel: 'sms' | 'email' | 'phone' | 'web';
  status: 'open' | 'closed' | 'archived';
  assigned_to: string | null;
  user_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  last_message?: ConversationMessage;
  unread_count?: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  message_type: 'sms' | 'mms' | 'email' | 'internal_comment';
  direction: 'inbound' | 'outbound';
  sender_id: string | null;
  content: string;
  is_internal: boolean;
  email_metadata: Record<string, any>;
  sms_metadata: Record<string, any>;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  external_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    email: string;
  };
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  url: string | null;
  created_at: string;
}

export interface SendSMSRequest {
  conversation_id: string;
  to_number: string;
  from_number?: string;
  message: string;
  media_urls?: string[];
}

export interface SendEmailRequest {
  conversation_id: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  message: string;
  from_email?: string;
  from_name?: string;
}

export interface SendInternalCommentRequest {
  conversation_id: string;
  message: string;
  mentions?: string[];
}

/**
 * Get all conversations for the current user with filters
 */
export const getConversations = async (filters?: {
  status?: 'open' | 'closed' | 'archived' | 'all';
  channel?: 'sms' | 'email' | 'phone' | 'web' | 'all';
  sortBy?: 'latest' | 'oldest' | 'name' | 'unread';
  search?: string;
}): Promise<Conversation[]> => {
  const token = getAuthToken();
  if (!token) {
    console.error('No auth token found');
    throw new Error('Not authenticated');
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.channel && filters.channel !== 'all') params.append('channel', filters.channel);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/conversations${queryString ? `?${queryString}` : ''}`;

  console.log('Fetching conversations with filters:', filters);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('API Response:', response.status, response.statusText);
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Failed to get conversations: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  console.log('Getting conversation:', conversationId);

  // Handle mock conversation IDs
  if (conversationId.startsWith('conv_')) {
    const contactId = conversationId.replace('conv_', '').split('_')[0];
    console.log('Extracting contact ID:', contactId);

    try {
      const token = getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

      const response = await fetch(`${API_BASE_URL}/conversations/contacts/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch contact');
        return null;
      }

      const contact = await response.json();
      console.log('Contact data:', contact);

      return {
        id: conversationId,
        contact_id: contact.id.toString(),
        subject: null,
        channel: 'sms',
        status: 'open',
        assigned_to: null,
        user_id: contact.created_by?.toString() || 'mock_user',
        last_message_at: contact.created_at,
        created_at: contact.created_at,
        updated_at: contact.created_at,
        contact: {
          id: contact.id.toString(),
          full_name: contact.full_name || 'Unknown Contact',
          email: contact.email || null,
          phone: contact.phone || null,
          first_name: contact.full_name?.split(' ')[0] || '',
          last_name: contact.full_name?.split(' ').slice(1).join(' ') || ''
        }
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  return null;
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
  try {
    const token = getAuthToken();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch messages');
      return [];
    }

    const messages = await response.json();
    return messages.map((msg: any) => ({
      id: msg.id.toString(),
      conversation_id: msg.conversation_id,
      message_type: msg.message_type,
      direction: msg.direction,
      sender_id: msg.sender_id?.toString(),
      content: msg.content,
      is_internal: false,
      email_metadata: msg.subject ? { subject: msg.subject } : {},
      sms_metadata: {},
      delivery_status: msg.delivery_status,
      external_id: null,
      created_at: msg.created_at,
      updated_at: msg.updated_at
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }


};

/**
 * Create a new conversation
 */
export const createConversation = async (contactId: string, channel: 'sms' | 'email' = 'sms'): Promise<Conversation> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact_id: contactId, channel }),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return response.json();
};

/**
 * Find or create a conversation for a contact
 */
export const findOrCreateConversation = async (contactId: string, channel: 'sms' | 'email' = 'sms'): Promise<Conversation> => {
  // Current backend logic will create/find based on contact_id
  return createConversation(contactId, channel);
};

/**
 * Send SMS message
 */
export const sendSMS = async (request: SendSMSRequest): Promise<{ success: boolean; message_id?: string }> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
  const response = await fetch(`${API_BASE_URL}/conversations/send-sms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact_id: request.conversation_id.replace('conv_', ''), // Simple mapping for now
      message: request.message
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send SMS');
  }

  return response.json();
};

/**
 * Send internal comment
 */
export const sendInternalComment = async (_request: SendInternalCommentRequest): Promise<ConversationMessage> => {
  // Logic not yet implemented in backend, returning mock or throwing
  throw new Error('Internal comments not implemented in backend yet');
};

/**
 * Mark conversation messages as read
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/mark-read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to mark conversation as read');
  }
};

/**
 * Update conversation status
 */
export const updateConversationStatus = async (
  _conversationId: string,
  _status: 'open' | 'closed' | 'archived'
): Promise<void> => {
  // Needs backend update, for now NO-OP or error
  console.warn('updateConversationStatus not yet implemented in backend');
};

/**
 * Subscribe to new messages (Supabase direct disabled)
 */
export const subscribeToConversationMessages = (
  _conversationId: string,
  _callback: (message: ConversationMessage) => void
) => {
  console.warn('Supabase Realtime disabled. Reverting to polling or no-op.');
  return { unsubscribe: () => { } };
};

/**
 * Subscribe to conversation list changes (Supabase direct disabled)
 */
export const subscribeToConversations = (
  _userId: string,
  _callback: () => void
) => {
  console.warn('Supabase Realtime disabled. Reverting to polling or no-op.');
  return { unsubscribe: () => { } };
};

/**
 * Search contacts
 */
export const searchContacts = async (query: string) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
  const response = await fetch(`${API_BASE_URL}/conversations/contacts/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search contacts');
  }

  return response.json();
};

/**
 * Create new contact
 */
export const createContact = async (contactData: { full_name: string; email?: string; phone?: string }) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
  const response = await fetch(`${API_BASE_URL}/conversations/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error('Failed to create contact');
  }

  return response.json();
};

/**
 * Create conversation via API
 */
export const createConversationAPI = async (contactId: string, channel: string = 'sms') => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact_id: contactId, channel }),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return response.json();
};
