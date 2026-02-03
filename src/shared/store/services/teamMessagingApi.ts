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
  message_type?: 'sms' | 'email';
  subject?: string;
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

export interface GetConversationsOptions {
  sortBy?: 'name' | 'last_message' | 'created_at' | 'unread_count';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch all conversations for the current user with last message and unread count
 */
export const getTeamConversations = async (options?: GetConversationsOptions): Promise<TeamConversation[]> => {
  try {
    const { smtpApi } = await import('../../services/smtpApi');
    const teams = await smtpApi.getTeams(options);

    // Convert teams to conversation format with last messages
    const teamConversations = await Promise.all(teams.map(async (team: any) => {
      // Convert team_members to participants format
      const participants = (team.team_members || []).map((member: any) => ({
        id: member.id,
        conversation_id: `team_${team.id}`,
        contact_id: member.user_id || member.id,
        joined_at: member.created_at || team.created_at,
        contact: {
          id: member.user_id || member.id,
          full_name: member.email || 'Team Member',
          first_name: '',
          last_name: '',
          email: member.email,
          phone: member.phone,
          type: 'staff'
        }
      }));

      // Try to get last message from conversation_messages
      let lastMessage = undefined;
      try {
        const { getConversationMessages } = await import('../../services/conversationsApi');
        const messages = await getConversationMessages(`team_${team.id}`);
        if (messages && messages.length > 0) {
          const latest = messages[messages.length - 1];
          lastMessage = {
            id: latest.id,
            conversation_id: latest.conversation_id,
            sender_id: latest.sender_id,
            content: latest.subject ? `${latest.subject}: ${latest.content}` : latest.content,
            created_at: latest.created_at,
            updated_at: latest.updated_at
          };
        }
      } catch (error) {
        console.log('No messages found for team:', team.id);
      }

      return {
        id: `team_${team.id}`,
        name: team.name,
        is_group: true,
        created_by: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        participants,
        last_message: lastMessage,
        unread_count: 0
      };
    }));

    // Apply sorting if options provided
    if (options?.sortBy) {
      teamConversations.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (options.sortBy) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'last_message':
            aValue = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            bValue = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'unread_count':
            aValue = a.unread_count || 0;
            bValue = b.unread_count || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return options.sortOrder === 'desc' ? 1 : -1;
        }
        if (aValue > bValue) {
          return options.sortOrder === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    return teamConversations;
  } catch (error) {
    console.error('Error fetching team conversations:', error);
    return [];
  }
};

/**
 * Fetch messages for a specific conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<TeamMessage[]> => {
  try {
    // Check if it's a team conversation
    if (conversationId.startsWith('team_')) {
      // Use the existing conversationsApi to get messages
      const { getConversationMessages: getMessages } = await import('../../services/conversationsApi');
      const messages = await getMessages(conversationId);
      
      return (messages || []).map(message => ({
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
        updated_at: message.updated_at,
        is_read: true,
        message_type: message.message_type,
        subject: message.subject || message.email_metadata?.subject
      }));
    }

    // For non-team conversations, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
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
export const sendTeamMessage = async (request: SendMessageRequest & { messageType?: 'sms' | 'email'; subject?: string }): Promise<TeamMessage> => {
  try {
    // Check if it's a team conversation
    if (request.conversation_id.startsWith('team_')) {
      const teamId = request.conversation_id.replace('team_', '');
      const { smtpApi } = await import('../../services/smtpApi');
      
      // Use the team message API with proper message type
      const messageType = request.messageType || 'sms';
      const subject = request.subject || 'Team Message';
      
      await smtpApi.sendTeamMessage(teamId, subject, request.content, messageType);
      
      return {
        id: Date.now().toString(),
        conversation_id: request.conversation_id,
        sender_id: 'current_user',
        content: request.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // For non-team conversations, return a mock response
    return {
      id: Date.now().toString(),
      conversation_id: request.conversation_id,
      sender_id: 'current_user',
      content: request.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending team message:', error);
    throw error;
  }
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
 * Get staff, sub-contractor, and adjuster contacts for team messaging
 */
export const getTeamContacts = async (): Promise<any[]> => {
  try {
    const { searchContacts } = await import('../../services/conversationsApi');
    const contacts = await searchContacts('');
    return contacts.filter((contact: any) => 
      ['staff', 'sub-contractor', 'adjuster'].includes(contact.type)
    );
  } catch (error) {
    console.error('Error fetching team contacts:', error);
    return [];
  }
};

/**
 * Add a member to an existing team
 */
export const addTeamMember = async (teamId: string, member: { user_id: number; email: string; phone?: string; role?: string }): Promise<any> => {
  try {
    const { smtpApi } = await import('../../services/smtpApi');
    return await smtpApi.addTeamMember(teamId, member);
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
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
