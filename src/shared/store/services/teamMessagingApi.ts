// Supabase direct access removed - using backend API via services

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
      const participants = (team.team_members || []).map((member: any) => {
        const user = member.user || {};
        const fullName = user.first_name || user.last_name
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : (member.email || 'Team Member');

        return {
          id: member.id.toString(),
          conversation_id: `team_${team.id}`,
          contact_id: (member.user_id || member.id).toString(),
          joined_at: member.created_at || team.created_at,
          contact: {
            id: (member.user_id || member.id).toString(),
            full_name: fullName,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || member.email || '',
            phone: member.phone || '',
            type: member.role === 'admin' ? 'staff' : (member.type || 'staff'),
            profile: user.profile
          }
        };
      });



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
            sender_id: latest.sender_id || 'system',
            content: (latest as any).subject ? `${(latest as any).subject}: ${latest.content}` : latest.content,
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
        sender_id: message.sender_id || 'unknown',
        content: message.content,
        created_at: message.created_at,
        updated_at: message.updated_at,
        is_read: true,
        message_type: (message.message_type === 'sms' || message.message_type === 'email')
          ? message.message_type
          : undefined,
        subject: (message as any).subject || (message as any).email_metadata?.subject
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
 * Now uses the backend teams API
 */
export const createTeamConversation = async (request: CreateConversationRequest): Promise<TeamConversation> => {
  const { smtpApi } = await import('../../services/smtpApi');

  // Format members for backend
  const members = request.participant_ids.map(id => ({
    user_id: id,
    email: '', // Backend will populate or lookup
    phone: '',
    role: 'member'
  }));

  const team = await smtpApi.createTeam(
    request.name || (request.is_group ? 'New Group' : 'Individual Chat'),
    'Team messaging conversation',
    members
  );

  // Send initial message if provided
  if (request.initial_message) {
    await sendTeamMessage({
      conversation_id: `team_${team.id}`,
      content: request.initial_message,
    });
  }

  // Fetch the created conversation in the required format
  const conversations = await getTeamConversations();
  const newConversation = conversations.find(c => c.id === `team_${team.id}`);

  if (!newConversation) {
    throw new Error('Failed to retrieve created team conversation');
  }

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
  console.warn('Backend markMessageAsRead endpoint not yet implemented. messageId:', messageId);
};

/**
 * Mark all messages in a conversation as read
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    const { getAuthToken } = await import('../../utils/auth');
    const token = getAuthToken();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

    // Attempt to use general conversation mark-read if applicable
    await fetch(`${API_BASE_URL}/conversations/${conversationId}/mark-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error('Failed to mark conversation read on backend', err);
  }
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
 */
export const findConversationByParticipants = async (participantIds: string[]): Promise<string | null> => {
  // Logic should probably move to backend to find existing team with same members
  console.warn('findConversationByParticipants backend lookup not yet implemented. participants:', participantIds);
  return null;
};
