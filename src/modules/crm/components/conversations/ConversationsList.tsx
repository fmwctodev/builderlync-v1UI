import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Search, Filter, Edit, ChevronDown } from 'lucide-react';
import {
  getConversations,
  subscribeToConversations,
  createConversationAPI,
  Conversation,
} from '../../../../shared/services/conversationsApi';
import { supabase } from '../../../../shared/lib/supabase';
import { ConversationEditModal } from './ConversationEditModal';
import { DirectMessageModal } from './DirectMessageModal';

interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}




type FilterTab = 'unread' | 'recents' | 'all';
type SortOption = 'latest' | 'oldest' | 'name' | 'unread';
type ChannelFilter = 'all' | 'sms' | 'email' | 'phone' | 'web';
type StatusFilter = 'all' | 'open' | 'closed' | 'archived';

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
   const [showDirectModal, setShowDirectModal] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);


  const handleDirectModalClose = () => {
    setShowDirectModal(false);
  };


  
  const handleConversationCreated = (contactId: string) => {
    setShowDirectModal(false);
    handleCreateConversation(contactId);
  };


  // Subscription disabled - Supabase not in use
  // useEffect(() => {
  //   const setupSubscription = async () => {
  //     if (!supabase?.auth) return;
  //     
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) return;

  //     const subscription = subscribeToConversations(user.id, () => {
  //       loadConversations();
  //     });

  //     return () => {
  //       subscription.unsubscribe();
  //     };
  //   };

  //   setupSubscription();
  // }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading conversations...');
      const filters = {
        status: statusFilter,
        channel: channelFilter,
        sortBy,
        search: searchQuery
      };
      const data = await getConversations(filters);
      console.log('Conversations loaded:', data);
      setConversations(data || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <MessageSquare className="w-3 h-3" />;
      case 'phone':
        return <Phone className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'sms':
        return 'Call';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Call';
      default:
        return 'Message';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filter by tab
    if (activeFilter === 'unread' && (!conv.unread_count || conv.unread_count === 0)) {
      return false;
    }
    
    // For other filters, show all conversations for now
    // if (activeFilter === 'recents' || activeFilter === 'starred' || activeFilter === 'all') {
    if (activeFilter === 'recents' || activeFilter === 'all') {
      // Continue to search filter
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = conv.contact?.full_name?.toLowerCase() || '';
      const phone = conv.contact?.phone?.toLowerCase() || '';
      const email = conv.contact?.email?.toLowerCase() || '';
      const lastMsg = conv.last_message?.content?.toLowerCase() || '';
      return name.includes(query) || phone.includes(query) || email.includes(query) || lastMsg.includes(query);
    }

    return true;
  });

  const handleEditClick = () => {
    setShowDirectModal(true);
  };

  const handleConversationTypeSelect = (type: 'direct' | 'group') => {
    setIsEditModalOpen(false);
    console.log('Selected conversation type:', type);
  };

  const handleCreateConversation = async (contactId: string) => {
    try {
      console.log('Creating conversation for contact:', contactId);
      const conversation = await createConversationAPI(contactId, 'sms');
      console.log('Conversation created:', conversation);
      setIsEditModalOpen(false);
      onSelectConversation(conversation.id);
      loadConversations(); // Refresh the list
    } catch (error) {
      console.error('Failed to create conversation:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to create conversation: ' + message);
    }
  };

  return (
    <div className="w-[320px] border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {[
            { key: 'unread' as FilterTab, label: 'Unread' },
            { key: 'recents' as FilterTab, label: 'Recents' },
            // { key: 'starred' as FilterTab, label: 'Starred' },
            { key: 'all' as FilterTab, label: 'All' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeFilter === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Controls */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            /> */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredConversations.length} RESULTS
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={handleEditClick}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const newSort = sortBy === 'latest' ? 'oldest' : 'latest';
                setSortBy(newSort);
                loadConversations();
              }}
              className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>{sortBy === 'latest' ? 'Latest' : 'Oldest'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {/* {showFilters && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Channel</label>
                <select
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value as ChannelFilter);
                    loadConversations();
                  }}
                  className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Channels</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="web">Web</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    loadConversations();
                  }}
                  className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  loadConversations();
                }}
                className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="latest">Latest Messages</option>
                <option value="oldest">Oldest Messages</option>
                <option value="name">Contact Name</option>
                <option value="unread">Unread Count</option>
              </select>
            </div>
          </div>
        </div>
      )} */}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading conversations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center px-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversation === conversation.id;
              const hasUnread = conversation.unread_count && conversation.unread_count > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {getInitials(conversation.contact?.full_name || '')}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
                        conversation.channel === 'sms' ? 'bg-white dark:bg-gray-700' :
                        conversation.channel === 'email' ? 'bg-white dark:bg-gray-700' :
                        'bg-white dark:bg-gray-700'
                      }`}>
                        <div className="text-gray-600 dark:text-gray-400">
                          {getChannelIcon(conversation.channel)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-sm font-semibold truncate ${
                          hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {conversation.contact?.full_name || 'Unknown Contact'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatDate(conversation.last_message_at)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          conversation.channel === 'sms' ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                          conversation.channel === 'email' ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                          'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {getChannelIcon(conversation.channel)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getChannelLabel(conversation.channel)}
                        </span>
                      </div>

                      <p className={`text-sm truncate ${
                        hasUnread ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                          {conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* <ConversationEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSelectType={handleConversationTypeSelect}
        onCreateConversation={handleCreateConversation}
      /> */}
      <DirectMessageModal
        isOpen={showDirectModal}
        onClose={handleDirectModalClose}
        onCreateConversation={handleConversationCreated}
      />
    </div>
  );
}
