import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Paperclip, Smile, X, Phone, MessageSquare, Mail, FileText } from 'lucide-react';
import { TeamMessageItem } from '../../types/teamMessaging';
import { SnippetSelector } from '../../../../shared/components/SnippetSelector';

interface MessageThreadProps {
  conversationId: string | null;
  messages: TeamMessageItem[];
  onSendMessage: (content: string, messageType?: 'sms' | 'email' | 'team', subject?: string) => void;
  loading?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  messages,
  onSendMessage,
  loading = false,
}) => {
  const [activeChannel, setActiveChannel] = useState<'sms' | 'email'>('sms');
  const [messageText, setMessageText] = useState('');
  const [subject, setSubject] = useState('');
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim(), activeChannel, subject || undefined);
      setMessageText('');
      setSubject('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const getTeamName = (conversationId: string) => {
    // Extract team name from conversation ID or use default
    return 'Team Chat';
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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Message: {getTeamName(conversationId)}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">Close conversation</span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
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
              const isOutbound = message.is_own_message;
              
              return (
                <div key={message.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isOutbound 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.message_type === 'email' ? (
                        <Mail className={`w-3 h-3 ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`} />
                      ) : (
                        <MessageSquare className={`w-3 h-3 ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`} />
                      )}
                      <span className={`text-xs font-medium ${isOutbound ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.message_type === 'email' ? 'EMAIL' : 'SMS'}
                      </span>
                    </div>
                    {(message.subject || (message.message_type === 'email' && message.subject)) && (
                      <p className={`text-xs font-medium mb-1 ${isOutbound ? 'text-blue-100' : 'text-gray-600'}`}>
                        Subject: {message.subject}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-xs mt-1 block ${
                      isOutbound ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
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
        </div>

        <div className="p-3">
          {activeChannel === 'email' ? (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type email message..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
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
                  <span className="text-sm text-gray-500">{messageText.split(' ').filter(w => w.length > 0).length} words</span>
                  <button 
                    onClick={() => {setMessageText(''); setSubject('');}}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => {
                      if (messageText.trim() && subject.trim()) {
                        onSendMessage(messageText.trim(), 'email', subject.trim());
                        setMessageText('');
                        setSubject('');
                      }
                    }}
                    disabled={!messageText.trim() || !subject.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type SMS message..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
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
                  <span className="text-sm text-gray-500">{messageText.split(' ').filter(w => w.length > 0).length} words</span>
                  <button 
                    onClick={() => setMessageText('')}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => {
                      if (messageText.trim()) {
                        onSendMessage(messageText.trim(), 'sms');
                        setMessageText('');
                      }
                    }}
                    disabled={!messageText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send SMS
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <SnippetSelector
        isOpen={showSnippetSelector}
        onClose={() => setShowSnippetSelector(false)}
        onSelectSnippet={(body, subjectText) => {
          setMessageText(body);
          if (subjectText && activeChannel === 'email') setSubject(subjectText);
        }}
        type={activeChannel === 'email' ? 'email' : 'text'}
      />
    </div>
  );
};

export default MessageThread;
