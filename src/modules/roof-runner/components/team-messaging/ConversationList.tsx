import React from 'react';
import { Search, Users, Filter, Edit, ChevronDown } from 'lucide-react';
import { TeamConversationListItem } from '../../types/teamMessaging';

interface ConversationListProps {
  conversations: TeamConversationListItem[];
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewMessage: () => void;
  loading?: boolean;
}

type FilterTab = 'unread' | 'recents' | 'starred' | 'all';

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onNewMessage,
  loading = false,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>('unread');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (activeFilter === 'unread' && conv.unread_count === 0) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        conv.display_name.toLowerCase().includes(query) ||
        conv.last_message.toLowerCase().includes(query)
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
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeFilter === key
                  ? 'border-red-600 text-red-600 dark:text-red-400'
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
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredConversations.length} RESULTS
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={onNewMessage}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <span>Latest-All</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading conversations...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              {searchQuery ? 'No conversations found' : 'No team messages yet'}
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
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: conversation.avatar_color }}
                      >
                        {conversation.is_group ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          <span className="text-sm">{conversation.initials}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {conversation.display_name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatDate(conversation.last_message_time)}
                        </span>
                      </div>

                      {conversation.is_group && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Users className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {conversation.participants.length} members
                          </span>
                        </div>
                      )}

                      <p
                        className={`text-sm truncate ${
                          hasUnread ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
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
    </div>
  );
};

export default ConversationList;
