import React, { useState } from 'react';
import { Eye, Plus, Search, Filter, Download, MapPin, Calendar, User, MoreVertical, FileText, X } from 'lucide-react';

export default function Measurements() {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('Set to default');
  const [activeTab, setActiveTab] = useState('Reports');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState('50');
  const [pitchlessReports, setPitchlessReports] = useState(false);
  const [hideWasteRecommendations, setHideWasteRecommendations] = useState(false);
  const [hideMaterialCalculations, setHideMaterialCalculations] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderAddress, setOrderAddress] = useState('');
  const [showDIYModal, setShowDIYModal] = useState(false);
  const [diyAddress, setDiyAddress] = useState('');

  const orders = [
    {
      id: '001',
      address: '123 Main St, Anytown, ST 12345',
      type: 'Residential',
      status: 'Completed',
      date: '2024-01-15',
      customer: 'John Smith',
      assignee: 'Mike Johnson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
    {
      id: '002',
      address: '456 Oak Ave, Somewhere, ST 67890',
      type: 'Commercial',
      status: 'In Progress',
      date: '2024-01-18',
      customer: 'ABC Construction',
      assignee: 'Sarah Wilson'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Measurements</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Measurements</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowOrderModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Plus size={16} />
            <span>Order Report</span>
          </button>
          <button 
            onClick={() => setShowDIYModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus size={16} />
            <span>Create DIY</span>
          </button>
        </div>
      </div>

      {showNewOrder && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Measurement Order</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter property address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Create Report
            </button>
            <button
              onClick={() => setShowNewOrder(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('Reports')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'Reports'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Reports
                </button>
                <button
                  onClick={() => setActiveTab('Settings')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'Settings'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Roofr Report credits: <span className="font-medium text-gray-900 dark:text-white">0</span></div>
                <div>Image credits: <span className="font-medium text-gray-900 dark:text-white">0</span></div>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>

          </div>
        </div>

        {activeTab === 'Reports' && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Filter size={16} />
                  Filter
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { setFilterType('Set to default'); setShowFilter(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          filterType === 'Set to default' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Set to default
                      </button>
                      <button
                        onClick={() => { setFilterType('Roofr'); setShowFilter(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          filterType === 'Roofr' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Roofr
                      </button>
                      <button
                        onClick={() => { setFilterType('DIY'); setShowFilter(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          filterType === 'DIY' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        DIY
                      </button>
                      <button
                        onClick={() => { setFilterType('Multi-Building'); setShowFilter(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          filterType === 'Multi-Building' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Multi-Building
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report delivery</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Receive pitchless reports if pitch data is not available</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    In cases where pitch data is unavailable, we will deliver the Roofr report without pitch
                  </div>
                </div>
                <button
                  onClick={() => setPitchlessReports(!pitchlessReports)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pitchlessReports ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pitchlessReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Waste recommendations & material calculations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Hide waste recommendation on reports</div>
                  <button
                    onClick={() => setHideWasteRecommendations(!hideWasteRecommendations)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hideWasteRecommendations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideWasteRecommendations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">Hide material calculations on reports</div>
                  <button
                    onClick={() => setHideMaterialCalculations(!hideMaterialCalculations)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hideMaterialCalculations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideMaterialCalculations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{order.address}</div>
                        <div className="text-gray-500 dark:text-gray-400">{order.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {order.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {order.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                        <FileText size={16} />
                        Create Proposal
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        {openDropdown === order.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Create proposal</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">View proposal</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">View versions</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Edit report</button>
                              <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Download ESX</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Download PDF</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Download CSV</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Email report</button>
                              <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Report an issue</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel order</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Edit customer</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">View job</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Archive report</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Purchase DIY credits</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Workspace:</span> Tarrytown Roofing LLC
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A DIY credit is used to access Roofr's DIY editor and create a DIY report
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="credits"
                    value="10"
                    checked={selectedCredits === '10'}
                    onChange={(e) => setSelectedCredits(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">10 Measurement Reports</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">$35.00 USD</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="credits"
                    value="50"
                    checked={selectedCredits === '50'}
                    onChange={(e) => setSelectedCredits(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">50 Measurement Reports</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">$150.00 USD</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="credits"
                    value="100"
                    checked={selectedCredits === '100'}
                    onChange={(e) => setSelectedCredits(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">100 Measurement Reports</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">$250.00 USD</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="credits"
                    value="250"
                    checked={selectedCredits === '250'}
                    onChange={(e) => setSelectedCredits(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">250 Measurement Reports</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">$500.00 USD</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">$150.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                  <span className="text-gray-900 dark:text-white">$9.90</span>
                </div>
                <div className="flex justify-between text-base font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">$159.90</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Purchase credits
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Roofr Report</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Workspace:</span> Tarrytown Roofing LLC
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job address
                </label>
                <input
                  type="text"
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter address and select"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showDIYModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create DIY Report</h3>
              <button 
                onClick={() => setShowDIYModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Workspace:</span> Tarrytown Roofing LLC
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job address
                </label>
                <input
                  type="text"
                  value={diyAddress}
                  onChange={(e) => setDiyAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter address and select"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}