import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { ConversationsList } from '../../../modules/crm/components/conversations/ConversationsList';
import { ChatArea } from '../../../shared/components/ChatArea';
import ConversationList from '../components/team-messaging/ConversationList';
import MessageThread from '../components/team-messaging/MessageThread';
import NewMessageModal from '../components/team-messaging/NewMessageModal';
import {
  getTeamConversations,
  getConversationMessages,
  createTeamConversation,
  sendTeamMessage,
  markConversationAsRead,
  getTeamContacts,
  findConversationByParticipants,
} from '../../../shared/store/services/teamMessagingApi';
import { TeamConversationListItem, TeamMessageItem, TeamContact, MessageType } from '../types/teamMessaging';
import { formatDistanceToNow } from 'date-fns';

const ConversationsNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'team-messaging' | 'snippets'>('conversations');

  // Customer Conversations State
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Team Messaging State
  const [teamConversations, setTeamConversations] = useState<TeamConversationListItem[]>([]);
  const [selectedTeamConversationId, setSelectedTeamConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<TeamMessageItem[]>([]);
  const [teamContacts, setTeamContacts] = useState<TeamContact[]>([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [teamMessagingLoading, setTeamMessagingLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Helper functions
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '??';
    return name
      .trim()
      .split(' ')
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#DC2626',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#14B8A6',
      '#F97316',
      '#DC2626',
      '#84CC16',
    ];
    if (!name || name.trim() === '') return colors[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Team Messaging Functions
  const loadTeamConversations = async () => {
    try {
      setTeamMessagingLoading(true);
      const conversations = await getTeamConversations();

      const formattedConversations: TeamConversationListItem[] = conversations.map((conv) => {
        try {
          const participantNames = conv.participants
            .map((p) => p.contact?.full_name)
            .filter(Boolean)
            .join(', ');

          const displayName = conv.is_group
            ? conv.name || `Group (${conv.participants.length})`
            : participantNames || 'Unknown Contact';

          return {
            id: conv.id,
            name: conv.name,
            is_group: conv.is_group,
            participants: conv.participants.map((p) => {
              const fullName = p.contact?.full_name || 'Unknown';
              return {
                id: p.contact?.id || '',
                full_name: fullName,
                first_name: p.contact?.first_name || '',
                last_name: p.contact?.last_name || '',
                email: p.contact?.email || '',
                phone: p.contact?.phone || '',
                type: p.contact?.type as 'staff' | 'sub-contractor',
                initials: getInitials(fullName),
                avatar_color: getAvatarColor(fullName),
              };
            }),
            last_message: conv.last_message?.content || '',
            last_message_time: conv.last_message?.created_at
              ? formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })
              : '',
            unread_count: conv.unread_count || 0,
            display_name: displayName,
            initials: getInitials(displayName),
            avatar_color: getAvatarColor(displayName),
          };
        } catch (error) {
          console.error('Error formatting conversation:', error, conv);
          // Return a safe default conversation object
          return {
            id: conv.id,
            name: conv.name || 'Unknown Conversation',
            is_group: conv.is_group,
            participants: [],
            last_message: '',
            last_message_time: '',
            unread_count: 0,
            display_name: 'Unknown Conversation',
            initials: '??',
            avatar_color: '#DC2626',
          };
        }
      });

      setTeamConversations(formattedConversations);
    } catch (error) {
      console.error('Failed to load team conversations:', error);
      setTeamConversations([]);
    } finally {
      setTeamMessagingLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const messages = await getConversationMessages(conversationId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const formattedMessages: TeamMessageItem[] = messages.map((msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_name: msg.sender?.email || 'Unknown',
        content: msg.content,
        timestamp: msg.created_at,
        is_own_message: msg.sender_id === user?.id,
        is_read: msg.is_read || false,
      }));

      setConversationMessages(formattedMessages);

      // Mark conversation as read
      await markConversationAsRead(conversationId);
      await loadTeamConversations();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadTeamContacts = async () => {
    try {
      const contacts = await getTeamContacts();

      const formattedContacts: TeamContact[] = contacts.map((contact) => {
        const fullName = contact.full_name || 'Unknown Contact';
        return {
          id: contact.id,
          full_name: fullName,
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          type: contact.type as 'staff' | 'sub-contractor',
          initials: getInitials(fullName),
          avatar_color: getAvatarColor(fullName),
        };
      });

      setTeamContacts(formattedContacts);
    } catch (error) {
      console.error('Failed to load team contacts:', error);
      setTeamContacts([]);
    }
  };

  const handleNewMessage = async (
    messageType: MessageType,
    contactIds: string[],
    groupName: string,
    message: string
  ) => {
    try {
      setTeamMessagingLoading(true);

      // For individual messages, check if conversation already exists
      if (messageType === 'individual') {
        const existingConvId = await findConversationByParticipants(contactIds);
        if (existingConvId) {
          // Send message to existing conversation
          await sendTeamMessage({
            conversation_id: existingConvId,
            content: message,
          });
          setSelectedTeamConversationId(existingConvId);
          await loadTeamConversations();
          await loadConversationMessages(existingConvId);
          setShowNewMessageModal(false);
          return;
        }
      }

      // Create new conversation
      const conversation = await createTeamConversation({
        name: messageType === 'group' ? groupName : undefined,
        is_group: messageType === 'group',
        participant_ids: contactIds,
        initial_message: message,
      });

      setSelectedTeamConversationId(conversation.id);
      await loadTeamConversations();
      await loadConversationMessages(conversation.id);
      setShowNewMessageModal(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setTeamMessagingLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedTeamConversationId) return;

    try {
      await sendTeamMessage({
        conversation_id: selectedTeamConversationId,
        content,
      });
      await loadConversationMessages(selectedTeamConversationId);
      await loadTeamConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedTeamConversationId(conversationId);
    await loadConversationMessages(conversationId);
  };

  // Load team messaging data when tab is active
  useEffect(() => {
    if (activeTab === 'team-messaging') {
      loadTeamConversations();
      loadTeamContacts();
    }
  }, [activeTab]);

  // Set up real-time subscription for team messages
  useEffect(() => {
    if (activeTab === 'team-messaging' && selectedTeamConversationId) {
      const subscription = supabase
        .channel(`team_messages:${selectedTeamConversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'team_messages',
            filter: `conversation_id=eq.${selectedTeamConversationId}`,
          },
          () => {
            loadConversationMessages(selectedTeamConversationId);
            loadTeamConversations();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeTab, selectedTeamConversationId]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Top Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'conversations'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('team-messaging')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'team-messaging'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Team Messaging
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'snippets'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Snippets
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex bg-paper dark:bg-canvas overflow-hidden">
        {/* Customer Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="flex-1 flex">
            <ConversationsList
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
            <ChatArea conversationId={selectedConversation} />
          </div>
        )}

        {/* Team Messaging Tab */}
        {activeTab === 'team-messaging' && (
          <div className="flex-1 flex">
            <ConversationList
              conversations={teamConversations}
              selectedConversationId={selectedTeamConversationId}
              onConversationSelect={handleConversationSelect}
              onNewMessage={() => setShowNewMessageModal(true)}
              loading={teamMessagingLoading}
            />
            <MessageThread
              conversationId={selectedTeamConversationId}
              messages={conversationMessages}
              onSendMessage={handleSendMessage}
              loading={messagesLoading}
            />
            {showNewMessageModal && (
              <NewMessageModal
                contacts={teamContacts}
                onClose={() => setShowNewMessageModal(false)}
                onSend={handleNewMessage}
              />
            )}
          </div>
        )}

        {/* Snippets Tab */}
        {activeTab === 'snippets' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Snippets Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Save and reuse common message templates
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsNew;
