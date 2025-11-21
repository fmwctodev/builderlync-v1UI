import React, { useState } from 'react';
import { Plus, Search, RefreshCw, MoreVertical, Lock } from 'lucide-react';

interface PhoneNumber {
  id: number;
  number: string;
  friendlyName: string;
  forwardingNumber: string;
  callTimeout?: string;
  isDefault?: boolean;
  countryCode: string;
}

type MainTab = 'phone-numbers' | 'voice' | 'additional-settings';
type PhoneNumberTab = 'phone-numbers' | 'number-pools';
type VoiceTab = 'call-recording' | 'voicemail' | 'call-scripts' | 'voip' | 'other-settings';

const Communications: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>('phone-numbers');
  const [phoneNumberTab, setPhoneNumberTab] = useState<PhoneNumberTab>('phone-numbers');
  const [voiceTab, setVoiceTab] = useState<VoiceTab>('call-recording');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoDeleteRecordings, setAutoDeleteRecordings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('twilio');

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

      <div className="space-y-4">
        <div className="flex items-center space-x-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mr-8">Phone System</h3>
          <button
            onClick={() => setMainTab('phone-numbers')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              mainTab === 'phone-numbers'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Phone Numbers
            {mainTab === 'phone-numbers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setMainTab('voice')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              mainTab === 'voice'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Voice
            {mainTab === 'voice' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setMainTab('additional-settings')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              mainTab === 'additional-settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Additional Settings
            {mainTab === 'additional-settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
        </div>

        {mainTab === 'phone-numbers' && (
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
                    onClick={() => setPhoneNumberTab('phone-numbers')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                      phoneNumberTab === 'phone-numbers'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Phone Numbers
                    {phoneNumberTab === 'phone-numbers' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setPhoneNumberTab('number-pools')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                      phoneNumberTab === 'number-pools'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Number Pools
                    {phoneNumberTab === 'number-pools' && (
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

            {phoneNumberTab === 'phone-numbers' && (
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

            {phoneNumberTab === 'number-pools' && (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Number Pools section - Coming soon
              </div>
            )}
          </div>
        )}

        {mainTab === 'voice' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Voice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up how your calls work - routing, recording, and more
                </p>
              </div>

              <div className="flex space-x-6">
                <div className="w-64 flex-shrink-0">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setVoiceTab('call-recording')}
                      className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        voiceTab === 'call-recording'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      Call Recording
                    </button>
                    <button
                      onClick={() => setVoiceTab('voicemail')}
                      className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        voiceTab === 'voicemail'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      Voicemail & Missed Call TextBack
                    </button>
                    <button
                      onClick={() => setVoiceTab('call-scripts')}
                      className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        voiceTab === 'call-scripts'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      Call Scripts
                    </button>
                    <button
                      onClick={() => setVoiceTab('voip')}
                      className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        voiceTab === 'voip'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      VoIP deskphone (SIP)
                    </button>
                    <button
                      onClick={() => setVoiceTab('other-settings')}
                      className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        voiceTab === 'other-settings'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      Other Settings
                    </button>
                  </nav>
                </div>

                <div className="flex-1">
                  {voiceTab === 'call-recording' && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Recording</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Maintain a record of Voice calls. Call Recordings can be enabled/disabled under Phone Number Settings
                      </p>

                      <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <button
                          onClick={() => setAutoDeleteRecordings(!autoDeleteRecordings)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            autoDeleteRecordings ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              autoDeleteRecordings ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Automatically Delete Older Recordings?
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enable automatic deletion to free up storage and reduce costs by removing recordings after a set time. This action is permanent and cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {voiceTab === 'voicemail' && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Voicemail & Missed Call TextBack - Coming soon
                    </div>
                  )}

                  {voiceTab === 'call-scripts' && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Call Scripts - Coming soon
                    </div>
                  )}

                  {voiceTab === 'voip' && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      VoIP deskphone (SIP) - Coming soon
                    </div>
                  )}

                  {voiceTab === 'other-settings' && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Other Settings - Coming soon
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'additional-settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Additional Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure Additional Settings.
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
                  Telephony Provider
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Current Provider</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can choose your Telephony Provider
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Only Visible to Agency Owners
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Telephony Providers are only visible to agency admin and owners
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <button
                    onClick={() => setSelectedProvider('twilio')}
                    className={`w-full p-6 rounded-lg border-2 transition-colors text-left ${
                      selectedProvider === 'twilio'
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8" viewBox="0 0 30 30" fill="none">
                            <circle cx="15" cy="15" r="15" fill="#F22F46"/>
                            <circle cx="10" cy="10" r="2.5" fill="white"/>
                            <circle cx="20" cy="10" r="2.5" fill="white"/>
                            <circle cx="10" cy="20" r="2.5" fill="white"/>
                            <circle cx="20" cy="20" r="2.5" fill="white"/>
                            <circle cx="15" cy="15" r="2.5" fill="white"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">Twilio</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Twilio</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedProvider === 'twilio'
                            ? 'border-blue-500 dark:border-blue-400'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedProvider === 'twilio' && (
                            <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communications;
