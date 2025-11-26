import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Search } from 'lucide-react';
import { Card } from '../ui/Card';
import {
  getConversations,
  subscribeToConversations,
  Conversation,
} from '../../../../shared/services/conversationsApi';
import { supabase } from '../../../../shared/lib/supabase';


interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const [selectedInbox, setSelectedInbox] = useState<'all' | 'sms' | 'calls' | 'emails'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = subscribeToConversations(user.id, () => {
        loadConversations();
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    setupSubscription();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'phone': return <Phone className="w-4 h-4 text-gray-500" />;
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'sms':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'email':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      case 'phone':
        return 'bg-gray-100 dark:bg-gray-700 border-gray-500';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-500';
    }
  };

  // Filter conversations based on selected inbox and search query
  const filteredConversations = conversations.filter((conv) => {
    // Filter by channel
    if (selectedInbox !== 'all') {
      if (selectedInbox === 'calls' && conv.channel !== 'phone') return false;
      if (selectedInbox === 'emails' && conv.channel !== 'email') return false;
      if (selectedInbox === 'sms' && conv.channel !== 'sms') return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = conv.contact?.full_name?.toLowerCase() || '';
      const phone = conv.contact?.phone?.toLowerCase() || '';
      const email = conv.contact?.email?.toLowerCase() || '';
      const lastMsg = conv.last_message?.content?.toLowerCase() || '';

      return name.includes(query) || phone.includes(query) || email.includes(query) || lastMsg.includes(query);
    }

    return true;
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conversations</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Inbox Filter */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All', icon: MessageSquare, color: 'gray' },
            { key: 'sms', label: 'SMS', icon: MessageSquare, color: 'green' },
            { key: 'calls', label: 'Calls', icon: Phone, color: 'gray' },
            { key: 'emails', label: 'Email', icon: Mail, color: 'blue' }
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setSelectedInbox(key as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedInbox === key
                  ? color === 'green'
                    ? 'bg-green-500 text-white shadow-md'
                    : color === 'blue'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-700 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400">Loading conversations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all ${
                selectedConversation === conversation.id
                  ? 'bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent border-l-4 border-l-primary-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-semibold text-white">
                      {conversation.contact?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getChannelBadge(conversation.channel)}`}>
                    <div className="w-full h-full flex items-center justify-center">
                      {conversation.channel === 'sms' && <MessageSquare className="w-2 h-2 text-green-600" />}
                      {conversation.channel === 'email' && <Mail className="w-2 h-2 text-blue-600" />}
                      {conversation.channel === 'phone' && <Phone className="w-2 h-2 text-gray-600" />}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.contact?.full_name || 'Unknown Contact'}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conversation.last_message?.content || 'No messages yet'}
                  </p>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center space-x-2">
                      {getIcon(conversation.channel)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.contact?.phone || conversation.contact?.email || 'No contact info'}
                      </span>
                    </div>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <span className="bg-primary-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}