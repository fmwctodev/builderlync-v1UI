import React, { useState } from 'react';
import { Phone, Mail, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { ChannelTabs, ChannelType } from './ChannelTabs';
import { MessageInputSMS } from './MessageInputSMS';
import { MessageInputEmail } from './MessageInputEmail';
import { MessageInputInternalComment } from './MessageInputInternalComment';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  type: 'sms' | 'call' | 'email';
  status?: 'sent' | 'delivered' | 'read';
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, I received your quote for the roofing project. Could you provide more details about the timeline?',
    timestamp: '2025-10-14T10:30:00Z',
    isOutbound: false,
    type: 'sms'
  },
  {
    id: '2',
    content: 'Hello! Thanks for reaching out. The project would take approximately 3-5 days depending on weather conditions. We can start next week if you approve.',
    timestamp: '2025-10-14T11:15:00Z',
    isOutbound: true,
    type: 'sms',
    status: 'read'
  },
  {
    id: '3',
    content: 'That sounds good. What about the materials? Are they included in the quote?',
    timestamp: '2025-10-14T14:20:00Z',
    isOutbound: false,
    type: 'email'
  },
  {
    id: '4',
    content: 'Yes, all materials are included. We use premium shingles with a 25-year warranty.',
    timestamp: '2025-10-14T14:45:00Z',
    isOutbound: true,
    type: 'email',
    status: 'delivered'
  },
  {
    id: '5',
    content: 'Thanks for the quote, when can we schedule?',
    timestamp: '2025-10-14T15:54:02Z',
    isOutbound: false,
    type: 'sms'
  }
];

interface ChatAreaProps {
  conversationId: string | null;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [activeChannel, setActiveChannel] = useState<ChannelType>('sms');

  const contactData = {
    phone: '+13073727509',
    email: 'john.smith@email.com',
    phoneVerified: false,
    emailVerified: true
  };

  const hasPhone = Boolean(contactData.phone);
  const hasEmail = Boolean(contactData.email);

  const handleSendMessage = (message: string, metadata: any) => {
    console.log('Sending message:', {
      channel: activeChannel,
      message,
      metadata,
    });
    // In production, call API to send message based on channel type
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
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JS</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">John Smith</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">+13073727509</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
            {formatDate(mockMessages[0]?.timestamp)}
          </span>
        </div>
        
        {mockMessages.map((message, index) => {
          const prevMessage = index > 0 ? mockMessages[index - 1] : null;
          const showTimestamp = !prevMessage ||
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000;

          const getMessageColor = () => {
            if (message.isOutbound) {
              return message.type === 'email' ? 'bg-blue-500' : 'bg-green-500';
            }
            return 'bg-white dark:bg-gray-800';
          };

          const getBorderColor = () => {
            if (message.isOutbound) return '';
            return message.type === 'email'
              ? 'border-l-4 border-blue-500'
              : 'border-l-4 border-green-500';
          };

          return (
            <div key={message.id} className="flex flex-col">
              {showTimestamp && (
                <div className="text-center my-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${message.isOutbound ? 'justify-end' : 'justify-start'} mb-1`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 ${
                    message.isOutbound
                      ? `${getMessageColor()} text-white rounded-[20px] rounded-br-[4px] shadow-md`
                      : `${getMessageColor()} ${getBorderColor()} text-gray-900 dark:text-white rounded-[20px] rounded-bl-[4px] shadow-sm`
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                  {message.isOutbound && message.status && (
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs opacity-75">
                        {message.status === 'read' ? 'Read' : message.status === 'delivered' ? 'Delivered' : 'Sent'}
                      </span>
                      {message.status === 'read' || message.status === 'delivered' ? (
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
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Channel Tabs */}
        <ChannelTabs
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          hasPhone={hasPhone}
          hasEmail={hasEmail}
        />

        {/* Dynamic Message Input */}
        <div className="p-4">
          {activeChannel === 'sms' && (
            <MessageInputSMS
              onSend={handleSendMessage}
              fromNumber="+1 813-527-9352"
              toNumber={contactData.phone}
              contactName="John Smith"
            />
          )}

          {activeChannel === 'email' && (
            <MessageInputEmail
              onSend={handleSendMessage}
              contactEmail={contactData.email}
              contactName="John Smith"
            />
          )}

          {activeChannel === 'internal_comment' && (
            <MessageInputInternalComment onSend={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}