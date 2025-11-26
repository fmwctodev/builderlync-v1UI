import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MoreVertical, Check, CheckCheck } from 'lucide-react';
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {conversation?.contact?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversation?.contact?.full_name || 'Unknown Contact'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation?.contact?.phone || conversation?.contact?.email || 'No contact info'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Mail className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50 dark:bg-gray-900">
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
          <>
            {messages[0] && (
              <div className="text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
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

              const getMessageColor = () => {
                if (isInternal) return 'bg-yellow-100 dark:bg-yellow-900/20';
                if (isOutbound) {
                  return message.message_type === 'email' ? 'bg-blue-500' : 'bg-green-500';
                }
                return 'bg-white dark:bg-gray-800';
              };

              const getBorderColor = () => {
                if (isInternal) return 'border-l-4 border-yellow-500';
                if (isOutbound) return '';
                return message.message_type === 'email'
                  ? 'border-l-4 border-blue-500'
                  : 'border-l-4 border-green-500';
              };

              const getTextColor = () => {
                if (isInternal) return 'text-gray-900 dark:text-gray-100';
                if (isOutbound) return 'text-white';
                return 'text-gray-900 dark:text-white';
              };

              return (
                <div key={message.id} className="flex flex-col">
                  {showTimestamp && (
                    <div className="text-center my-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}
                  {isInternal && (
                    <div className="text-center mb-1">
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                        Internal Comment
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${isOutbound && !isInternal ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 ${
                        isOutbound && !isInternal
                          ? `${getMessageColor()} text-white rounded-[20px] rounded-br-[4px] shadow-md`
                          : `${getMessageColor()} ${getBorderColor()} ${getTextColor()} rounded-[20px] rounded-bl-[4px] shadow-sm`
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                      {isOutbound && !isInternal && (
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className="text-xs opacity-75">
                            {message.delivery_status === 'read' ? 'Read' :
                             message.delivery_status === 'delivered' ? 'Delivered' :
                             message.delivery_status === 'sent' ? 'Sent' : 'Pending'}
                          </span>
                          {message.delivery_status === 'read' || message.delivery_status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 opacity-75" />
                          ) : (
                            <Check className="w-3 h-3 opacity-75" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ChannelTabs
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          hasPhone={hasPhone}
          hasEmail={hasEmail}
        />

        <div className="p-4">
          {activeChannel === 'sms' && conversationId && (
            <MessageInputSMS
              conversationId={conversationId}
              toNumber={contactData.phone}
              contactName={conversation?.contact?.full_name || 'Contact'}
              onSendSuccess={handleSendSuccess}
              onSendError={handleSendError}
            />
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
        </div>
      </div>
    </div>
  );
}
