import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { searchContactsByTypeAndName, Contact } from '../../../shared/store/services/contactsApi';

interface ContactSearchDropdownProps {
  selectedContact: { id: string; name: string } | null;
  onSelectContact: (contact: { id: string; name: string } | null) => void;
  disabled?: boolean;
}

const ContactSearchDropdown: React.FC<ContactSearchDropdownProps> = ({
  selectedContact,
  onSelectContact,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContacts = async () => {
      if (searchTerm.length < 2) {
        setContacts([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchContactsByTypeAndName(searchTerm, ['customer', 'lead']);
        setContacts(results);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Error searching contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSelectContact = (contact: Contact) => {
    onSelectContact({
      id: contact.id,
      name: contact.full_name
    });
    setSearchTerm('');
    setIsOpen(false);
    setContacts([]);
  };

  const handleClearSelection = () => {
    onSelectContact(null);
    setSearchTerm('');
    setContacts([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || contacts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < contacts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < contacts.length) {
          handleSelectContact(contacts[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  if (selectedContact) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedContact.name}
            </span>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Search for customer or lead..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Searching...
            </div>
          ) : contacts.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No contacts found
            </div>
          ) : (
            <ul className="py-1">
              {contacts.map((contact, index) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.full_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.email || contact.phone}
                          {contact.company && ` • ${contact.company}`}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {contact.type}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
};

export default ContactSearchDropdown;
