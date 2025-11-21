import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Search } from 'lucide-react';
import { Card } from '../ui/Card';

interface ConversationItem {
  id: string;
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    type: 'sms' | 'call' | 'email';
  };
  unreadCount: number;
}

const mockConversations: ConversationItem[] = [
  {
    id: '1',
    contact: { name: 'John Smith', phone: '+13073727509' },
    lastMessage: {
      content: 'Thanks for the quote, when can we schedule?',
      timestamp: '2025-10-14T15:54:02Z',
      type: 'sms'
    },
    unreadCount: 2
  },
  {
    id: '2',
    contact: { name: 'Sarah Johnson', phone: '+15551234567' },
    lastMessage: {
      content: 'Missed call',
      timestamp: '2025-10-14T14:30:00Z',
      type: 'call'
    },
    unreadCount: 1
  }
];

interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [selectedInbox, setSelectedInbox] = useState<'all' | 'sms' | 'calls' | 'emails'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conversations</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Inbox Filter */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', icon: MessageSquare },
            { key: 'sms', label: 'SMS', icon: MessageSquare },
            { key: 'calls', label: 'Calls', icon: Phone },
            { key: 'emails', label: 'Email', icon: Mail }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedInbox(key as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                selectedInbox === key
                  ? 'bg-primary-100 text-blue-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              selectedConversation === conversation.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conversation.contact.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getIcon(conversation.lastMessage.type)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {conversation.lastMessage.content}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.contact.phone}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}