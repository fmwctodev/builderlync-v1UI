import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  MailOpen,
  Trash2,
  MoreVertical,
  Phone,
  CheckCheck,
  Check,
  Paperclip,
  Smile,
  DollarSign,
  Plus
} from 'lucide-react';
import { ChannelTabs, ChannelType } from './ChannelTabs';
import { MessageInputSMS } from './MessageInputSMS';
import { MessageInputEmail } from './MessageInputEmail';
import { MessageInputInternalComment } from './MessageInputInternalComment';
import {
  getConversation,
  getConversationMessages,
  markConversationAsRead,
  subscribeToConversationMessages,
  ConversationMessage,
  Conversation,
} from '../services/conversationsApi';

interface ChatAreaProps {
  conversationId: string | null;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [activeChannel, setActiveChannel] = useState<ChannelType>('sms');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      setLoading(true);
      setError(null);
      try {
        const [convData, messagesData] = await Promise.all([
          getConversation(conversationId),
          getConversationMessages(conversationId),
        ]);
        setConversation(convData);
        setMessages(messagesData);

        await markConversationAsRead(conversationId);
      } catch (err: any) {
        console.error('Failed to load conversation:', err);
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const subscription = subscribeToConversationMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      markConversationAsRead(conversationId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const contactData = {
    phone: conversation?.contact?.phone || '',
    email: conversation?.contact?.email || '',
    phoneVerified: false,
    emailVerified: Boolean(conversation?.contact?.email),
  };

  const hasPhone = Boolean(contactData.phone);
  const hasEmail = Boolean(contactData.email);

  const handleSendSuccess = async () => {
    if (conversationId) {
      try {
        const messagesData = await getConversationMessages(conversationId);
        setMessages(messagesData);
      } catch (err) {
        console.error('Failed to refresh messages:', err);
      }
    }
  };

  const handleSendError = (error: string) => {
    console.error('Send error:', error);
    setError(error);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-gray-400" />
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
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {getInitials(conversation?.contact?.full_name || '')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversation?.contact?.full_name || 'Unknown Contact'}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MailOpen className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start a conversation below</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages[0] && (
              <div className="text-center mb-4">
                <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                  {formatDate(messages[0].created_at)}
                </span>
              </div>
            )}

            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showTimestamp = !prevMessage ||
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000;

              const isOutbound = message.direction === 'outbound';
              const isInternal = message.is_internal;

              return (
                <div key={message.id} className="flex flex-col">
                  {showTimestamp && index > 0 && (
                    <div className="text-center my-4">
                      <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}

                  {isInternal && (
                    <div className="text-center mb-2">
                      <span className="inline-block text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                        Internal Comment
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isOutbound && !isInternal ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      {!isOutbound && !isInternal && (
                        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-semibold text-white">
                            {getInitials(conversation?.contact?.full_name || '')}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isInternal
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
                            : isOutbound
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className={`text-[15px] leading-relaxed break-words ${
                          isInternal ? 'text-gray-900 dark:text-gray-100' :
                          isOutbound ? 'text-white' :
                          'text-gray-900 dark:text-white'
                        }`}>
                          {message.content}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${
                            isInternal ? 'text-gray-600 dark:text-gray-400' :
                            isOutbound ? 'text-blue-100' :
                            'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(message.created_at)}
                          </span>

                          {isOutbound && !isInternal && (
                            <div className="flex items-center space-x-1 ml-2">
                              {message.delivery_status === 'read' || message.delivery_status === 'delivered' ? (
                                <CheckCheck className="w-4 h-4 text-blue-100" />
                              ) : (
                                <Check className="w-4 h-4 text-blue-100" />
                              )}
                            </div>
                          )}
                        </div>
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

      {/* Channel Tabs and Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ChannelTabs
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          hasPhone={hasPhone}
          hasEmail={hasEmail}
        />

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {activeChannel === 'sms' && conversationId && (
            <div className="space-y-3">
              <MessageInputSMS
                conversationId={conversationId}
                toNumber={contactData.phone}
                contactName={conversation?.contact?.full_name || 'Contact'}
                onSendSuccess={handleSendSuccess}
                onSendError={handleSendError}
              />
            </div>
          )}

          {activeChannel === 'email' && conversationId && (
            <MessageInputEmail
              conversationId={conversationId}
              contactEmail={contactData.email}
              contactName={conversation?.contact?.full_name || 'Contact'}
              onSendSuccess={handleSendSuccess}
              onSendError={handleSendError}
            />
          )}

          {activeChannel === 'internal_comment' && conversationId && (
            <MessageInputInternalComment
              conversationId={conversationId}
              onSendSuccess={handleSendSuccess}
              onSendError={handleSendError}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <DollarSign className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {activeChannel === 'sms' && (
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <span>Chars: 0, Segs: 0</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
