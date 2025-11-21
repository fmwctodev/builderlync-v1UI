import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, User } from 'lucide-react';
import { TeamMessageItem } from '../../types/teamMessaging';
import { format } from 'date-fns';

interface MessageThreadProps {
  conversationId: string;
  conversationName: string;
  isGroup: boolean;
  participants: any[];
  messages: TeamMessageItem[];
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  conversationName,
  isGroup,
  participants,
  messages,
  onSendMessage,
  loading = false,
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: getAvatarColor(conversationName) }}
          >
            {isGroup ? (
              <Users className="w-5 h-5" />
            ) : (
              <span className="font-semibold">{getInitials(conversationName)}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {conversationName}
            </h2>
            {isGroup && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {participants.length} members
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <User className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No messages yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDate = index === 0 ||
                format(new Date(message.timestamp), 'yyyy-MM-dd') !==
                format(new Date(messages[index - 1].timestamp), 'yyyy-MM-dd');

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {format(new Date(message.timestamp), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex ${
                      message.is_own_message ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.is_own_message
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      } rounded-lg px-4 py-2`}
                    >
                      {!message.is_own_message && isGroup && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {message.sender_name}
                        </p>
                      )}
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.is_own_message
                            ? 'text-red-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={3}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
