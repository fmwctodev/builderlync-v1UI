import { useState } from 'react';
import { Search, Filter, Download, DollarSign, CreditCard, Clock } from 'lucide-react';
import StatusBadge from '../../../modules/roof-runner/components/payments/StatusBadge';
import PaymentMethodBadge from '../../../modules/roof-runner/components/payments/PaymentMethodBadge';

export default function AllPayments() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const mockPayments = [
    {
      id: 'PAY-1000',
      customer: 'Customer 1',
      amount: 1333.18,
      method: 'Credit Card',
      paymentStatus: 'Approved',
      fundingStatus: 'Funded',
      date: '11/12/2025',
    },
    {
      id: 'PAY-1001',
      customer: 'Customer 2',
      amount: 5226.67,
      method: 'ACH',
      paymentStatus: 'Pending',
      fundingStatus: 'In Transit',
      date: '11/19/2025',
    },
    {
      id: 'PAY-1002',
      customer: 'Customer 3',
      amount: 2722.30,
      method: 'Check',
      paymentStatus: 'Failed',
      fundingStatus: 'Not Funded',
      date: '11/4/2025',
    },
    {
      id: 'PAY-1003',
      customer: 'Customer 4',
      amount: 3960.16,
      method: 'Cash',
      paymentStatus: 'Declined',
      fundingStatus: 'Error',
      date: '11/3/2025',
    },
    {
      id: 'PAY-1004',
      customer: 'Customer 5',
      amount: 2117.44,
      method: 'Credit Card',
      paymentStatus: 'Approved',
      fundingStatus: 'ACH Return',
      date: '11/12/2025',
    },
    {
      id: 'PAY-1005',
      customer: 'Customer 6',
      amount: 1307.34,
      method: 'ACH',
      paymentStatus: 'Pending',
      fundingStatus: 'Funded',
      date: '11/12/2025',
    },
    {
      id: 'PAY-1006',
      customer: 'Customer 7',
      amount: 4158.25,
      method: 'Check',
      paymentStatus: 'Failed',
      fundingStatus: 'In Transit',
      date: '11/1/2025',
    },
    {
      id: 'PAY-1007',
      customer: 'Customer 8',
      amount: 2851.75,
      method: 'Cash',
      paymentStatus: 'Declined',
      fundingStatus: 'Not Funded',
      date: '11/2/2025',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payments</h1>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export as CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            All Payments
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'batches'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Batches and Funding
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter & Sort
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Funding Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {payment.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {payment.customer}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentMethodBadge method={payment.method} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.paymentStatus} type="payment" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.fundingStatus} type="funding" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {payment.date}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium">
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
    </div>
  );
}
