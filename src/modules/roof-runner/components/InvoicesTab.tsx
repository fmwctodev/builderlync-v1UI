import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, DollarSign, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInvoices } from '../../../shared/store/services/paymentsApi';

interface InvoicesTabProps {
  jobId?: number;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ jobId }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetchInvoices({ job_id: jobId, is_estimate: false });
        setInvoices(response);
        setFilteredInvoices(response);
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [jobId]);

  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        (invoice.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => {
        const balance = invoice.total || 0;
        if (statusFilter === 'paid') return balance === 0;
        if (statusFilter === 'overdue') return new Date(invoice.due_date) < new Date() && balance > 0;
        if (statusFilter === 'draft') return invoice.status === 'draft';
        return invoice.status === statusFilter;
      });
    }

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
    draftAmount: invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + (inv.total || 0), 0),
    due: invoices.filter(inv => (inv.total || 0) > 0 && new Date(inv.due_date) >= new Date() && inv.status !== 'draft').length,
    dueAmount: invoices.filter(inv => (inv.total || 0) > 0 && new Date(inv.due_date) >= new Date() && inv.status !== 'draft').reduce((sum, inv) => sum + (inv.total || 0), 0),
    paid: invoices.filter(inv => inv.status === 'paid').length,
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
    overdue: invoices.filter(inv => (inv.total || 0) > 0 && new Date(inv.due_date) < new Date() && inv.status !== 'draft' && inv.status !== 'paid').length,
    overdueAmount: invoices.filter(inv => (inv.total || 0) > 0 && new Date(inv.due_date) < new Date() && inv.status !== 'draft' && inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoices</h2>
          <button 
            onClick={() => navigate(`/org/${orgSlug}/payments`)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
          >
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
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${(invoice.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${(invoice.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status, invoice.total || 0, invoice.due_date)}`}>
                            {getStatusText(invoice.status, invoice.total || 0, invoice.due_date)}
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
      
      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Details</h2>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status, selectedInvoice.total || 0, selectedInvoice.due_date)}`}>
                    {getStatusText(selectedInvoice.status, selectedInvoice.total || 0, selectedInvoice.due_date)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedInvoice.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Issue Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{new Date(selectedInvoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedInvoice.payment_terms || 'N/A'}</p>
                </div>
              </div>
              
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Line Items</h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Rate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedInvoice.line_items.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{item.qty}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">${(item.rate || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">${(item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">-${(selectedInvoice.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${(selectedInvoice.tax || 0).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">${(selectedInvoice.shipping || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">${(selectedInvoice.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;