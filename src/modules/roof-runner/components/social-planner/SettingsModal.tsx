import { useState } from 'react';
import { ArrowLeft, Search, Trash2, Edit, CheckCircle, Plus } from 'lucide-react';
import { SocialPlatform } from '../../../../shared/services/socialMediaApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

type TabId = 'social-accounts' | 'notifications';

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  status: 'connected' | 'expired';
  type: string;
  validity: string;
  verified: boolean;
  avatar?: string;
}

interface NotificationSetting {
  id: string;
  type: string;
  description: string;
  emailTemplate: string;
  usersToNotify: string;
  reminderFrequency: string;
  enabled: boolean;
}

const platforms = [
  { id: 'gbp', name: 'GBP', icon: '🔷' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
  { id: 'linkedin', name: 'Linkedin', icon: '💼' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌' },
  { id: 'youtube', name: 'Youtube', icon: '▶️' },
  { id: 'community', name: 'Community', icon: '👥' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋' },
];

export default function SettingsModal({ isOpen, onClose, initialTab = 'social-accounts' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab as TabId);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [accountFilter, setAccountFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [connectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      platform: 'GBP',
      accountName: 'Autom8ion Lab (Formerly Sitehues Media Inc.)',
      accountId: '087681265231371999936',
      status: 'connected',
      type: 'Location',
      validity: '-',
      verified: true,
    },
    {
      id: '2',
      platform: 'Facebook',
      accountName: 'Autom8ion Lab',
      accountId: '',
      status: 'connected',
      type: 'Page',
      validity: '59 days',
      verified: false,
    },
    {
      id: '3',
      platform: 'LinkedIn',
      accountName: 'autom8ionlab',
      accountId: '',
      status: 'connected',
      type: 'Professional',
      validity: '59 days',
      verified: false,
    },
    {
      id: '4',
      platform: 'LinkedIn',
      accountName: 'Autom8ion Lab',
      accountId: '',
      status: 'connected',
      type: 'Page',
      validity: '59 days',
      verified: false,
    },
    {
      id: '5',
      platform: 'LinkedIn',
      accountName: 'Sean Richard',
      accountId: '',
      status: 'connected',
      type: 'Profile',
      validity: '59 days',
      verified: false,
    },
    {
      id: '6',
      platform: 'TikTok',
      accountName: 'Autom8ion Lab',
      accountId: '',
      status: 'connected',
      type: 'Personal',
      validity: '8 months',
      verified: false,
    },
    {
      id: '7',
      platform: 'Instagram',
      accountName: 'Autom8ion Lab',
      accountId: '',
      status: 'connected',
      type: 'Profile',
      validity: '-',
      verified: true,
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      type: 'Account Pre-Expiry',
      description: 'Email notification for the social account that requires token refresh before it expires.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: false,
    },
    {
      id: '2',
      type: 'Account expired',
      description: 'Email notification for the social account with an expired token.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: false,
    },
    {
      id: '3',
      type: 'Request for Post Approval',
      description: 'Email notification to the approver of scheduled posts.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: true,
    },
    {
      id: '4',
      type: 'Approved Post',
      description: 'Email notification to the creator of the approved scheduled post.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: false,
    },
    {
      id: '5',
      type: 'Rejected Post',
      description: 'Email notification to the creator of the scheduled post which has been rejected with a comment.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: false,
    },
    {
      id: '6',
      type: 'Post Failed',
      description: 'Email notification for the scheduled post that failed, including the reason.',
      emailTemplate: 'Default Template',
      usersToNotify: '-',
      reminderFrequency: '-',
      enabled: false,
    },
  ]);

  const tabs = [
    { id: 'social-accounts' as TabId, label: 'Social Accounts' },
    { id: 'notifications' as TabId, label: 'Notifications' },
  ];

  const handleToggleNotification = (id: string) => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      console.log('Deleting account:', id);
    }
  };

  const filteredAccounts = connectedAccounts.filter(account => {
    const matchesFilter = accountFilter === 'all' ||
      (accountFilter === 'active' && account.status === 'connected') ||
      (accountFilter === 'expired' && account.status === 'expired');

    const matchesSearch = searchQuery === '' ||
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === 'all' ||
      account.platform.toLowerCase() === selectedPlatform.toLowerCase();

    return matchesFilter && matchesSearch && matchesPlatform;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Social Planner Settings</h2>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Social Accounts Tab */}
          {activeTab === 'social-accounts' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`w-full text-left px-4 py-2 rounded-md mb-1 ${
                    selectedPlatform === 'all'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center space-x-2 ${
                      selectedPlatform === platform.id
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Integration</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connect multiple social accounts</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Social
                    </button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAccountFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        accountFilter === 'all'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAccountFilter('active')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        accountFilter === 'active'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setAccountFilter('expired')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        accountFilter === 'expired'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Expired
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a social"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-red-600 focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Accounts Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Social Account
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Validity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {account.platform.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {account.accountName}
                                  </div>
                                  {account.verified && (
                                    <CheckCircle className="ml-2 h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                {account.accountId && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {account.accountId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              {account.status === 'connected' ? 'Connected' : 'Expired'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {account.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {account.validity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No accounts found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send alerts for post approvals, failures or account expirations
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notification Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User(s) to Notify
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reminder Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Alert Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {notificationSettings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {setting.type}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                            {setting.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {setting.emailTemplate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {setting.usersToNotify}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {setting.reminderFrequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleNotification(setting.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              setting.enabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
