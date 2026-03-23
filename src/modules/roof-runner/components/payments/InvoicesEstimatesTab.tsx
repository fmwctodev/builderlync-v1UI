import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import PaymentDateRangeFilter from './PaymentDateRangeFilter';
import PaymentSearchBar from './PaymentSearchBar';
import PaymentFiltersSidebar from './PaymentFiltersSidebar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import CreateInvoiceModal from './CreateInvoiceModal';
import CreateEstimateModal from './CreateEstimateModal';
import { fetchInvoices, fetchEstimates, getInvoiceStats, Invoice, Estimate } from '../../../../shared/store/services/paymentsApi';

type SubView = 'all_invoices' | 'recurring_invoices' | 'templates' | 'estimates';

const InvoicesEstimatesTab: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('all_invoices');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateEstimateModal, setShowCreateEstimateModal] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, [subView, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subView === 'estimates') {
        const data = await fetchEstimates({ search: searchQuery });
        setEstimates(data);
      } else if (subView === 'templates') {
        const data = await fetchEstimates({ isTemplate: true, search: searchQuery });
        setEstimates(data);
      } else if (subView === 'recurring_invoices') {
        const data = await fetchEstimates({ isRecurring: true, search: searchQuery });
        setEstimates(data);
      } else {
        const data = await fetchInvoices({ search: searchQuery });
        setInvoices(data);
        const statsData = await getInvoiceStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubViewLabel = () => {
    switch (subView) {
      case 'all_invoices':
        return 'All Invoices';
      case 'recurring_invoices':
        return 'Recurring Invoices';
      case 'templates':
        return 'Templates';
      case 'estimates':
        return 'Estimates';
      default:
        return 'All Invoices';
    }
  };

  const subViewOptions = [
    { value: 'all_invoices', label: 'All Invoices' },
    { value: 'recurring_invoices', label: 'Recurring Invoices' },
    { value: 'templates', label: 'Templates' },
    { value: 'estimates', label: 'Estimates', badge: 'New' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span>{getSubViewLabel()}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {subViewOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSubView(option.value as SubView);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                          subView === option.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                        } ${option.value === 'all_invoices' ? 'rounded-t-lg' : ''} ${option.value === 'estimates' ? 'rounded-b-lg' : ''}`}
                      >
                        <span>{option.label}</span>
                        {option.badge && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                            {option.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage invoices generated for your business
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowNewDropdown(!showNewDropdown)}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showNewDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setShowCreateInvoiceModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-t-lg"
                  >
                    Invoice
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateEstimateModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-b-lg"
                  >
                    Estimate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {subView === 'all_invoices' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.draft.count} Invoice(s) in Draft
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.draft.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.due.count} Invoice(s) in Due
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.due.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.received.count} Invoice(s) received
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.received.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.overdue.count} Invoice(s) Overdue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.overdue.total.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <PaymentDateRangeFilter />
          <PaymentSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (subView === 'estimates' || subView === 'templates' || subView === 'recurring_invoices' ? estimates : invoices).length === 0 ? (
            <EmptyState
              icon={FileText}
              title={`No ${getSubViewLabel().toLowerCase()} to show yet`}
              description={`Create your first ${getSubViewLabel().toLowerCase()} to get started`}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {subView === 'estimates' || subView === 'templates' ? 'Estimate' : 'Invoice'} Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {subView === 'estimates' || subView === 'templates' ? 'Estimate' : 'Invoice'} Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(subView === 'estimates' || subView === 'templates' || subView === 'recurring_invoices' ? estimates : invoices).map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {item.invoice_number || item.estimate_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {item.customer_id || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(item.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                          ${Number(item.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={item.status}
                            type={subView === 'estimates' || subView === 'templates' ? 'estimate' : 'invoice'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <PaymentFiltersSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            sections={[
              {
                title: 'Sort',
                type: 'radio',
                options: [
                  { label: 'Issue date (latest)', value: 'date_desc' },
                  { label: 'Issue date (oldest)', value: 'date_asc' },
                  { label: 'Amount (lowest)', value: 'amount_asc' },
                  { label: 'Amount (highest)', value: 'amount_desc' },
                ],
                selectedValues: [],
              },
              {
                title: 'Status',
                type: 'checkbox',
                options:
                  subView === 'estimates' || subView === 'templates'
                    ? [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Sent', value: 'sent' },
                        { label: 'Accepted', value: 'accepted' },
                        { label: 'Rejected', value: 'rejected' },
                        { label: 'Expired', value: 'expired' },
                      ]
                    : [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Due', value: 'due' },
                        { label: 'Received', value: 'received' },
                        { label: 'Overdue', value: 'overdue' },
                      ],
                selectedValues: [],
              },
            ]}
            onApply={() => setShowFilters(false)}
            onReset={() => setShowFilters(false)}
          />
        )}
      </div>

      <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onSuccess={(invoice) => {
          setShowCreateInvoiceModal(false);
          loadData();
        }}
      />

      <CreateEstimateModal
        isOpen={showCreateEstimateModal}
        onClose={() => setShowCreateEstimateModal(false)}
        onSuccess={(estimate) => {
          setShowCreateEstimateModal(false);
          loadData();
        }}
      />
    </div>
  );
};

export default InvoicesEstimatesTab;
