import React, { useState, useEffect } from 'react';
import { ConversationsList } from '../../../modules/crm/components/conversations/ConversationsList';
import { ChatArea } from '../../../shared/components/ChatArea';
import ConversationList from '../components/team-messaging/ConversationList';
import MessageThread from '../components/team-messaging/MessageThread';
import { CreateTeamModal } from '../../../shared/components/CreateTeamModal';
import { AddMemberModal } from '../../../shared/components/AddMemberModal';
import { SnippetsPanel } from '../../../modules/crm/components/conversations/SnippetsPanel';
import {
  getTeamConversations,
  getConversationMessages,
  sendTeamMessage,
} from '../../../shared/store/services/teamMessagingApi';
import { TeamConversationListItem, TeamMessageItem } from '../types/teamMessaging';
import { formatDistanceToNow } from 'date-fns';

const ConversationsNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'team-messaging' | 'snippets'>('conversations');

  // Customer Conversations State
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Team Messaging State
  const [teamConversations, setTeamConversations] = useState<TeamConversationListItem[]>([]);
  const [selectedTeamConversationId, setSelectedTeamConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<TeamMessageItem[]>([]);

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<{ id: string; name: string; existingMembers?: string[] } | null>(null);
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
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#14B8A6',
      '#F97316',
      '#6366F1',
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
            avatar_color: '#3B82F6',
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

      const formattedMessages: TeamMessageItem[] = messages.map((msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_name: 'User',
        content: msg.content,
        timestamp: msg.created_at,
        is_own_message: true,
        is_read: msg.is_read || false,
        message_type: msg.message_type || 'sms',
        subject: msg.subject
      }));

      setConversationMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadTeamContacts = async () => {
    try {
      // Team contacts loading is handled by CreateTeamModal
    } catch (error) {
      console.error('Failed to load team contacts:', error);
    }
  };



  const handleSendMessage = async (content: string, messageType: 'sms' | 'email' | 'team' = 'team', subject?: string) => {
    if (!selectedTeamConversationId) return;

    // Convert 'team' to 'sms' for API compatibility
    const apiMessageType: 'sms' | 'email' = messageType === 'team' ? 'sms' : messageType;

    // Add message instantly to UI
    const newMessage: TeamMessageItem = {
      id: Date.now().toString(),
      conversation_id: selectedTeamConversationId,
      sender_id: 'current_user',
      sender_name: 'You',
      content,
      timestamp: new Date().toISOString(),
      is_own_message: true,
      is_read: true,
      message_type: messageType,
      subject
    };
    
    setConversationMessages(prev => [...prev, newMessage]);

    try {
      await sendTeamMessage({
        conversation_id: selectedTeamConversationId,
        content,
        messageType: apiMessageType,
        subject
      });
      await loadTeamConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleCloseNormalConversation = () => {
    setSelectedConversation(null);
  };

  const handleCloseConversation = () => {
    setSelectedTeamConversationId(null);
    setConversationMessages([]);
  };

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedTeamConversationId(conversationId);
    await loadConversationMessages(conversationId);
  };

  const handleAddMember = (teamId: string) => {
    const team = teamConversations.find(t => t.id === `team_${teamId}`);
    if (team) {
      setSelectedTeamForMember({ 
        id: teamId, 
        name: team.name || 'Team',
        existingMembers: team.participants.map(p => p.id)
      });
      setShowAddMemberModal(true);
    }
  };

  const handleMemberAdded = async () => {
    await loadTeamConversations();
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const { smtpApi } = await import('../../../shared/services/smtpApi');
      await smtpApi.deleteTeam(teamId);
      await loadTeamConversations();
      
      // Clear selection if deleted team was selected
      if (selectedTeamConversationId === `team_${teamId}`) {
        setSelectedTeamConversationId(null);
        setConversationMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  // Load team messaging data when tab is active
  useEffect(() => {
    if (activeTab === 'team-messaging') {
      loadTeamConversations();
    }
  }, [activeTab]);



  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Top Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'conversations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('team-messaging')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'team-messaging'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Team Messaging
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'snippets'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Snippets
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Customer Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="flex-1 flex">
            <ConversationsList
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
            <ChatArea 
              conversationId={selectedConversation} 
              onCloseConversation={handleCloseNormalConversation}
            />
          </div>
        )}

        {/* Team Messaging Tab */}
        {activeTab === 'team-messaging' && (
          <div className="flex-1 flex">
            <ConversationList
              conversations={teamConversations}
              selectedConversationId={selectedTeamConversationId}
              onConversationSelect={handleConversationSelect}
              onNewMessage={() => setShowCreateTeamModal(true)}
              onDeleteTeam={handleDeleteTeam}
              onAddMember={handleAddMember}
              loading={teamMessagingLoading}
            />
            <MessageThread
              conversationId={selectedTeamConversationId}
              messages={conversationMessages}
              onSendMessage={handleSendMessage}
              onCloseConversation={handleCloseConversation}
              loading={messagesLoading}
            />
            <CreateTeamModal
              isOpen={showCreateTeamModal}
              onClose={() => setShowCreateTeamModal(false)}
              onTeamCreated={() => {
                setShowCreateTeamModal(false);
                loadTeamConversations();
              }}
            />
            
            {selectedTeamForMember && (
              <AddMemberModal
                isOpen={showAddMemberModal}
                onClose={() => {
                  setShowAddMemberModal(false);
                  setSelectedTeamForMember(null);
                }}
                teamId={selectedTeamForMember.id}
                teamName={selectedTeamForMember.name}
                existingMembers={selectedTeamForMember.existingMembers || []}
                onMemberAdded={handleMemberAdded}
              />
            )}
          </div>
        )}

        {/* Snippets Tab */}
        {activeTab === 'snippets' && (
          <div className="flex-1">
            <SnippetsPanel
              isOpen={true}
              onClose={() => {}}
              onSelectSnippet={(snippet) => {
                console.log('Selected snippet:', snippet);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsNew;
