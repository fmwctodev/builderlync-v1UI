import React, { useState } from 'react';
import { Search, Filter, Download, X, CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Download className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-6 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>All Payments</span>
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'batches'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Batches and Funding</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="w-96 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter & Sort</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'all' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {['Payment ID', 'Customer', 'Amount', 'Method', 'Status', 'Funding Status', 'Date', 'Actions'].map(header => (
                          <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {Array.from({ length: 15 }, (_, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">PAY-{1000 + i}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Customer {i + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">${(Math.random() * 5000 + 500).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              i % 4 === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              i % 4 === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              i % 4 === 2 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            }`}>
                              {i % 4 === 0 ? 'Credit Card' : i % 4 === 1 ? 'ACH' : i % 4 === 2 ? 'Check' : 'Cash'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              i % 4 === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              i % 4 === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                              i % 4 === 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                            }`}>
                              {i % 4 === 0 ? 'Approved' : i % 4 === 1 ? 'Pending' : i % 4 === 2 ? 'Failed' : 'Declined'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              i % 5 === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              i % 5 === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              i % 5 === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                              i % 5 === 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            }`}>
                              {i % 5 === 0 ? 'Funded' : i % 5 === 1 ? 'In Transit' : i % 5 === 2 ? 'Not Funded' : i % 5 === 3 ? 'Error' : 'ACH Return'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Batches and Funding Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Batches</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">24</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Funded</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">$45,230.50</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">$8,450.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {['Batch', 'Batch Close Date', 'Expected Deposit Date', 'Method', '# of Payments', 'Transfer Status', 'Chargebacks', 'ACH Returns', 'Billing and Fee'].map(header => (
                            <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 10 }, (_, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">BATCH-{2024000 + i}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                i % 3 === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                i % 3 === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              }`}>
                                {i % 3 === 0 ? 'Credit Card' : i % 3 === 1 ? 'ACH' : 'Mixed'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 50) + 5}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                i % 4 === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                i % 4 === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                i % 4 === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                {i % 4 === 0 ? 'Completed' : i % 4 === 1 ? 'Pending' : i % 4 === 2 ? 'In Transit' : 'Failed'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 3)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.floor(Math.random() * 2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">${(Math.random() * 100 + 10).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6 space-y-6">
              {/* Default Payment Methods */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default payment methods</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">When you create future payment requests, these will be the default acceptable payment methods. You can change them for each individual request.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Credit card</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard, Discover</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Show fee details</button>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">American Express</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Amex cards</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Show fee details</button>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">ACH</h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Show fee details</button>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Fees */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform fees</h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Beta</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Pass on credit card and ACH platform fees to your customers</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Pass through fees for credit card payments</h4>
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Show fee details</button>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Pass through fees for ACH payments</h4>
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Show fee details</button>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter & Sort</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Applied Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applied filters</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">No filter selected</p>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort</h4>
                <div className="space-y-2">
                  {[
                    'Payment date (latest)',
                    'Payment date (oldest)',
                    'Amount (lowest)',
                    'Amount (highest)'
                  ].map(option => (
                    <label key={option} className="flex items-center">
                      <input type="radio" name="sort" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment method</h4>
                <div className="space-y-2">
                  {['Credit card', 'ACH', 'Check', 'Cash', 'Financing'].map(method => (
                    <label key={method} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment status</h4>
                <div className="space-y-2">
                  {['Approved', 'Pending', 'Failed', 'Declined'].map(status => (
                    <label key={status} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Funding Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Funding status</h4>
                <div className="space-y-2">
                  {['Not funded', 'Funded', 'In transit', 'Error', 'ACH Return or Chargeback'].map(status => (
                    <label key={status} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;