import React, { useState } from 'react';
import { Plus, Search, Filter, Grid3X3, List, MoreVertical, Clock, DollarSign, User, X } from 'lucide-react';

export default function Proposals() {
  const [activeTab, setActiveTab] = useState('Proposals');
  const [filterStatus, setFilterStatus] = useState('All proposals');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [proposalAddress, setProposalAddress] = useState('');

  const proposals = [
    {
      id: '001',
      title: 'Roof Replacement - Johnson Residence',
      subtitle: '123 Main St, Anytown, ST 12345',
      assignedBy: 'Mike Johnson',
      time: '2 hours ago',
      amount: '$15,250',
      status: 'Sent',
      image: '/api/placeholder/300/200'
    },
    {
      id: '002',
      title: 'Commercial Roof Repair',
      subtitle: '456 Oak Ave, Business District',
      assignedBy: 'Sarah Wilson',
      time: '1 day ago',
      amount: '$8,750',
      status: 'Open',
      image: '/api/placeholder/300/200'
    },
    {
      id: '003',
      title: 'Residential Shingle Replacement',
      subtitle: '789 Pine St, Residential Area',
      assignedBy: 'John Smith',
      time: '3 days ago',
      amount: '$12,500',
      status: 'Won',
      image: '/api/placeholder/300/200'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'Open': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'Won': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'Lost': return 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300';
      case 'Draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Proposals</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h1>
        </div>

        <button
          onClick={() => setShowMeasurementsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          <Plus size={16} />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('Proposals')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'Proposals'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Proposals
              </button>
              <button
                onClick={() => setActiveTab('Templates')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'Templates'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Templates
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
        </div>

        {activeTab === 'Proposals' && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search proposals..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Filter size={16} />
                      {filterStatus}
                    </button>
                    {showFilter && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          {['All proposals', 'Draft', 'Sent', 'Lost', 'Won', 'Open'].map((status) => (
                            <button
                              key={status}
                              onClick={() => { setFilterStatus(status); setShowFilter(false); }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                filterStatus === status ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'card' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 bg-gray-200 dark:bg-gray-600"></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{proposal.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{proposal.subtitle}</p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === proposal.id ? null : proposal.id)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <MoreVertical size={16} className="text-gray-400" />
                            </button>
                            {openDropdown === proposal.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <div className="py-1">
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Move to won</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Move to lost</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel signature request</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Job card</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Proposal</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Material order</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Make copy</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Download proposal</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <User size={12} />
                          <span>{proposal.assignedBy}</span>
                          <Clock size={12} />
                          <span>{proposal.time}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.amount}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proposal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {proposals.map((proposal) => (
                      <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{proposal.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{proposal.subtitle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{proposal.assignedBy}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{proposal.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{proposal.time}</td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === proposal.id ? null : proposal.id)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreVertical size={16} className="text-gray-400" />
                            </button>
                            {openDropdown === proposal.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <div className="py-1">
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Move to won</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Move to lost</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel signature request</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Job card</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Proposal</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Material order</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Make copy</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Download proposal</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'Templates' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors">
                <Plus size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Template</span>
              </div>

              {[
                { id: '1', title: 'Standard Roof Proposal', image: '/api/placeholder/300/200' },
                { id: '2', title: 'Commercial Roofing Template', image: '/api/placeholder/300/200' },
                { id: '3', title: 'Residential Repair Template', image: '/api/placeholder/300/200' }
              ].map((template) => (
                <div key={template.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-600"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-end">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{template.title}</h3>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        {openDropdown === template.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Rename</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Make a copy</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Supplier</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Enable preferred suppliers on future proposals for your team</div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Automatically select your preferred supplier to use their costs instead of unit costs
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No preferred suppliers have been selected. <button className="text-primary-600 hover:text-primary-700">Click here to update your preferences.</button>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company representative signatures</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Enable on future proposals for your team</div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proposals will automatically include the job assignee's signature on the authorization page
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your signature</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your full name
                  </label>
                  <input
                    type="text"
                    defaultValue="Vijender Singh"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Below is how your signature will appear on documents to customers
                  </p>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                    <div className="text-lg font-script text-gray-900 dark:text-white mb-1">Vijender Singh</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Vijender Singh</div>
                  </div>
                </div>

                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMeasurementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Measurements</h3>
              <button onClick={() => setShowMeasurementsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the measurement you would like to use for this proposal
              </p>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search all measurement reports"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {[
                  { address: '1907 Morrow Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 08, 2025' },
                  { address: '7925 Tusman Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 07, 2025' },
                  { address: '3339 Hancock Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 06, 2025' },
                  { address: '7807 Lonesome Dove Cove, Austin, Texas, United States', version: '1/1', date: 'Oct. 04, 2025' },
                  { address: '11315 Drumellan Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 03, 2025' },
                  { address: '7901 Havenwood Drive, Austin, Texas, United States', version: '1/1', date: 'Oct. 03, 2025' },
                  { address: '4701 Camacho Street, Austin, Texas, United States', version: '1/1', date: 'Oct. 02, 2025' },
                  { address: '2125 Independence Drive, Austin, Texas, United States', version: '1/1', date: 'Sept. 29, 2025' },
                  { address: '7920 Rockwood Lane, Austin, Texas, United States', version: '8/8', date: 'Sept. 29, 2025', latest: true },
                  { address: '7920 Rockwood Lane, Austin, Texas, United States', version: '7/8', date: 'Sept. 29, 2025' },
                ].map((measurement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{measurement.address}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {measurement.version} Roofr Report{measurement.latest ? ' - Latest' : ''}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completed {measurement.date}</div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Download</button>
                  </div>
                ))}
              </div>

            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowMeasurementsModal(false); setShowNewProposalModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Create without measurement
              </button>
              <button
                onClick={() => { setShowMeasurementsModal(false); setShowTemplateModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Use this measurement
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">New proposal</h3>
              <button onClick={() => setShowNewProposalModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job address
                </label>
                <input
                  type="text"
                  value={proposalAddress}
                  onChange={(e) => setProposalAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter address and select"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowNewProposalModal(false); setShowTemplateModal(true); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose a template</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick from one of your existing proposal templates to get started</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {[
                  'New template',
                  'RFP | Edgewick HOA | Roofing Inspection, Maintenance & Repair Services',
                  'Commercial Roof Repair Template',
                  'Commercial - TPO/PVC',
                  'NEW COMMERCIAL',
                  'Retail Residential - Standing Seam (Snap Lock) - Metal Estimate 24G',
                  'Retail - Multifamily IKO/Dynasty',
                  'Multi Family - Retail (Shingle)',
                  'Insurance Scope Template (IKO Dynasty & Nordic)',
                  'Roofing Labor',
                  'Insurance Restoration Work Authorization',
                  'Service Agreement',
                  'Shingle Coatings'
                ].map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{template}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Template cover image</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                Create without template
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}