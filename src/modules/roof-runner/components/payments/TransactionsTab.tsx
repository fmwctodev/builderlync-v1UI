import React, { useState, useEffect } from 'react';
import { Download, Search as SearchIcon, Filter, RefreshCw } from 'lucide-react';
import PaymentDateRangeFilter from './PaymentDateRangeFilter';
import PaymentSearchBar from './PaymentSearchBar';
import PaymentFiltersSidebar from './PaymentFiltersSidebar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { fetchTransactions, Transaction, syncQuickBooksPayments } from '../../../../shared/store/services/paymentsApi';

const TransactionsTab: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [isQuickBooksConnected, setIsQuickBooksConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const handleSyncQuickBooks = async () => {
    try {
      setSyncing(true);
      await syncQuickBooksPayments();
      // Wait a moment for DB to update then reload
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      console.error('Error syncing QuickBooks payments:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { getQuickBooksStatus } = await import('../../../../shared/store/services/quickbooksApi');
        const response = await getQuickBooksStatus();
        setIsQuickBooksConnected(response.data.connected);
      } catch (error) {
        console.error('Error checking QuickBooks status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions({ search: searchQuery });
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    console.log('Exporting transactions as CSV...');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Transactions
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track customer payments at a single place
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSyncQuickBooks}
              disabled={syncing || loading || checkingStatus || !isQuickBooksConnected}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
              title={!isQuickBooksConnected ? 'Connect QuickBooks in Settings to sync' : 'Sync payments with QuickBooks'}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync QuickBooks'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Import as CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <PaymentDateRangeFilter />
          <PaymentSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search"
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
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="No transactions to show yet"
              description="Your transaction history will appear here once you start processing payments"
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction Date
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
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {transaction.provider}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {transaction.source}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                          ${Number(transaction.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={transaction.payment_status} type="transaction" />
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
                  { label: 'Transaction date (latest)', value: 'date_desc' },
                  { label: 'Transaction date (oldest)', value: 'date_asc' },
                  { label: 'Amount (lowest)', value: 'amount_asc' },
                  { label: 'Amount (highest)', value: 'amount_desc' },
                ],
                selectedValues: [],
              },
              {
                title: 'Payment Status',
                type: 'checkbox',
                options: [
                  { label: 'Approved', value: 'approved' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Failed', value: 'failed' },
                  { label: 'Declined', value: 'declined' },
                ],
                selectedValues: [],
              },
              {
                title: 'Provider',
                type: 'checkbox',
                options: [
                  { label: 'Stripe', value: 'stripe' },
                  { label: 'QuickBooks', value: 'quickbooks' },
                  { label: 'Other', value: 'other' },
                ],
                selectedValues: [],
              },
            ]}
            onApply={() => setShowFilters(false)}
            onReset={() => setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionsTab;
