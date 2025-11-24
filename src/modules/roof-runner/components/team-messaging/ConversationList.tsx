import React from 'react';
import { Search, Users } from 'lucide-react';
import { TeamConversationListItem } from '../../types/teamMessaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: TeamConversationListItem[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConversationSelect: (conversationId: string) => void;
  onNewMessage: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onConversationSelect,
  onNewMessage,
}) => {
  const filteredConversations = conversations.filter(conv =>
    conv.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Messages</h2>
          <button
            onClick={onNewMessage}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#dc2626' }}
          >
            New Message
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery ? 'No conversations found' : 'No team messages yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Start a conversation with your team'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: conversation.avatar_color }}
                  >
                    {conversation.is_group ? (
                      <Users className="w-6 h-6" />
                    ) : (
                      conversation.initials
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.display_name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {conversation.last_message_time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
