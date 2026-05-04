import React, { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { searchContacts, createContact } from '../../../../shared/services/conversationsApi';

interface Contact {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (contactId: string) => void;
  searchName?: string;
}

export function DirectMessageModal({ isOpen, onClose, onCreateConversation, searchName }: DirectMessageModalProps) {
  const [step, setStep] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearchContacts();
    } else {
      setContacts([]);
    }
  }, [searchQuery]);

  const handleSearchContacts = async () => {
    setLoading(true);
    try {
      const data = await searchContacts(searchQuery);
      setContacts(data || []);
    } catch (error) {
      console.error('Failed to search contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setStep('create');
  };

  const handleCreateContact = async () => {
    try {
      console.log('Creating contact:', {
        full_name: `${newContact.firstName} ${newContact.lastName}`.trim(),
        email: newContact.email,
        phone: newContact.phone
      });
      
      const fullName = searchQuery.trim() || `${newContact.firstName} ${newContact.lastName}`.trim();
      const contact = await createContact({
        full_name: fullName,
        email: newContact.email,
        phone: newContact.phone
      });
      
      console.log('Contact created:', contact);
      resetModal();
      onCreateConversation(contact.id);
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Failed to create contact: ' + error.message);
    }
  };

  const resetModal = () => {
    setStep('search');
    setSearchQuery('');
    setContacts([]);
    setNewContact({ firstName: '', lastName: '', email: '', phone: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleContactSelect = (contactId: string) => {
    resetModal();
    onCreateConversation(contactId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Message
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'search' ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Contact
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400">Searching...</div>
              </div>
            ) : searchQuery.trim() && contacts.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400 mb-4">No contacts found</div>
                <button
                  onClick={handleAddContact}
                  className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact "{searchQuery}"
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{contact.full_name}</div>
                    {contact.email && <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>}
                    {contact.phone && <div className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</div>}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                  placeholder="First Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContact}
                disabled={!searchQuery.trim() && !newContact.firstName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}