import React, { useState, useEffect } from 'react';
import { Download, Search as SearchIcon, Filter } from 'lucide-react';
import PaymentDateRangeFilter from './PaymentDateRangeFilter';
import PaymentSearchBar from './PaymentSearchBar';
import PaymentFiltersSidebar from './PaymentFiltersSidebar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { fetchTransactions, Transaction } from '../../../../shared/store/services/paymentsApi';

const TransactionsTab: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  useEffect(() => {
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

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const getFilteredTransactions = () => {
    if (!dateRange) return transactions;

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const handleExportCSV = () => {
    const filteredTransactions = getFilteredTransactions();

    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Create CSV headers
    const headers = ['Customer', 'Provider', 'Source', 'Transaction Date', 'Amount', 'Status'];

    // Create CSV rows
    const rows = filteredTransactions.map((transaction) => [
      transaction.customer_name,
      transaction.provider,
      transaction.source,
      new Date(transaction.transaction_date).toLocaleDateString(),
      `$${Number(transaction.amount).toFixed(2)}`,
      transaction.payment_status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    const dateRangeStr = dateRange
      ? `_${dateRange.startDate}_to_${dateRange.endDate}`
      : '';
    link.setAttribute('download', `transactions${dateRangeStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Download className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <PaymentDateRangeFilter onDateChange={handleDateRangeChange} />
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
