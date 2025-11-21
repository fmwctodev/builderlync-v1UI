import React, { useState } from 'react';
import { Plus, Search, RefreshCw, MoreVertical } from 'lucide-react';

interface PhoneNumber {
  id: number;
  number: string;
  friendlyName: string;
  forwardingNumber: string;
  callTimeout?: string;
  isDefault?: boolean;
  countryCode: string;
}

const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phone-numbers' | 'number-pools'>('phone-numbers');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [phoneNumbers] = useState<PhoneNumber[]>([
    {
      id: 1,
      number: '+1 512-777-1219',
      friendlyName: 'Local',
      forwardingNumber: '+1 386-575-8489',
      callTimeout: '',
      isDefault: true,
      countryCode: 'US'
    },
    {
      id: 2,
      number: '+1 737-258-8840',
      friendlyName: 'Local',
      forwardingNumber: '+1 386-575-8489',
      callTimeout: '',
      isDefault: false,
      countryCode: 'US'
    },
    {
      id: 3,
      number: '+1 512-710-1138',
      friendlyName: 'Local',
      forwardingNumber: '',
      callTimeout: '',
      isDefault: false,
      countryCode: 'US'
    },
    {
      id: 4,
      number: '+1 979-596-5774',
      friendlyName: 'Local',
      forwardingNumber: '+1 386-575-8489',
      callTimeout: '',
      isDefault: false,
      countryCode: 'US'
    },
    {
      id: 5,
      number: '+1 800-470-3660',
      friendlyName: 'Toll Free',
      forwardingNumber: '+1 386-575-8489',
      callTimeout: '',
      isDefault: false,
      countryCode: 'US'
    }
  ]);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const filteredPhoneNumbers = phoneNumbers.filter(phone =>
    phone.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phone.friendlyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phone.forwardingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Communications</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure email, SMS, and voice settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Numbers</h3>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium dark:bg-blue-900 dark:text-blue-200">
                  {phoneNumbers.length} Phone Numbers
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your Phone Numbers and their configuration here
              </p>
            </div>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <Plus size={16} />
              <span>Add Number</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('phone-numbers')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'phone-numbers'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Phone Numbers
                {activeTab === 'phone-numbers' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('number-pools')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'number-pools'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Number Pools
                {activeTab === 'number-pools' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'phone-numbers' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Numbers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Friendly Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Forwarding Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Call Timeout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPhoneNumbers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No phone numbers found
                      </td>
                    </tr>
                  ) : (
                    filteredPhoneNumbers.map((phone) => (
                      <tr key={phone.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                              <svg viewBox="0 0 32 32" className="w-full h-full">
                                <rect width="32" height="32" fill="#fff"/>
                                <path d="M0 0h32v2.462H0zm0 4.923h32v2.462H0zm0 4.924h32v2.461H0zm0 4.923h32v2.462H0zm0 4.923h32v2.462H0zm0 4.923h32v2.462H0zm0 4.924h32V32H0z" fill="#B22234"/>
                                <path fill="#3C3B6E" d="M0 0h12.8v17.231H0z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {phone.number}
                              </div>
                              {phone.isDefault && (
                                <span className="inline-block mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  Default Number
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {phone.friendlyName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {phone.forwardingNumber ? formatPhoneNumber(phone.forwardingNumber) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {phone.callTimeout || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {!phone.forwardingNumber ? (
                              <button className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                Add
                              </button>
                            ) : (
                              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <MoreVertical size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredPhoneNumbers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700">
                    {currentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'number-pools' && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            Number Pools section - Coming soon
          </div>
        )}
      </div>
    </div>
  );
};

export default Communications;
