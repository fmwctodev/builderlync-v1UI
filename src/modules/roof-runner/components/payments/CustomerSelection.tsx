import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Contact } from '../../../../shared/store/services/contactsApi';
import { supabase } from '../../../../shared/lib/supabase';
import { getQuickBooksCustomers, QuickBooksCustomer } from '../../../../shared/store/services/quickbooksApi';

interface CustomerSelectionProps {
  selectedCustomer: Contact | null;
  onCustomerChange: (customer: Contact | null) => void;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  selectedCustomer,
  onCustomerChange
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [syncingQB, setSyncingQB] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredContacts(contacts);
      setShowDropdown(false);
    }
  }, [searchTerm, contacts]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setContacts(data || []);
      setFilteredContacts(data || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncQuickBooksCustomers = async () => {
    setSyncingQB(true);
    try {
      const response = await getQuickBooksCustomers();
      if (response.success && response.data) {
        console.log('QuickBooks customers synced:', response.data.length);
        await loadContacts();
      }
    } catch (err) {
      console.error('Error syncing QuickBooks customers:', err);
    } finally {
      setSyncingQB(false);
    }
  };

  const selectCustomer = (contact: Contact) => {
    onCustomerChange(contact);
    setSearchTerm(contact.full_name);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Customer *
        </label>
        <div className="relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.full_name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedCustomer) {
                    onCustomerChange(null);
                  }
                }}
                onFocus={() => !selectedCustomer && setShowDropdown(true)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="button"
              onClick={syncQuickBooksCustomers}
              disabled={syncingQB}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              title="Sync QuickBooks Customers"
            >
              <RefreshCw size={18} className={syncingQB ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync QB</span>
            </button>

            <button
              type="button"
              onClick={() => {/* Open create customer modal */}}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>

          {showDropdown && filteredContacts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectCustomer(contact)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{contact.full_name}</div>
                  {contact.email && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</div>
                  )}
                  {contact.company && (
                    <div className="text-sm text-gray-500 dark:text-gray-500">{contact.company}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="p-4 bg-paper dark:bg-canvas rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Customer</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-900 dark:text-white font-medium">{selectedCustomer.full_name}</p>
            {selectedCustomer.email && (
              <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
            )}
            {selectedCustomer.phone && (
              <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.phone}</p>
            )}
            {selectedCustomer.address && (
              <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.address}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelection;
