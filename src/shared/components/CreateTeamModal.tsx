import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Users, Check } from 'lucide-react';
import { searchContacts } from '../services/conversationsApi';
import { smtpApi } from '../services/smtpApi';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onTeamCreated }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contact: any) => {
    const isSelected = selectedContacts.find(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim() || selectedContacts.length === 0) return;

    setCreating(true);
    try {
      const members = selectedContacts.map(contact => ({
        user_id: contact.id,
        email: contact.email,
        phone: contact.phone,
        role: 'member'
      }));

      await smtpApi.createTeam(teamName, '', members);
      onTeamCreated();
      onClose();
      
      // Reset form
      setTeamName('');
      setSelectedContacts([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-900">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Team</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select multiple customers for your team</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Name */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Name *
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Selected Contacts */}
        {selectedContacts.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected ({selectedContacts.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {contact.full_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{contact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleContact(contact)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Search Results</h4>
              <div className="space-y-2">
                {searchResults.map((contact) => {
                  const isSelected = selectedContacts.find(c => c.id === contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleContact(contact)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {contact.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{contact.email}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No customers found</p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Search for customers to add to your team</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTeam}
              disabled={!teamName.trim() || selectedContacts.length === 0 || creating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{creating ? 'Creating...' : `Create Team (${selectedContacts.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}