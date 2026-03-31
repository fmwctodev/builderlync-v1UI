import React from 'react';
import { Search, Users, Filter, Edit, ChevronDown, Trash2, MoreVertical, UserPlus, Mail, Phone } from 'lucide-react';
import { TeamConversationListItem } from '../../types/teamMessaging';

interface ConversationListProps {
  conversations: TeamConversationListItem[];
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewMessage: () => void;
  onDeleteTeam?: (teamId: string) => void;
  onAddMember?: (teamId: string) => void;
  onSortChange?: (sortBy: 'name' | 'last_message' | 'created_at' | 'unread_count', sortOrder: 'asc' | 'desc') => void;
  loading?: boolean;
}

type FilterTab = 'unread' | 'recents' | 'starred' | 'all';
type SortOption = 'latest' | 'oldest';

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onNewMessage,
  onDeleteTeam,
  onAddMember,
  onSortChange,
  loading = false,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<SortOption>('latest');

  const filteredConversations = conversations.filter((conv) => {
    if (activeFilter === 'unread' && (conv.unread_count || 0) === 0) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        conv.display_name.toLowerCase().includes(query) ||
        (conv.last_message || '').toLowerCase().includes(query) ||
        conv.participants.some(p =>
          p.full_name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
        )
      );
    }

    return true;
  });

  const formatDate = (timeString: string) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div className="w-[380px] border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {[
            { key: 'unread' as FilterTab, label: 'Unread' },
            { key: 'recents' as FilterTab, label: 'Recents' },
            { key: 'starred' as FilterTab, label: 'Starred' },
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
            placeholder="Search team or member..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {filteredConversations.length} CONVERSATIONS
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewMessage}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Start New Conversation"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const newSort: SortOption = sortBy === 'latest' ? 'oldest' : 'latest';
                const apiSortBy = 'last_message';
                const apiSortOrder = newSort === 'latest' ? 'desc' : 'asc';

                setSortBy(newSort);
                onSortChange?.(apiSortBy, apiSortOrder);
              }}
              className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>{sortBy === 'latest' ? 'Latest' : 'Oldest'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-500 dark:text-gray-400 text-sm">Loading conversations...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
              {searchQuery ? 'No results found' : 'No team messages'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Start a conversation with your team'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const hasUnread = conversation.unread_count > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    if (showDropdown !== conversation.id) {
                      onConversationSelect(conversation.id);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-all border-l-4 ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                        style={{ backgroundColor: conversation.avatar_color }}
                      >
                        {conversation.is_group ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          <span className="text-base">{conversation.initials}</span>
                        )}
                      </div>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-sm font-bold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {conversation.display_name}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium">
                            {formatDate(conversation.last_message_time)}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(showDropdown === conversation.id ? null : conversation.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                            {showDropdown === conversation.id && (
                              <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-20 min-w-[140px]">
                                {onAddMember && conversation.is_group && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const teamId = conversation.id.replace('team_', '');
                                      onAddMember(teamId);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Add Member</span>
                                  </button>
                                )}
                                {onDeleteTeam && conversation.is_group && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const teamId = conversation.id.replace('team_', '');
                                      onDeleteTeam(teamId);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Team</span>
                                  </button>
                                )}
                                <button
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={(e) => { e.stopPropagation(); setShowDropdown(null); }}
                                >
                                  <Filter className="w-3.5 h-3.5" />
                                  <span>View Details</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Conversation Details Info */}
                      <div className="flex flex-col space-y-0.5 mt-1">
                        {conversation.participants.slice(0, 1).map(p => (
                          <div key={p.id} className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400">
                            {p.email && (
                              <div className="flex items-center truncate">
                                <Mail className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                <span className="truncate">{p.email}</span>
                              </div>
                            )}
                            {p.phone && (
                              <div className="flex items-center flex-shrink-0">
                                <Phone className="w-2.5 h-2.5 mr-1" />
                                <span>{p.phone}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {conversation.is_group ? (
                          <div className="flex items-center space-x-1 text-[11px] text-blue-500 font-medium">
                            <Users className="w-2.5 h-2.5" />
                            <span>{conversation.participants.length} Team Members</span>
                          </div>
                        ) : null}
                      </div>

                      <p className={`text-sm mt-1 truncate ${hasUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
