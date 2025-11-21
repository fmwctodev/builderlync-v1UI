import { supabase } from '../../lib/supabase';

export interface TeamConversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: TeamParticipant[];
  last_message?: TeamMessage;
  unread_count?: number;
}

export interface TeamParticipant {
  id: string;
  conversation_id: string;
  contact_id: string;
  joined_at: string;
  contact?: {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    type: string;
  };
}

export interface TeamMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    email: string;
  };
  is_read?: boolean;
}

export interface CreateConversationRequest {
  name?: string;
  is_group: boolean;
  participant_ids: string[];
  initial_message?: string;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
}

/**
 * Fetch all conversations for the current user with last message and unread count
 */
export const getTeamConversations = async (): Promise<TeamConversation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user's contact record
  const { data: userContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get all conversations where user is participant or creator
  const { data: conversations, error } = await supabase
    .from('team_conversations')
    .select(`
      *,
      participants:team_conversation_participants(
        *,
        contact:contacts(*)
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Get last message and unread count for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('team_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unread count for user
      let unreadCount = 0;
      if (userContact) {
        const { data: messages } = await supabase
          .from('team_messages')
          .select('id')
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id);

        if (messages) {
          const messageIds = messages.map(m => m.id);
          const { data: reads } = await supabase
            .from('team_message_reads')
            .select('message_id')
            .eq('contact_id', userContact.id)
            .in('message_id', messageIds);

          const readMessageIds = new Set((reads || []).map(r => r.message_id));
          unreadCount = messageIds.filter(id => !readMessageIds.has(id)).length;
        }
      }

      return {
        ...conv,
        last_message: lastMessage || undefined,
        unread_count: unreadCount,
      };
    })
  );

  return conversationsWithDetails;
};

/**
 * Fetch messages for a specific conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<TeamMessage[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: messages, error } = await supabase
    .from('team_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Get user's contact record to check read status
  const { data: userContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!userContact) return messages || [];

  // Check which messages have been read by this user
  const { data: reads } = await supabase
    .from('team_message_reads')
    .select('message_id')
    .eq('contact_id', userContact.id);

  const readMessageIds = new Set((reads || []).map(r => r.message_id));

  return (messages || []).map(message => ({
    ...message,
    is_read: readMessageIds.has(message.id) || message.sender_id === user.id,
  }));
};

/**
 * Create a new conversation (individual or group)
 */
export const createTeamConversation = async (request: CreateConversationRequest): Promise<TeamConversation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from('team_conversations')
    .insert({
      name: request.name,
      is_group: request.is_group,
      created_by: user.id,
    })
    .select()
    .single();

  if (convError) throw convError;

  // Add participants
  const participants = request.participant_ids.map(contact_id => ({
    conversation_id: conversation.id,
    contact_id,
  }));

  const { error: participantsError } = await supabase
    .from('team_conversation_participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  // Send initial message if provided
  if (request.initial_message) {
    await sendTeamMessage({
      conversation_id: conversation.id,
      content: request.initial_message,
    });
  }

  // Fetch and return the complete conversation
  const conversations = await getTeamConversations();
  const newConversation = conversations.find(c => c.id === conversation.id);
  if (!newConversation) throw new Error('Failed to fetch created conversation');

  return newConversation;
};

/**
 * Send a message in a conversation
 */
export const sendTeamMessage = async (request: SendMessageRequest): Promise<TeamMessage> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: message, error } = await supabase
    .from('team_messages')
    .insert({
      conversation_id: request.conversation_id,
      sender_id: user.id,
      content: request.content,
    })
    .select()
    .single();

  if (error) throw error;

  return message;
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user's contact record
  const { data: userContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!userContact) throw new Error('User contact not found');

  // Insert read record (ignore if already exists due to unique constraint)
  await supabase
    .from('team_message_reads')
    .insert({
      message_id: messageId,
      contact_id: userContact.id,
    });
};

/**
 * Mark all messages in a conversation as read
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user's contact record
  const { data: userContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!userContact) throw new Error('User contact not found');

  // Get all unread messages in this conversation
  const { data: messages } = await supabase
    .from('team_messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id);

  if (!messages || messages.length === 0) return;

  // Get already read messages
  const messageIds = messages.map(m => m.id);
  const { data: reads } = await supabase
    .from('team_message_reads')
    .select('message_id')
    .eq('contact_id', userContact.id)
    .in('message_id', messageIds);

  const readMessageIds = new Set((reads || []).map(r => r.message_id));
  const unreadMessageIds = messageIds.filter(id => !readMessageIds.has(id));

  if (unreadMessageIds.length === 0) return;

  // Mark unread messages as read
  const readRecords = unreadMessageIds.map(message_id => ({
    message_id,
    contact_id: userContact.id,
  }));

  await supabase
    .from('team_message_reads')
    .insert(readRecords);
};

/**
 * Get staff and sub-contractor contacts for team messaging
 */
export const getTeamContacts = async (): Promise<any[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['staff', 'sub-contractor'])
    .order('full_name', { ascending: true });

  if (error) throw error;

  return contacts || [];
};

/**
 * Search for a conversation with specific participants
 * Returns null if no conversation exists
 */
export const findConversationByParticipants = async (participantIds: string[]): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get all conversations
  const { data: conversations } = await supabase
    .from('team_conversations')
    .select(`
      id,
      is_group,
      participants:team_conversation_participants(contact_id)
    `);

  if (!conversations) return null;

  // Find conversation with exact participant match
  const sortedParticipantIds = [...participantIds].sort();

  for (const conv of conversations) {
    const convParticipantIds = conv.participants.map((p: any) => p.contact_id).sort();

    // For individual conversations, check if it's not a group and has matching participants
    if (!conv.is_group &&
        convParticipantIds.length === sortedParticipantIds.length &&
        convParticipantIds.every((id: string, idx: number) => id === sortedParticipantIds[idx])) {
      return conv.id;
    }
  }

  return null;
};
