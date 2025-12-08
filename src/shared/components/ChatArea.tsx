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
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  FileText
} from 'lucide-react';
import { ChannelTabs, ChannelType } from './ChannelTabs';
import { MessageInputSMS } from './MessageInputSMS';
import { MessageInputEmail } from './MessageInputEmail';
import { MessageInputInternalComment } from './MessageInputInternalComment';
import { TeamMessageInput } from './TeamMessageInput';
import { SnippetSelector } from './SnippetSelector';
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
  const [activeChannel, setActiveChannel] = useState<ChannelType | 'team'>('sms');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);
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
        console.log('Loading conversation:', conversationId);
        const convData = await getConversation(conversationId);
        console.log('Conversation data:', convData);
        
        if (!convData) {
          setError('Conversation not found');
          return;
        }
        
        const messagesData = await getConversationMessages(conversationId);
        console.log('Messages data:', messagesData);
        
        setConversation(convData);
        setMessages(messagesData);

        // Skip markConversationAsRead for mock conversations
        if (!conversationId.startsWith('conv_')) {
          await markConversationAsRead(conversationId);
        }
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
    if (!conversationId || conversationId.startsWith('conv_')) return;

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

  // Set active channel based on conversation channel
  useEffect(() => {
    if (conversation?.channel) {
      setActiveChannel(conversation.channel as ChannelType);
    }
  }, [conversation]);

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

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !conversationId || !conversation?.contact?.id) return;
    
    // Add message instantly to UI
    const newMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      message_type: 'sms' as any,
      direction: 'outbound' as const,
      sender_id: 'current_user',
      content: messageContent,
      is_internal: false,
      email_metadata: {},
      sms_metadata: {},
      delivery_status: 'sent' as const,
      external_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageContent('');
    
    try {
      const { smtpApi } = await import('../services/smtpApi');
      await smtpApi.sendSMSMessage(conversation.contact.id.toString(), messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
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

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {!conversationId ? 'Select a conversation' : 'Loading conversation...'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {!conversationId ? 'Choose a conversation from the sidebar to start messaging' : 'Please wait while we load the conversation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Message: {conversation?.contact?.full_name || 'Unknown Contact'}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">Close conversation</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {getInitials(conversation?.contact?.full_name || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start a conversation below</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOutbound = message.direction === 'outbound';
                const isEmail = message.message_type === 'email';
                const subject = message.email_metadata?.subject;
                
                return (
                  <div key={message.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isOutbound 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {isEmail ? (
                          <Mail className={`w-3 h-3 ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`} />
                        ) : (
                          <MessageSquare className={`w-3 h-3 ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`} />
                        )}
                        <span className={`text-xs font-medium ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`}>
                          {isEmail ? 'EMAIL' : 'SMS'}
                        </span>
                      </div>
                      {subject && (
                        <p className={`text-xs font-medium mb-1 ${isOutbound ? 'text-blue-100' : 'text-gray-600'}`}>
                          Subject: {subject}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <span className={`text-xs mt-1 block ${
                        isOutbound ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </span>
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
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setActiveChannel('sms')}
              className={`px-4 py-2 text-sm font-medium ${
                activeChannel === 'sms' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SMS
            </button>
            <button 
              onClick={() => setActiveChannel('email')}
              className={`px-4 py-2 text-sm font-medium ${
                activeChannel === 'email' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
            {/* <button 
              onClick={() => setActiveChannel('team')}
              className={`px-4 py-2 text-sm font-medium ${
                activeChannel === 'team' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Message
            </button> */}
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 ml-auto">
              Internal Comment
            </button>
          </div>

          <div className="p-3">
            {activeChannel === 'team' ? (
              <TeamMessageInput
                onSend={async (message: string, metadata: any) => {
                  const newMessage = {
                    id: Date.now().toString(),
                    conversation_id: conversationId!,
                    message_type: metadata.messageType as any,
                    direction: 'outbound' as const,
                    sender_id: 'current_user',
                    content: message,
                    is_internal: false,
                    email_metadata: metadata,
                    sms_metadata: {},
                    delivery_status: 'sent' as const,
                    external_id: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, newMessage]);
                }}
              />
            ) : activeChannel === 'email' ? (
              <MessageInputEmail
                conversationId={conversationId!}
                contactEmail={conversation?.contact?.email || undefined}
                contactName={conversation?.contact?.full_name || undefined}
                contactId={conversation?.contact?.id?.toString()}
                onSendSuccess={handleSendSuccess}
                onSendError={handleSendError}
              />
            ) : (
              <div>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type SMS message..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowSnippetSelector(true)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Insert snippet"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{messageContent.split(' ').filter(w => w.length > 0).length} words</span>
                    <button 
                      onClick={() => setMessageContent('')}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <SnippetSelector
          isOpen={showSnippetSelector}
          onClose={() => setShowSnippetSelector(false)}
          onSelectSnippet={(body) => setMessageContent(body)}
          type="text"
        />
    </div>
  );
}