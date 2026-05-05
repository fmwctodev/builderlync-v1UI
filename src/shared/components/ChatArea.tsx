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
  FileText,
  AlertTriangle,
  Settings,
  Tag as TagIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChannelTabs, ChannelType } from './ChannelTabs';
import { MessageInputSMS } from './MessageInputSMS';
import { MessageInputEmail } from './MessageInputEmail';
import { MessageInputInternalComment } from './MessageInputInternalComment';
import { TeamMessageInput } from './TeamMessageInput';
import { SnippetSelector } from './SnippetSelector';
import { EmojiPicker } from './EmojiPicker';
import { TagDropdown } from './TagDropdown';
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
  onCloseConversation?: () => void;
}

export function ChatArea({ conversationId, onCloseConversation }: ChatAreaProps) {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState<ChannelType | 'team' | 'internal'>('sms');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSmtpError, setShowSmtpError] = useState(false);
  const [smsErrorMessage, setSmsErrorMessage] = useState<string | null>(null);
  const [smsRedirectUrl, setSmsRedirectUrl] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
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
        } else {
          // For mock conversations, still call the API
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

    setSending(true);
    try {
      const { smtpApi } = await import('../services/smtpApi');
      await smtpApi.sendSMSMessage(conversation.contact.id.toString(), messageContent);

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
      setShowSmtpError(false);
      setSmsErrorMessage(null);
      setSmsRedirectUrl(null);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorData = error;
      const message =
        errorData?.error ||
        errorData?.message ||
        error?.message ||
        'Failed to send message';
      const redirectUrl = errorData?.redirectUrl || null;
      console.log(redirectUrl)
      setSmsErrorMessage(message);
      setSmsRedirectUrl(redirectUrl);
      setShowSmtpError(Boolean(redirectUrl));
    } finally {
      setSending(false);
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
          <button
            onClick={onCloseConversation}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
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
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isOutbound
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
                    <span className={`text-xs mt-1 block ${isOutbound ? 'text-blue-100' : 'text-gray-500'
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
            className={`px-4 py-2 text-sm font-medium ${activeChannel === 'sms'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            SMS
          </button>
          <button
            onClick={() => setActiveChannel('email')}
            className={`px-4 py-2 text-sm font-medium ${activeChannel === 'email'
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
          <button
            onClick={() => setActiveChannel('internal' as any)}
            className={`px-4 py-2 text-sm font-medium ml-auto ${activeChannel === ('internal' as any)
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
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
          ) : activeChannel === ('internal' as any) ? (
            <MessageInputInternalComment
              conversationId={conversationId!}
              onSendSuccess={handleSendSuccess}
              onSendError={handleSendError}
            />
          ) : (
            <div>
              {smsErrorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                        {smsRedirectUrl ? 'SMS Service Not Configured' : 'SMS Send Failed'}
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{smsErrorMessage}</p>
                      {smsRedirectUrl && (
                        <button
                          onClick={() => {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            const orgSlug = user.companySlug || 'default';
                            if (smsRedirectUrl.startsWith('/org/')) {
                              navigate(smsRedirectUrl);
                            } else {
                              navigate(`/org/${orgSlug}${smsRedirectUrl}`);
                            }
                          }}
                          className="mt-2 inline-flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Configure SMS Service</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowSmtpError(false)}
                      className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors" title="Insert emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={(emoji) => {
                          setMessageContent(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                        position="top"
                      />
                    )}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowTagDropdown(!showTagDropdown); }}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors" title="Insert tag"
                    >
                      <TagIcon className="w-4 h-4" />
                    </button>
                    {showTagDropdown && (
                      <TagDropdown
                        onSelect={(val) => {
                          setMessageContent(prev => prev + val);
                          setShowTagDropdown(false);
                        }}
                        onClose={() => setShowTagDropdown(false)}
                        position="top"
                      />
                    )}
                  </div>
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
                    disabled={!messageContent.trim() || sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send</span>
                    )}
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
