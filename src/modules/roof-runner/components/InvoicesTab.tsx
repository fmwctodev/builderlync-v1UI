import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, DollarSign, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getInvoices, Invoice } from '../../../shared/store/services/invoicesApi';

const InvoicesTab: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        console.log('Fetching invoices...');
        const response = await getInvoices();
        console.log('Invoice API response:', response);
        if (response.success) {
          console.log('Setting invoices:', response.data.length, 'items');
          setInvoices(response.data);
          setFilteredInvoices(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    console.log('Filtering invoices. Search:', searchTerm, 'Status:', statusFilter, 'Total invoices:', invoices.length);
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.doc_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => {
        if (statusFilter === 'paid') return invoice.balance === 0;
        if (statusFilter === 'overdue') return new Date(invoice.due_date) < new Date() && invoice.balance > 0;
        if (statusFilter === 'draft') return invoice.status === 'draft';
        return invoice.status === statusFilter;
      });
    }

    console.log('Filtered invoices:', filtered.length);
    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, invoices]);

  const getStatusColor = (status: string, balance: number, dueDate: string) => {
    if (balance === 0) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (new Date(dueDate) < new Date() && balance > 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (status === 'draft') return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getStatusText = (status: string, balance: number, dueDate: string) => {
    if (balance === 0) return 'Paid';
    if (new Date(dueDate) < new Date() && balance > 0) return 'Overdue';
    if (status === 'draft') return 'Draft';
    return 'Due';
  };

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    draft: invoices.filter(inv => inv.status === 'draft').length,
    draftAmount: invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.total_amount, 0),
    due: invoices.filter(inv => inv.balance > 0 && new Date(inv.due_date) >= new Date()).length,
    dueAmount: invoices.filter(inv => inv.balance > 0 && new Date(inv.due_date) >= new Date()).reduce((sum, inv) => sum + inv.balance, 0),
    paid: invoices.filter(inv => inv.balance === 0).length,
    paidAmount: invoices.filter(inv => inv.balance === 0).reduce((sum, inv) => sum + inv.total_amount, 0),
    overdue: invoices.filter(inv => inv.balance > 0 && new Date(inv.due_date) < new Date()).length,
    overdueAmount: invoices.filter(inv => inv.balance > 0 && new Date(inv.due_date) < new Date()).reduce((sum, inv) => sum + inv.balance, 0)
  };

  console.log('InvoicesTab render - Loading:', loading, 'Error:', error, 'Invoices:', invoices.length, 'Filtered:', filteredInvoices.length);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoices</h2>
          <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
            <Plus className="w-4 h-4" />
            <span>Invoice</span>
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.draft} Invoice(s) in Draft</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stats.draftAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.due} Invoice(s) Due</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stats.dueAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.paid} Invoice(s) Paid</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stats.paidAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.overdue} Invoice(s) Overdue</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stats.overdueAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="open">Due</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No invoices match your filters.' : 'No invoices found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.doc_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${invoice.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${invoice.balance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status, invoice.balance, invoice.due_date)}`}>
                            {getStatusText(invoice.status, invoice.balance, invoice.due_date)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} results
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesTab;