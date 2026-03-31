import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Search, Filter, Edit, ChevronDown, MoreVertical, UserPlus, Info } from 'lucide-react';
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
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

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

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        status: statusFilter,
        channel: channelFilter,
        sortBy,
        search: searchQuery
      };
      const data = await getConversations(filters);
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
        return 'SMS';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Call';
      default:
        return 'Message';
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
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
    const unreadCount = Number(conv.unread_count || 0);
    if (activeFilter === 'unread' && unreadCount <= 0) {
      return false;
    }

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

  const handleCreateConversation = async (contactId: string) => {
    try {
      const conversation = await createConversationAPI(contactId, 'sms');
      setIsEditModalOpen(false);
      onSelectConversation(conversation.id);
      loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
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
            { key: 'all' as FilterTab, label: 'All' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeFilter === key
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
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {filteredConversations.length} {activeFilter.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500 dark:text-red-400 text-sm px-4 text-center">{error}</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversation === conversation.id;
              const unreadCount = Number(conversation.unread_count || 0);
              const hasUnread = unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setConversations((prev) =>
                      prev.map((item) =>
                        item.id === conversation.id
                          ? { ...item, unread_count: 0 }
                          : item,
                      ),
                    );
                    onSelectConversation(conversation.id);
                  }}
                  className={`p-4 cursor-pointer transition-all border-l-4 ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white shadow-sm font-semibold">
                        {getInitials(conversation.contact?.full_name || '')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm`}>
                        <div className="text-gray-600 dark:text-gray-400 scale-75">
                          {getChannelIcon(conversation.channel)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-sm font-bold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {conversation.contact?.full_name || 'Unknown Contact'}
                        </h3>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 uppercase">
                          {formatDate(conversation.last_message_at)}
                        </span>
                      </div>

                      {/* Contact Details Hover-like Info */}
                      <div className="flex flex-col space-y-0.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {conversation.contact?.email && (
                          <div className="flex items-center truncate">
                            <Mail className="w-2.5 h-2.5 mr-1" />
                            <span className="truncate">{conversation.contact.email}</span>
                          </div>
                        )}
                        {conversation.contact?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-2.5 h-2.5 mr-1" />
                            <span>{conversation.contact.phone}</span>
                          </div>
                        )}
                      </div>

                      <p className={`text-sm mt-1 truncate ${hasUnread ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                          {unreadCount}
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

      <DirectMessageModal
        isOpen={showDirectModal}
        onClose={handleDirectModalClose}
        onCreateConversation={handleConversationCreated}
      />
    </div>
  );
}
