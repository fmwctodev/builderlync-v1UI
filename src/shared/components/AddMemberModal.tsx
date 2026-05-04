import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { addTeamMember } from '../store/services/teamMessagingApi';
import { searchContacts } from '../services/conversationsApi';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  type: 'staff' | 'sub-contractor' | 'adjuster';
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  existingMembers: string[];
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  existingMembers,
  onMemberAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchContacts(searchQuery);
      // Filter out existing members
      const filteredResults = results.filter(contact => !existingMembers.includes(contact.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedContact) return;

    try {
      setAdding(true);
      await addTeamMember(teamId, {
        user_id: parseInt(selectedContact.id),
        email: selectedContact.email,
        phone: selectedContact.phone,
        role
      });
      
      onMemberAdded();
      onClose();
      setSelectedContact(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Add Member to {teamName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Contacts
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Contact
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery.trim() ? 'No contacts found' : 'Start typing to search contacts'}
                </div>
              ) : (
                searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{contact.full_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                    <div className="text-xs text-gray-400 capitalize">{contact.type}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={!selectedContact || adding}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <UserPlus size={16} />
              <span>{adding ? 'Adding...' : 'Add Member'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};