import React from 'react';
import { Search, Filter, Grid3X3, List, MoreVertical, Clock, User } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  subtitle: string;
  assignedBy: string;
  time: string;
  amount: string;
  status: string;
  image: string;
}

interface ProposalsListProps {
  proposals: Proposal[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  viewMode: 'card' | 'table';
  setViewMode: (mode: 'card' | 'table') => void;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  getStatusColor: (status: string) => string;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onProposalClick: (id: string) => void;
  onMoveToWon: (id: string) => void;
  onMoveToLost: (id: string) => void;
}

export default function ProposalsList({
  proposals,
  filterStatus,
  setFilterStatus,
  showFilter,
  setShowFilter,
  viewMode,
  setViewMode,
  openDropdown,
  setOpenDropdown,
  getStatusColor,
  onDelete,
  onDuplicate,
  onProposalClick,
  onMoveToWon,
  onMoveToLost
}: ProposalsListProps) {
  const dropdownActions = [
    'Move to won',
    'Move to lost',
    'Cancel signature request',
    'Job card',
    'Proposal',
    'Material order',
    'Make copy',
    'Download proposal',
    'Delete'
  ];

  const handleAction = (action: string, proposalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === 'Delete') {
      onDelete(proposalId);
    } else if (action === 'Make copy') {
      onDuplicate(proposalId);
    } else if (action === 'Move to won') {
      onMoveToWon(proposalId);
    } else if (action === 'Move to lost') {
      onMoveToLost(proposalId);
    }
    setOpenDropdown(null);
  };

  return (
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
        <div className="p-6 overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-visible hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onProposalClick(proposal.id)}
              >
                {proposal.image ? (
                  <img src={proposal.image} alt={proposal.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 bg-gray-200 dark:bg-gray-600"></div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{proposal.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{proposal.subtitle}</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === proposal.id ? null : proposal.id);
                        }}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {openDropdown === proposal.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
                          <div className="py-1">
                            {dropdownActions.map((action) => (
                              <button
                                key={action}
                                onClick={(e) => handleAction(action, proposal.id, e)}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  action === 'Delete' ? 'text-error-600' : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
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
                <tr 
                  key={proposal.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => onProposalClick(proposal.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {proposal.image ? (
                        <img src={proposal.image} alt={proposal.title} className="h-10 w-16 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{proposal.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{proposal.subtitle}</div>
                      </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === proposal.id ? null : proposal.id);
                        }}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {openDropdown === proposal.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
                          <div className="py-1">
                            {dropdownActions.map((action) => (
                              <button
                                key={action}
                                onClick={(e) => handleAction(action, proposal.id, e)}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  action === 'Delete' ? 'text-error-600' : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
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
  );
}
