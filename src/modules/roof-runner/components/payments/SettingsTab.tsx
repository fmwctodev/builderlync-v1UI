import React, { useState } from 'react';

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    autoReceipts: true,
    receiptTitle: 'RECEIPT',
    receiptPrefix: 'REC',
    receiptStartNumber: '10001',
    fromName: '',
    fromEmail: '',
    subject: '[{{receipt.company.name}}] Thank you for your recent purchase',
    emailTemplate: 'default',
  });

  const settingsCategories = [
    { id: 'receipts', label: 'Receipts' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'origin', label: 'Shipping Origin' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'charges', label: 'Miscellaneous Charges' },
    { id: 'payment-link', label: 'Payment Link Customization' },
  ];

  const [activeCategory, setActiveCategory] = useState('receipts');

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
          <nav className="space-y-1">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="p-8 max-w-4xl">
          {activeCategory === 'receipts' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Receipts</h1>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Enable automatic sales receipts for payments
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoReceipts}
                      onChange={(e) =>
                        setSettings({ ...settings, autoReceipts: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.receiptTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, receiptTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Receipt prefix <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={settings.receiptPrefix}
                          onChange={(e) =>
                            setSettings({ ...settings, receiptPrefix: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                          xyz
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Prefix to be used while generating all receipts
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Receipt start number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.receiptStartNumber}
                        onChange={(e) =>
                          setSettings({ ...settings, receiptStartNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Define the number to be used when creating the first receipt. The
                        number will automatically increment with each receipt created
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.fromName}
                      onChange={(e) =>
                        setSettings({ ...settings, fromName: e.target.value })
                      }
                      placeholder="From Name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Name used while sending receipt notifications. If left blank, business
                      name will be used
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.fromEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, fromEmail: e.target.value })
                      }
                      placeholder="From Email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Email address used while sending receipt notifications. If left blank,
                      business email will be used
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={settings.subject}
                        onChange={(e) =>
                          setSettings({ ...settings, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Template
                    </label>
                    <select
                      value={settings.emailTemplate}
                      onChange={(e) =>
                        setSettings({ ...settings, emailTemplate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="default">Default</option>
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory !== 'receipts' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {settingsCategories.find((c) => c.id === activeCategory)?.label} settings
                will be available here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
