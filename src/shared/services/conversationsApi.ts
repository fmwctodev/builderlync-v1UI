import { supabase } from '../lib/supabase';
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      contact_id: contactId,
      channel,
      status: 'open',
      user_id: user.id,
    })
    .select(`
      *,
      contact:contacts(
        id,
        full_name,
        email,
        phone,
        first_name,
        last_name
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Find or create a conversation for a contact
 */
export const findOrCreateConversation = async (contactId: string, channel: 'sms' | 'email' = 'sms'): Promise<Conversation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Try to find existing open conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(
        id,
        full_name,
        email,
        phone,
        first_name,
        last_name
      )
    `)
    .eq('contact_id', contactId)
    .eq('channel', channel)
    .eq('status', 'open')
    .maybeSingle();

  if (existing) {
    return existing;
  }

  // Create new conversation
  return createConversation(contactId, channel);
};

/**
 * Send SMS message
 */
export const sendSMS = async (request: SendSMSRequest): Promise<{ success: boolean; message_id?: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send SMS');
  }

  return response.json();
};

/**
 * Send internal comment
 */
export const sendInternalComment = async (request: SendInternalCommentRequest): Promise<ConversationMessage> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: request.conversation_id,
      message_type: 'internal_comment',
      direction: 'outbound',
      sender_id: user.id,
      content: request.message,
      is_internal: true,
      email_metadata: { mentions: request.mentions || [] },
      delivery_status: 'sent',
    })
    .select(`
      *,
      sender:auth.users(id, email)
    `)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Mark conversation messages as read
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  // Skip for mock conversations
  if (conversationId.startsWith('conv_')) {
    return;
  }
  
  const { error } = await supabase
    .from('conversation_messages')
    .update({ delivery_status: 'read' })
    .eq('conversation_id', conversationId)
    .eq('direction', 'inbound')
    .neq('delivery_status', 'read');

  if (error) throw error;
};

/**
 * Update conversation status
 */
export const updateConversationStatus = async (
  conversationId: string,
  status: 'open' | 'closed' | 'archived'
): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) throw error;
};

/**
 * Subscribe to new messages in a conversation
 */
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (message: ConversationMessage) => void
) => {
  // Skip subscription for mock conversations
  if (conversationId.startsWith('conv_')) {
    return {
      unsubscribe: () => {}
    };
  }
  
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as ConversationMessage);
      }
    )
    .subscribe();
};

/**
 * Subscribe to conversation list changes
 */
export const subscribeToConversations = (
  userId: string,
  callback: () => void
) => {
  return supabase
    .channel(`user_conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();
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
