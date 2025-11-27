import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Paperclip, Smile } from 'lucide-react';
import { TeamMessageItem } from '../../types/teamMessaging';
import { format } from 'date-fns';

interface MessageThreadProps {
  conversationId: string | null;
  messages: TeamMessageItem[];
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
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

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No messages yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 shadow-sm">
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}

                  <div className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      {!message.is_own_message && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-semibold text-white">
                            {message.sender_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.is_own_message
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {!message.is_own_message && (
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            {message.sender_name}
                          </p>
                        )}
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1.5 ${
                            message.is_own_message ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
          />
          <div className="flex flex-col space-y-2">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
