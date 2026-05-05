import React, { useState, useEffect } from 'react';
import { X, Phone, Delete, Clock, Users, Grid3x3, Voicemail, List, ChevronDown } from 'lucide-react';

interface DialerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'recents' | 'contacts' | 'keypad' | 'voicemail' | 'queue';

interface PhoneNumber {
  id: number;
  number: string;
  friendlyName: string;
  isDefault?: boolean;
}

interface RecentCall {
  id: number;
  name: string;
  number: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

const DialerModal: React.FC<DialerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('keypad');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableNumbers: PhoneNumber[] = [
    { id: 1, number: '+18135279352', friendlyName: 'Tampa Bay Area', isDefault: true },
    { id: 2, number: '+15127771219', friendlyName: 'Local', isDefault: false },
    { id: 3, number: '+17372588840', friendlyName: 'Local', isDefault: false },
    { id: 4, number: '+18004703660', friendlyName: 'Toll Free', isDefault: false },
  ];

  const recentCalls: RecentCall[] = [
    { id: 1, name: 'John Smith', number: '+1 (555) 123-4567', time: '2 mins ago', type: 'incoming' },
    { id: 2, name: 'Sarah Johnson', number: '+1 (555) 987-6543', time: '15 mins ago', type: 'outgoing' },
    { id: 3, name: 'Mike Wilson', number: '+1 (555) 456-7890', time: '1 hour ago', type: 'missed' },
    { id: 4, name: 'Emily Davis', number: '+1 (555) 321-9876', time: '2 hours ago', type: 'outgoing' },
  ];

  const contacts: Contact[] = [
    { id: 1, name: 'John Smith', phone: '+1 (555) 123-4567', email: 'john@example.com' },
    { id: 2, name: 'Sarah Johnson', phone: '+1 (555) 987-6543', email: 'sarah@example.com' },
    { id: 3, name: 'Mike Wilson', phone: '+1 (555) 456-7890', email: 'mike@example.com' },
    { id: 4, name: 'Emily Davis', phone: '+1 (555) 321-9876', email: 'emily@example.com' },
  ];

  useEffect(() => {
    const defaultNumber = availableNumbers.find((num) => num.isDefault);
    if (defaultNumber) {
      setSelectedNumber(defaultNumber);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('keypad');
      setPhoneNumber('');
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleNumberClick = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length > 0) {
      console.log('Calling:', phoneNumber, 'from:', selectedNumber?.number);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const formatDisplayNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return number;
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Phone</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {activeTab === 'keypad' && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowNumberDropdown(!showNumberDropdown)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Calling From
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedNumber?.friendlyName} • {formatDisplayNumber(selectedNumber?.number || '')}
                        </div>
                      </div>
                      <ChevronDown size={20} className="text-gray-500" />
                    </button>

                    {showNumberDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 max-h-60 overflow-y-auto">
                        {availableNumbers.map((num) => (
                          <button
                            key={num.id}
                            onClick={() => {
                              setSelectedNumber(num);
                              setShowNumberDropdown(false);
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="text-left">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {num.friendlyName}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDisplayNumber(num.number)}
                              </div>
                            </div>
                            {num.id === selectedNumber?.id && (
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    value={phoneNumber ? formatPhoneNumber(phoneNumber) : ''}
                    placeholder="|"
                    readOnly
                    className="w-full text-3xl font-light text-center text-gray-900 dark:text-white bg-transparent border-none outline-none cursor-default"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'keypad' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleNumberClick(digit)}
                      className="h-16 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light text-gray-900 dark:text-white"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={handleCall}
                    disabled={phoneNumber.length === 0}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg"
                  >
                    <Phone size={24} className="text-white" />
                  </button>

                  <button
                    onClick={handleBackspace}
                    disabled={phoneNumber.length === 0}
                    className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Delete size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'recents' && (
              <div className="space-y-2">
                {recentCalls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => {
                      setPhoneNumber(call.number.replace(/\D/g, ''));
                      setActiveTab('keypad');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        call.type === 'missed'
                          ? 'bg-red-100 dark:bg-red-900/20'
                          : 'bg-green-100 dark:bg-green-900/20'
                      }`}
                    >
                      <Phone
                        size={18}
                        className={
                          call.type === 'missed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{call.number}</div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{call.time}</div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="space-y-2 mt-4">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setPhoneNumber(contact.phone.replace(/\D/g, ''));
                        setActiveTab('keypad');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {contact.phone}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'voicemail' && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Voicemail size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No voicemails</p>
              </div>
            )}

            {activeTab === 'queue' && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <List size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No calls in queue</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setActiveTab('recents')}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  activeTab === 'recents'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Clock size={20} />
                <span className="text-xs font-medium">Recents</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  activeTab === 'contacts'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Users size={20} />
                <span className="text-xs font-medium">Contacts</span>
              </button>

              <button
                onClick={() => setActiveTab('keypad')}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  activeTab === 'keypad'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Grid3x3 size={20} />
                <span className="text-xs font-medium">Keypad</span>
              </button>

              <button
                onClick={() => setActiveTab('voicemail')}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  activeTab === 'voicemail'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Voicemail size={20} />
                <span className="text-xs font-medium">Voicemail</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  activeTab === 'queue'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <List size={20} />
                <span className="text-xs font-medium">Queue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialerModal;
