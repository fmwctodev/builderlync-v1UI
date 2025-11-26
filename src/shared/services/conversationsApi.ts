import { supabase } from '../lib/supabase';

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
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: conversations, error } = await supabase
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
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  // Get last message and unread count for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count (inbound messages that haven't been marked as read)
      const { count: unreadCount } = await supabase
        .from('conversation_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('direction', 'inbound')
        .neq('delivery_status', 'read');

      return {
        ...conv,
        last_message: lastMessage,
        unread_count: unreadCount || 0,
      };
    })
  );

  return conversationsWithDetails;
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
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
    .eq('id', conversationId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
  const { data: messages, error } = await supabase
    .from('conversation_messages')
    .select(`
      *,
      sender:auth.users(id, email),
      attachments:message_attachments(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return messages || [];
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
