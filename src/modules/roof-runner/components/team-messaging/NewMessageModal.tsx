import React, { useState, useEffect } from 'react';
import { X, Search, Users, User } from 'lucide-react';
import { TeamContact, MessageType } from '../../types/teamMessaging';

interface NewMessageModalProps {
  show: boolean;
  contacts: TeamContact[];
  onClose: () => void;
  onSend: (messageType: MessageType, contactIds: string[], groupName: string, message: string) => void;
  loading?: boolean;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  show,
  contacts,
  onClose,
  onSend,
  loading = false,
}) => {
  const [messageType, setMessageType] = useState<MessageType>('individual');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (show) {
      setMessageType('individual');
      setSelectedContacts([]);
      setGroupName('');
      setMessage('');
      setSearchQuery('');
    }
  }, [show]);

  if (!show) return null;

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery)
  );

  const handleContactToggle = (contactId: string) => {
    if (messageType === 'individual') {
      setSelectedContacts([contactId]);
    } else {
      setSelectedContacts(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    }
  };

  const handleSend = () => {
    if (selectedContacts.length === 0 || !message.trim()) return;
    if (messageType === 'group' && !groupName.trim()) return;

    onSend(messageType, selectedContacts, groupName, message.trim());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isValid = selectedContacts.length > 0 &&
    message.trim() &&
    (messageType === 'individual' || groupName.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Team Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMessageType('individual');
                  setSelectedContacts([]);
                  setGroupName('');
                }}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  messageType === 'individual'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:text-gray-300'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Individual Message</span>
              </button>
              <button
                onClick={() => {
                  setMessageType('group');
                  setSelectedContacts([]);
                }}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  messageType === 'group'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:text-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Group Message</span>
              </button>
            </div>
          </div>

          {/* Group Name (only for group messages) */}
          {messageType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipients <span className="text-red-500">*</span>
              {messageType === 'group' && selectedContacts.length > 0 && (
                <span className="ml-2 text-gray-500">({selectedContacts.length} selected)</span>
              )}
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Contact List */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No contacts found' : 'No team members available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactToggle(contact.id)}
                      className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                        selectedContacts.includes(contact.id)
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : ''
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ backgroundColor: contact.avatar_color }}
                      >
                        {contact.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.type === 'staff' ? 'Staff' : contact.type === 'adjuster' ? 'Adjuster' : 'Sub-Contractor'} • {contact.email || contact.phone}
                        </p>
                      </div>
                      <input
                        type={messageType === 'individual' ? 'radio' : 'checkbox'}
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!isValid || loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;
