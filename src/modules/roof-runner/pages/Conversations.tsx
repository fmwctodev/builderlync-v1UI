import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MoreHorizontal, Phone, Mail, Plus, Send, Paperclip, Smile, DollarSign, Archive, Trash2, ChevronDown, Edit } from 'lucide-react';
import { getContacts } from '../../../shared/store/services/contactsApi';
import { getStaff } from '../../../shared/store/services/staffApi';
import { getTeamConversations, getConversationMessages, createTeamConversation, sendTeamMessage, markConversationAsRead, getTeamContacts, findConversationByParticipants } from '../../../shared/store/services/teamMessagingApi';
import { supabase } from '../../../shared/lib/supabase';
import ConversationList from '../components/team-messaging/ConversationList';
import MessageThread from '../components/team-messaging/MessageThread';
import NewMessageModal from '../components/team-messaging/NewMessageModal';
import { TeamConversationListItem, TeamMessageItem, TeamContact, MessageType } from '../types/teamMessaging';
import { formatDistanceToNow } from 'date-fns';

interface Contact {
  id: number;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string;
}

interface Message {
  id: number;
  type: 'system' | 'received' | 'sent';
  content: string;
  subContent?: string;
  time: string;
  date?: string;
  showMore?: boolean;
  sender?: string;
}

const Conversations: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState(0);
  const [activeTab, setActiveTab] = useState('conversations');
  const [snippetView, setSnippetView] = useState('all-snippets');
  const [inboxTab, setInboxTab] = useState('unread');
  const [message, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('SMS');
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showSnippetOptions, setShowSnippetOptions] = useState(false);
  const [showTextSnippetModal, setShowTextSnippetModal] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [snippetBody, setSnippetBody] = useState('');
  const [snippetUrl, setSnippetUrl] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [showEmailSnippetModal, setShowEmailSnippetModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedContactForMessage, setSelectedContactForMessage] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showGroupMessageModal, setShowGroupMessageModal] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  // Team Messaging State
  const [teamConversations, setTeamConversations] = useState<TeamConversationListItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<TeamMessageItem[]>([]);
  const [teamContacts, setTeamContacts] = useState<TeamContact[]>([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [teamMessagingLoading, setTeamMessagingLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const contacts = [
    {
      id: 1,
      name: 'Tri Tran C/o Care Trust REIT',
      initials: 'TT',
      lastMessage: "Let's do that, talk in the morning",
      time: '2:23 AM',
      unread: true,
      avatar: '#3B82F6'
    },
    {
      id: 2,
      name: 'Mountain Solutions',
      initials: 'MS',
      lastMessage: 'Hi there 🙂 Getting 25+ roofing',
      time: '4:13 AM',
      unread: true,
      avatar: '#EF4444'
    },
    {
      id: 3,
      name: '(512) 632-1109',
      initials: 'G',
      lastMessage: 'Hey Answered A Call TerryYour',
      time: '12:53 AM',
      unread: true,
      avatar: '#10B981'
    },
    {
      id: 4,
      name: 'Barla Diane',
      initials: 'BD',
      lastMessage: 'Hi Cal',
      time: '12:51 AM',
      unread: false,
      avatar: '#F59E0B'
    },
    {
      id: 5,
      name: 'Kelsey Kearny',
      initials: 'KK',
      lastMessage: 'Hi Cal',
      time: 'Oct 14',
      unread: false,
      avatar: '#8B5CF6'
    }
  ];

  const contactMessages: Record<number, Message[]> = {
    1: [
      {
        id: 1,
        type: 'system',
        content: 'Opportunity created',
        subContent: 'Tri Tran c/o Care Trust REIT created in stage Proposal Sent',
        time: '02:20 AM',
        date: 'Oct 18, 2025, 2:16 AM'
      },
      {
        id: 2,
        type: 'system',
        content: 'Opportunity updated',
        subContent: 'Tri Tran c/o Care Trust REIT moved from...',
        time: '02:25 AM',
        showMore: true
      },
      {
        id: 3,
        type: 'received',
        content: "Let's do that, talk in the morning. Thanks Jeffery and enjoy dinner with family! 😊",
        time: 'Oct 16, 2025, 6:23 AM',
        sender: 'Tri Tran C/o Ca...'
      },
      {
        id: 4,
        type: 'sent',
        content: 'Orchard Park Kyle - Tarrytown Inspection & Proposal',
        time: 'Oct 18, 2025, 2:16 AM'
      }
    ],
    2: [
      {
        id: 1,
        type: 'received',
        content: 'Hi there 🙂 Getting 25+ roofing quotes for our properties',
        time: 'Oct 18, 2025, 4:13 AM',
        sender: 'Mountain Solutions'
      },
      {
        id: 2,
        type: 'sent',
        content: 'Great! We\'d love to help with your roofing needs. Can you tell me more about the properties?',
        time: 'Oct 18, 2025, 4:15 AM'
      }
    ],
    3: [
      {
        id: 1,
        type: 'received',
        content: 'Hey Answered A Call Terry Your',
        time: 'Oct 18, 2025, 12:53 AM',
        sender: '(512) 632-1109'
      }
    ],
    4: [
      {
        id: 1,
        type: 'received',
        content: 'Hi Cal',
        time: 'Oct 17, 2025, 12:51 AM',
        sender: 'Barla Diane'
      }
    ],
    5: [
      {
        id: 1,
        type: 'received',
        content: 'Hi Cal',
        time: 'Oct 14, 2025, 10:30 AM',
        sender: 'Kelsey Kearny'
      }
    ]
  };

  const currentMessages = contactMessages[contacts[selectedContact]?.id] || [];
  const currentContact = contacts[selectedContact];

  const channels = ['SMS', 'Email'];

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await getStaff();
        setStaffMembers(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      }
    };
    
    const fetchContacts = async () => {
      try {
        const response = await getContacts();
        console.log("response", response);
        setContactsList(response.data?.contacts || []);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };
    
    fetchStaff();
    fetchContacts();
  }, []);

  // Team Messaging Functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const loadTeamConversations = async () => {
    try {
      setTeamMessagingLoading(true);
      const conversations = await getTeamConversations();

      const formattedConversations: TeamConversationListItem[] = conversations.map(conv => {
        const participantNames = conv.participants
          .map(p => p.contact?.full_name)
          .filter(Boolean)
          .join(', ');

        const displayName = conv.is_group
          ? conv.name || `Group (${conv.participants.length})`
          : participantNames;

        return {
          id: conv.id,
          name: conv.name,
          is_group: conv.is_group,
          participants: conv.participants.map(p => ({
            id: p.contact?.id || '',
            full_name: p.contact?.full_name || '',
            first_name: p.contact?.first_name || '',
            last_name: p.contact?.last_name || '',
            email: p.contact?.email || '',
            phone: p.contact?.phone || '',
            type: p.contact?.type as 'staff' | 'sub-contractor',
            initials: getInitials(p.contact?.full_name || ''),
            avatar_color: getAvatarColor(p.contact?.full_name || ''),
          })),
          last_message: conv.last_message?.content || '',
          last_message_time: conv.last_message?.created_at
            ? formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })
            : '',
          unread_count: conv.unread_count || 0,
          display_name: displayName,
          initials: getInitials(displayName),
          avatar_color: getAvatarColor(displayName),
        };
      });

      setTeamConversations(formattedConversations);
    } catch (error) {
      console.error('Failed to load team conversations:', error);
    } finally {
      setTeamMessagingLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const messages = await getConversationMessages(conversationId);
      const { data: { user } } = await supabase.auth.getUser();

      const formattedMessages: TeamMessageItem[] = messages.map(msg => ({
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

      const formattedContacts: TeamContact[] = contacts.map(contact => ({
        id: contact.id,
        full_name: contact.full_name,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        type: contact.type as 'staff' | 'sub-contractor',
        initials: getInitials(contact.full_name),
        avatar_color: getAvatarColor(contact.full_name),
      }));

      setTeamContacts(formattedContacts);
    } catch (error) {
      console.error('Failed to load team contacts:', error);
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
          setSelectedConversationId(existingConvId);
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

      setSelectedConversationId(conversation.id);
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
    if (!selectedConversationId) return;

    try {
      await sendTeamMessage({
        conversation_id: selectedConversationId,
        content,
      });
      await loadConversationMessages(selectedConversationId);
      await loadTeamConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    await loadConversationMessages(conversationId);
  };

  // Load team messaging data when tab is active
  useEffect(() => {
    if (activeTab === 'team-messaging') {
      loadTeamConversations();
      loadTeamContacts();
    }
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conversations</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'conversations'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('team-messaging')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'team-messaging'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Team Messaging
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'snippets'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Snippets
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex bg-gray-50 dark:bg-gray-900">
        {activeTab === 'conversations' && (
          <>
            {/* Left Sidebar - Contact List */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tri Tran C/o Care Trust REIT</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Star size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Archive size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Trash2 size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                    <button 
                      onClick={() => setShowCreateMessageModal(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-4">
                  {['Unread', 'Recents', 'Starred', 'All'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInboxTab(tab.toLowerCase())}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        inboxTab === tab.toLowerCase()
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Filter size={16} />
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  <span className="bg-red-600 text-white px-2 py-1 rounded dark:bg-red-700">NEW RESULTS</span>
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto">
                {contacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(index)}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedContact === index ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: contact.avatar }}
                      >
                        {contact.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {contact.name}
                          </p>
                          <span className="text-xs text-gray-500">{contact.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread && (
                        <div className="w-2 h-2 bg-red-600 rounded-full dark:bg-red-500"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: currentContact?.avatar || '#3B82F6' }}
                    >
                      {currentContact?.initials || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {currentContact?.name || 'Select a contact'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {currentContact?.id === 1 ? 'ttran@caretrusteit.com' : 
                         currentContact?.id === 2 ? 'info@mountainsolutions.com' :
                         currentContact?.id === 3 ? '(512) 632-1109' :
                         currentContact?.id === 4 ? 'barla.diane@email.com' :
                         currentContact?.id === 5 ? 'kelsey.kearny@email.com' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg: Message) => (
                  <div key={msg.id}>
                    {msg.type === 'system' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900">
                          <div className="w-2 h-2 bg-red-600 rounded-full dark:bg-red-400"></div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-red-50 p-3 rounded-lg dark:bg-red-900/20">
                            <p className="text-sm font-medium text-red-900 dark:text-red-200">
                              {msg.content}
                            </p>
                            <p className="text-sm text-red-700 mt-1 dark:text-red-300">
                              {msg.subContent}
                            </p>
                            {msg.showMore && (
                              <button className="text-sm text-red-600 hover:text-red-800 mt-1 dark:text-red-400 dark:hover:text-red-300">
                                Show more
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                        </div>
                        <button className="text-red-600 text-sm hover:underline dark:text-red-400">
                          View opportunity
                        </button>
                      </div>
                    )}
                    
                    {msg.type === 'received' && (
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: currentContact?.avatar || '#3B82F6' }}
                        >
                          {currentContact?.initials || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-lg max-w-md">
                            <p className="text-sm text-gray-900 dark:text-white">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    )}

                    {msg.type === 'sent' && (
                      <div className="flex items-start justify-end space-x-3">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-red-600 text-white p-3 rounded-lg max-w-md dark:bg-red-700">
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                {/* Channel Selection */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {channels.map((channel) => (
                      <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          activeChannel === channel
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      Internal Comment
                    </button>
                  </div>
                </div>

                {/* Email Form */}
                {/* {activeChannel === 'Email' && ( */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">From Name:</label>
                        <input
                          type="text"
                          value=""
                          placeholder="Enter Full Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">From email:</label>
                        <input
                          type="email"
                          placeholder="Enter Email Address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">To:</label>
                        <div className="flex items-center space-x-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm dark:bg-red-900 dark:text-red-200">
                            {currentContact?.id === 1 ? 'ttran@caretrusteit.com (Primary)' : 
                             currentContact?.id === 2 ? 'info@mountainsolutions.com (Primary)' :
                             currentContact?.id === 3 ? '(512) 632-1109 (Primary)' :
                             currentContact?.id === 4 ? 'barla.diane@email.com (Primary)' :
                             currentContact?.id === 5 ? 'kelsey.kearny@email.com (Primary)' : 'No email'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-sm text-gray-600 hover:text-gray-800">CC</button>
                        <button className="text-sm text-gray-600 hover:text-gray-800">BCC</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Subject:</label>
                      <input
                        type="text"
                        placeholder="Type a message"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                {/* )} */}

                {/* Message Input */}
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Paperclip size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Smile size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <DollarSign size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">0 word</span>
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-800">
                      Clear
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 dark:bg-red-700 dark:hover:bg-red-600">
                      <span>Send</span>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Contact Details */}
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentContact?.name || 'Select a contact'}
                  </h3>
                  <button className="text-primary-600 hover:text-primary-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                        <button className="text-primary-600 hover:text-primary-800">
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentContact?.id === 1 ? 'ttran@caretrusteit.com' : 
                         currentContact?.id === 2 ? 'info@mountainsolutions.com' :
                         currentContact?.id === 3 ? '(512) 632-1109' :
                         currentContact?.id === 4 ? 'barla.diane@email.com' :
                         currentContact?.id === 5 ? 'kelsey.kearny@email.com' : 'No email'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                        <button className="text-primary-600 hover:text-primary-800">
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentContact?.id === 1 ? '(714) 280-2680' : 
                         currentContact?.id === 2 ? '(555) 123-4567' :
                         currentContact?.id === 3 ? '(512) 632-1109' :
                         currentContact?.id === 4 ? '(555) 987-6543' :
                         currentContact?.id === 5 ? '(555) 456-7890' : 'No phone'}
                      </p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Owner (Assigned to)
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white">
                      <option>Unassigned</option>
                    </select>
                  </div>

                  {/* Followers */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Followers
                    </label>
                    <input
                      type="text"
                      placeholder="Search followers"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Tags */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tags</span>
                      <button className="text-primary-600 hover:text-primary-800">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Active Automations */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Active Automations
                    </span>
                  </div>

                  {/* DND Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">DND</h4>
                    <div className="space-y-3">
                      {[
                        'DND All',
                        'DND Calls & Voicemails', 
                        'DND Text Messages',
                        'DND Emails',
                        'DND Incoming'
                      ].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add opportunity by zapier */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <button className="text-sm text-primary-600 hover:text-primary-800">
                      Add opportunity by zapier
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Wed Oct 15 2025 03:20:45
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'snippets' && (
          <div className="flex-1 bg-white dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Snippets</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create snippets to quickly insert predefined content into messages for faster, consistent communication.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSnippetView('all-snippets')}
                    className={`px-4 py-2 rounded text-sm ${
                      snippetView === 'all-snippets' ? 'text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    style={snippetView === 'all-snippets' ? {backgroundColor: '#dc2626'} : {}}
                  >
                    All Snippets
                  </button>
                  <button 
                    onClick={() => setSnippetView('folders')}
                    className={`px-4 py-2 rounded text-sm ${
                      snippetView === 'folders' ? 'text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    style={snippetView === 'folders' ? {backgroundColor: '#dc2626'} : {}}
                  >
                    Folders
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowAddFolderModal(true)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm"
                  >
                    Add Folder
                  </button>
                  <button 
                    onClick={() => setShowSnippetOptions(true)}
                    className="px-3 py-2 text-white rounded text-sm" 
                    style={{backgroundColor: '#dc2626'}}
                  >
                    Add Snippet
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {snippetView === 'all-snippets' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        placeholder="Search Snippets"
                        className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
                      />
                    </div>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm flex items-center space-x-1">
                      <Filter size={16} />
                      <span>Filters</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="w-8 px-4 py-3"></th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="w-8 px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[
                          { name: '01.01 Residential - New Lead Follow Up - Immediate...', body: 'Hey {{contact.first_name}}, thank you for...', folder: '01. Residential - Client - New Lea...', type: 'Text' },
                          { name: '01.01.1 Main - New Lead Follow Up - Immediate Conta...', body: 'Hey {{contact.first_name}}, thank you for...', folder: '', type: 'Text' },
                          { name: '01.01.2 Main - New Lead Follow Up - Immediate Conta...', body: 'One of our team members will be reaching o...', folder: '', type: 'Text' },
                          { name: '01.01.3 Main - New Lead Follow Up - After 1 Day', body: 'Hey {{contact.first_name}}, this is...', folder: '', type: 'Text' },
                          { name: '01.01.4 Main - New Lead Follow Up - After 2 Days', body: 'We hope your day is going well...', folder: '', type: 'Text' },
                          { name: '01.01.5 Main - New Lead Follow Up - After 5 Days', body: 'Hey there, we\'re just doing a quick check-in...', folder: '', type: 'Text' },
                          { name: '01.01.6 Main - New Lead Follow Up - After 10 Days', body: 'We hope you\'re having a good day...', folder: '', type: 'Text' },
                          { name: '01.01.7 Main - New Lead Follow Up - After 15 Days', body: 'Hey there {{contact.first_name}}, it\'s been...', folder: '', type: 'Text' },
                          { name: '01.02 Residential - New Lead Follow Up - Immediate Conta...', body: 'One of our team members will be reaching o...', folder: '01. Residential - Client - New Lea...', type: 'Text' },
                          { name: '01.03 Residential - New Lead Follow Up - After 1 Day', body: 'Hey {{contact.first_name}}, this is...', folder: '01. Residential - Client - New Lea...', type: 'Text' }
                        ].map((snippet, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input type="checkbox" className="rounded" />
                            </td>
                            <td className="px-4 py-3 text-sm text-primary-600 dark:text-primary-400">{snippet.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{snippet.body}</td>
                            <td className="px-4 py-3 text-sm">
                              {snippet.folder && (
                                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs dark:bg-primary-900 dark:text-blue-200">
                                  {snippet.folder}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{snippet.type}</td>
                            <td className="px-4 py-3">
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>Page 1 of 5</span>
                    <div className="flex items-center space-x-2">
                      <button className="px-2 py-1 border rounded">Previous</button>
                      <button className="px-2 py-1 text-white rounded" style={{backgroundColor: '#dc2626'}}>1</button>
                      <button className="px-2 py-1 border rounded">2</button>
                      <button className="px-2 py-1 border rounded">3</button>
                      <button className="px-2 py-1 border rounded">4</button>
                      <button className="px-2 py-1 border rounded">5</button>
                      <button className="px-2 py-1 border rounded">Next</button>
                      <span className="ml-4">10 / page</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-end mb-4">
                    <input
                      type="text"
                      placeholder="Search Folders"
                      className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
                    />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Folder Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Snippets</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created on</th>
                          <th className="w-8 px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[
                          { name: '01. Residential - Client - New Lea...', snippets: 7, date: '21/12/2024 at 02:56 AM' },
                          { name: '01. Residential - Internal - New Le...', snippets: 2, date: '21/12/2024 at 02:56 AM' },
                          { name: '01.05 Residential - Roof Inspection', snippets: 1, date: '23/01/2025 at 02:18 AM' },
                          { name: '01.05 Residential - Roof Inspection', snippets: 0, date: '21/12/2024 at 02:56 AM' },
                          { name: '1.06 Residential - Insurance - Pos...', snippets: 2, date: '23/01/2025 at 02:18 AM' }
                        ].map((folder, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900 flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                              </svg>
                              <span>{folder.name}</span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{folder.snippets}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{folder.date}</td>
                            <td className="px-4 py-4">
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>Page 1 of 1</span>
                    <div className="flex items-center space-x-2">
                      <button className="px-2 py-1 border rounded text-gray-400" disabled>Previous</button>
                      <button className="px-2 py-1 text-white rounded" style={{backgroundColor: '#dc2626'}}>1</button>
                      <button className="px-2 py-1 border rounded text-gray-400" disabled>Next</button>
                      <span className="ml-4">10 / page</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team-messaging' && (
          <div className="flex-1 flex h-full">
            <div className="w-80 flex-shrink-0">
              <ConversationList
                conversations={teamConversations}
                selectedConversationId={selectedConversationId}
                searchQuery={conversationSearchQuery}
                onSearchChange={setConversationSearchQuery}
                onConversationSelect={handleConversationSelect}
                onNewMessage={() => setShowNewMessageModal(true)}
              />
            </div>
            <div className="flex-1">
              {selectedConversationId ? (
                (() => {
                  const selectedConv = teamConversations.find(c => c.id === selectedConversationId);
                  if (!selectedConv) return null;

                  return (
                    <MessageThread
                      conversationId={selectedConversationId}
                      conversationName={selectedConv.display_name}
                      isGroup={selectedConv.is_group}
                      participants={selectedConv.participants}
                      messages={conversationMessages}
                      onSendMessage={handleSendMessage}
                      loading={messagesLoading}
                    />
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Select a conversation to start messaging
                    </p>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Snippet Options Modal */}
      {showSnippetOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Snippet</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSnippetOptions(false);
                  setShowTextSnippetModal(true);
                }}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Add Text Snippet
              </button>
              <button
                onClick={() => {
                  setShowSnippetOptions(false);
                  setShowEmailSnippetModal(true);
                }}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Add Email Snippet
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSnippetOptions(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Snippet Modal */}
      {showTextSnippetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold dark:text-white">Create Text Snippet</h3>
              <button
                onClick={() => setShowTextSnippetModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={snippetName}
                    onChange={(e) => setSnippetName(e.target.value)}
                    placeholder="Enter Snippet Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Snippets Body <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        😊
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        🔗
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        ⚡
                      </button>
                    </div>
                    <textarea
                      value={snippetBody}
                      onChange={(e) => setSnippetBody(e.target.value)}
                      placeholder="Type a message"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>Approximate Cost: $0 ℹ️</span>
                    <span>0 characters | 1 words | 0 segs</span>
                  </div>
                </div>
                
                <div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                    <span>📎</span>
                    <span>Add attachment</span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Add file through URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={snippetUrl}
                      onChange={(e) => setSnippetUrl(e.target.value)}
                      placeholder="Enter URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-4 py-2 text-white rounded" style={{backgroundColor: '#dc2626'}}>
                      + Add
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Test Snippet
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button className="px-4 py-2 text-white rounded flex items-center space-x-1" style={{backgroundColor: '#dc2626'}}>
                      <span>📤</span>
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-64 h-[500px] bg-black rounded-3xl p-2 relative">
                  <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden">
                    <div className="bg-gray-800 h-8 rounded-t-2xl flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-12 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute left-4 text-white text-xs">9:41</div>
                      <div className="absolute right-4 flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm"></div>
                        <div className="w-1 h-2 bg-white rounded"></div>
                      </div>
                    </div>
                    <div className="p-4 h-full bg-gray-50">
                      {snippetBody && (
                        <div className="bg-primary-500 text-white p-2 rounded-lg text-xs max-w-48 ml-auto">
                          {snippetBody}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTextSnippetModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTextSnippetModal(false);
                  setSnippetName('');
                  setSnippetBody('');
                  setSnippetUrl('');
                  setTestPhone('');
                }}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Snippet Modal */}
      {showEmailSnippetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold dark:text-white">Create Email Snippet</h3>
              <button
                onClick={() => setShowEmailSnippetModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={snippetName}
                    onChange={(e) => setSnippetName(e.target.value)}
                    placeholder="this"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="fkjasldhklf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Snippets Body <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-md dark:border-gray-600">
                    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 dark:border-gray-600">
                      <button className="p-1 text-gray-400 hover:text-gray-600">😊</button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">🔗</button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">⚡</button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">↶</button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">↷</button>
                      <button className="p-1 text-gray-400 hover:text-gray-600"><strong>B</strong></button>
                      <button className="p-1 text-gray-400 hover:text-gray-600"><em>I</em></button>
                      <button className="p-1 text-gray-400 hover:text-gray-600"><u>U</u></button>
                    </div>
                    <div className="flex items-center space-x-4 p-2 border-b border-gray-200 text-sm dark:border-gray-600">
                      <select className="border-none bg-transparent text-gray-600 dark:text-gray-400">
                        <option>Paragraph</option>
                      </select>
                      <select className="border-none bg-transparent text-gray-600 dark:text-gray-400">
                        <option>14px</option>
                      </select>
                      <select className="border-none bg-transparent text-gray-600 dark:text-gray-400">
                        <option>1.5</option>
                      </select>
                      <select className="border-none bg-transparent text-gray-600 dark:text-gray-400">
                        <option>Inter</option>
                      </select>
                    </div>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="fkjhafahskdjlfhklas"
                      rows={8}
                      className="w-full p-3 border-none resize-none focus:outline-none dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex items-center justify-between p-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">G</span>
                      </div>
                      <span>19 characters | 1 words</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                    <span>📎</span>
                    <span>Add attachment</span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Test Email Snippet
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="From Email Address"
                      className="px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-red-500 dark:text-white"
                    />
                    <input
                      type="email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="To Email Address"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <p className="text-red-500 text-sm mb-2">Please enter a valid from email address</p>
                  <button className="px-4 py-2 text-white rounded flex items-center space-x-1" style={{backgroundColor: '#dc2626'}}>
                    <span>📤</span>
                    <span>Send Test</span>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-64 h-[500px] bg-black rounded-3xl p-2 relative">
                  <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden">
                    <div className="bg-gray-800 h-8 rounded-t-2xl flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-12 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute left-4 text-white text-xs">9:41</div>
                      <div className="absolute right-4 flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm"></div>
                        <div className="w-1 h-2 bg-white rounded"></div>
                      </div>
                    </div>
                    <div className="p-2 h-full bg-gray-50">
                      <div className="bg-white rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-primary-500">←</span>
                            <span className="text-primary-500 text-sm">Inbox</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-primary-500">^</span>
                            <span className="text-primary-500">v</span>
                          </div>
                        </div>
                        {emailSubject && (
                          <div className="font-semibold text-sm mb-2">{emailSubject}</div>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                          <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white">J</span>
                          <div>
                            <div>Jane Doe 10:15am</div>
                            <div className="text-gray-400">↩</div>
                          </div>
                        </div>
                        {emailBody && (
                          <div className="text-xs text-gray-800">{emailBody}</div>
                        )}
                      </div>
                      <div className="flex justify-center space-x-4 mt-4">
                        <button className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white">📧</button>
                        <button className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white">📁</button>
                        <button className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white">↩</button>
                        <button className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center text-white">✏️</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEmailSnippetModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEmailSnippetModal(false);
                  setSnippetName('');
                  setEmailSubject('');
                  setEmailBody('');
                  setFromEmail('');
                  setToEmail('');
                }}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Trigger Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Link URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter Link URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddLinkModal(false);
                  setLinkName('');
                  setLinkUrl('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddLinkModal(false);
                  setLinkName('');
                  setLinkUrl('');
                }}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Link Modal */}
      {showDeleteLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Delete trigger link?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're about to delete the DEMO trigger link. Deleted link cannot be restored, are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteLinkModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteLinkModal(false)}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {showEditLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit Trigger Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue="DEMO"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Link URL
                </label>
                <input
                  type="url"
                  defaultValue="https://demo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditLinkModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditLinkModal(false)}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add new folder</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Folder name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddFolderModal(false);
                  setFolderName('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddFolderModal(false);
                  setFolderName('');
                }}
                className="px-4 py-2 text-white rounded hover:opacity-90"
                style={{backgroundColor: '#dc2626'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Message Modal */}
      {showCreateMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Message</h3>
              <button
                onClick={() => setShowCreateMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div 
                onClick={() => {
                  setShowCreateMessageModal(false);
                  setShowDirectMessageModal(true);
                }}
                className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-primary-500"
              >
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Direct Message</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send direct message to a contact</p>
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setShowCreateMessageModal(false);
                  setShowGroupMessageModal(true);
                }}
                className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 cursor-pointer transition-colors dark:border-gray-600 dark:hover:border-primary-500"
              >
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Group Message</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send group SMS to contacts</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowCreateMessageModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {showDirectMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create new message</h3>
              </div>
              <button
                onClick={() => {
                  setShowDirectMessageModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setSelectedContactForMessage(null);
                  setShowContactDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Contact <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onClick={() => setShowContactDropdown(!showContactDropdown)}
                  readOnly
                  placeholder="Select name, email or phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Contact Dropdown */}
                {showContactDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                    {contactsList.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setSelectedContactForMessage(contact);
                          setSearchQuery(`${contact.full_name} (${contact.email})`);
                          setShowContactDropdown(false);
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-600 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {contact.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {contact.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contact.email} • {contact.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDirectMessageModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setSelectedContactForMessage(null);
                  setShowContactDropdown(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                disabled={!selectedContactForMessage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Message Modal */}
      {showGroupMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Group Chat</h3>
              </div>
              <button
                onClick={() => {
                  setShowGroupMessageModal(false);
                  setGroupSearchQuery('');
                  setGroupSearchResults([]);
                  setSelectedParticipants([]);
                  setPhoneNumber('');
                  setShowPhoneDropdown(false);
                  setShowContactDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Start a group chat with up to 10 participants, including yourself. Creating a group chat will allow all participants to see each other's phone numbers.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select your phone number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phoneNumber}
                    onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
                    readOnly
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Phone Number Dropdown */}
                  {showPhoneDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                      {staffMembers.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => {
                            setPhoneNumber(`${staff.first_name} ${staff.last_name} - ${staff.phone}`);
                            setShowPhoneDropdown(false);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-600 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {staff.first_name?.charAt(0)?.toUpperCase()}{staff.last_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {staff.first_name} {staff.last_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {staff.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select participants <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={groupSearchQuery}
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    readOnly
                    placeholder="Search by contact name or number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Contact Dropdown */}
                  {showContactDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                      {contactsList.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => {
                            if (!selectedParticipants.find(p => p.id === contact.id)) {
                              setSelectedParticipants([...selectedParticipants, contact]);
                            }
                            setShowContactDropdown(false);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 dark:hover:bg-gray-600 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {contact.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {contact.full_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Participants */}
                {selectedParticipants.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg dark:bg-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {participant.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {participant.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {participant.phone}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowGroupMessageModal(false);
                  setGroupSearchQuery('');
                  setGroupSearchResults([]);
                  setSelectedParticipants([]);
                  setPhoneNumber('');
                  setShowPhoneDropdown(false);
                  setShowContactDropdown(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                disabled={!phoneNumber || selectedParticipants.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      <NewMessageModal
        show={showNewMessageModal}
        contacts={teamContacts}
        onClose={() => setShowNewMessageModal(false)}
        onSend={handleNewMessage}
        loading={teamMessagingLoading}
      />
    </div>
  );
};

export default Conversations;