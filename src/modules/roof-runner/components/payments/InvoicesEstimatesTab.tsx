import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Filter, ChevronDown, RefreshCw, ChevronLeft, ChevronRight, X, Eye, Trash2 } from 'lucide-react';
import PaymentDateRangeFilter from './PaymentDateRangeFilter';
import PaymentSearchBar from './PaymentSearchBar';
import PaymentFiltersSidebar from './PaymentFiltersSidebar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { fetchInvoices, Invoice as PaymentInvoice, syncQuickBooksInvoices, deleteInvoice } from '../../../../shared/store/services/paymentsApi';
import CreateInvoiceModal from './CreateInvoiceModal';

type SubView = 'all_invoices' | 'recurring_invoices' | 'templates' | 'estimates';

interface Invoice {
  id: number;
  doc_number: string;
  customer_name: string;
  total_amount: number;
  balance: number;
  due_date: string;
  invoice_date: string;
  status: string;
  currency_code: string;
  email_status: string;
  customer_email: string | null;
  customer_phone: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  ship_method: string | null;
  ship_date: string | null;
  tracking_number: string | null;
  private_note: string | null;
  customer_memo: string | null;
  po_number: string | null;
  payment_terms: string | null;
  contacts: any;
  invoice_line_items: any[];
  rawData?: any;
}

const InvoicesEstimatesTab: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('all_invoices');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'estimate'>('invoice');
  const [editInvoice, setEditInvoice] = useState<PaymentInvoice | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isQuickBooksConnected, setIsQuickBooksConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const handleSyncQuickBooks = async () => {
    try {
      setSyncing(true);
      await syncQuickBooksInvoices();
      await loadData();
    } catch (error) {
      console.error('Error syncing QuickBooks invoices:', error);
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
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading invoices...');
      const response = await fetchInvoices({ is_estimate: false });
      console.log('Invoice response:', response);
      setInvoices(response.map((inv: any) => {
        return {
          id: inv.id,
          doc_number: inv.invoice_number,
          customer_name: inv.customer_name,
          total_amount: inv.total || 0,
          balance: inv.balance ?? 0,
          due_date: inv.due_date,
          invoice_date: inv.issue_date || inv.invoice_date,
          status: inv.status,
          currency_code: inv.currency_code || 'USD',
          email_status: inv.email_status || '',
          customer_email: inv.customer_email || null,
          customer_phone: inv.customer_phone || null,
          billing_address: inv.billing_address || null,
          shipping_address: inv.shipping_address || null,
          ship_method: inv.ship_method || null,
          ship_date: inv.ship_date || null,
          tracking_number: inv.tracking_number || null,
          private_note: inv.notes || inv.private_note,
          customer_memo: inv.message_to_customer || inv.customer_memo,
          po_number: inv.po_number || null,
          payment_terms: inv.payment_terms || null,
          contacts: inv.contacts,
          invoice_line_items: inv.invoice_line_items || [],
          coupon_code: inv.coupon_code || null,
          rawData: inv
        };
      }));
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    console.log('Filtering invoices. Total:', invoices.length, 'Search:', searchQuery, 'Status filter:', statusFilter);
    let filtered = [...invoices];

    if (searchQuery) {
      filtered = filtered.filter(inv =>
        inv.doc_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.private_note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(inv => statusFilter.includes(inv.status.toLowerCase()));
      console.log('After status filter:', filtered.length);
    }

    if (dateRange.start) {
      filtered = filtered.filter(inv => new Date(inv.invoice_date) >= new Date(dateRange.start!));
      console.log('After start date filter:', filtered.length);
    }
    if (dateRange.end) {
      filtered = filtered.filter(inv => new Date(inv.invoice_date) <= new Date(dateRange.end!));
      console.log('After end date filter:', filtered.length);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        case 'date_asc':
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        case 'amount_desc':
          return b.total_amount - a.total_amount;
        case 'amount_asc':
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });

    console.log('Final filtered invoices:', filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
    return filtered;
  }, [invoices, searchQuery, statusFilter, dateRange, sortBy]);


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
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${subView === option.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
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
            {/* <button 
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button> */}
            {/* <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button> */}
            <button
              onClick={handleSyncQuickBooks}
              disabled={syncing || loading || checkingStatus || !isQuickBooksConnected}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
              title={!isQuickBooksConnected ? 'Connect QuickBooks in Settings to sync' : 'Sync invoices with QuickBooks'}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync QuickBooks'}</span>
            </button>
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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setInvoiceType('invoice');
                      setIsViewOnly(false);
                      setShowInvoiceModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 rounded-t-lg"
                  >
                    Invoice
                  </button>
                  <button
                    onClick={() => {
                      setInvoiceType('estimate');
                      setIsViewOnly(false);
                      setShowInvoiceModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 rounded-b-lg"
                  >
                    Estimate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* {subView === 'all_invoices' && (
          <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Connect at least one payment gateway to start receiving payments
              </p>
              <button className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Integrate Payment Gateway
              </button>
            </div>
          </div>
        )} */}
        {/* 
        {subView === 'all_invoices' && (
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
                {stats.due.count} Invoice(s) Due
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.due.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.received.count} Invoice(s) Paid
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stats.received.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stats.overdue.count} Invoice(s) Overdue
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${stats.overdue.total.toFixed(2)}
              </p>
            </div>
          </div>
        )} */}

        <div className="flex items-center space-x-4">
          <PaymentDateRangeFilter
            onDateChange={(start, end) => setDateRange({ start, end })}
          />
          <PaymentSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by invoice number, customer name..."
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(statusFilter.length > 0 || sortBy !== 'date_desc') && (
              <span className="ml-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                {statusFilter.length || 1}
              </span>
            )}
          </button>
          {(searchQuery || statusFilter.length > 0 || dateRange.start || dateRange.end || sortBy !== 'date_desc') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter([]);
                setDateRange({});
                setSortBy('date_desc');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-800"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>


        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
            {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm">Debug: Total invoices: {invoices.length}, Filtered: {filteredAndSortedInvoices.length}, Loading: {loading.toString()}</p>
            <p className="text-sm">Search: '{searchQuery}', Status filter: [{statusFilter.join(', ')}]</p>
          </div>
           */}
            {/* {!loading && filteredAndSortedInvoices.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredAndSortedInvoices.length}</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${filteredAndSortedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${filteredAndSortedInvoices.reduce((sum, inv) => sum + inv.balance, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              {(searchQuery || statusFilter.length > 0 || dateRange.start || dateRange.end) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter([]);
                    setDateRange({});
                    setSortBy('date_desc');
                  }}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )} */}

            {loading ? (
              <>
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              </>
            ) : filteredAndSortedInvoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={searchQuery || statusFilter.length > 0 ? 'No invoices match your filters' : 'No invoices to show yet'}
                description={searchQuery || statusFilter.length > 0 ? 'Try adjusting your search or filters' : 'Invoices from QuickBooks will appear here'}
              />
            ) : (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Invoice Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Invoice Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAndSortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                              {invoice.doc_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              <div>
                                <div className="font-medium">{invoice.customer_name}</div>
                                {invoice.contacts?.email && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.contacts.email}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {new Date(invoice.invoice_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {invoice.currency_code} ${invoice.total_amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <span className={invoice.balance > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                                ${invoice.balance.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge
                                status={invoice.status}
                                type="invoice"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    const inv = invoice.rawData;

                                    setEditInvoice({
                                      id: inv.id.toString(),
                                      invoice_number: inv.invoice_number,
                                      customer_id: inv.customer_id,
                                      customer_name: inv.customer_name,
                                      customer_email: inv.customer_email,
                                      customer_phone: inv.customer_phone,
                                      billing_address: inv.billing_address,
                                      shipping_address: inv.shipping_address,
                                      issue_date: inv.issue_date,
                                      due_date: inv.due_date,
                                      po_number: inv.po_number,
                                      payment_terms: inv.payment_terms,
                                      ship_method: inv.ship_method,
                                      ship_date: inv.ship_date,
                                      tracking_number: inv.tracking_number,
                                      notes: inv.notes,
                                      message_to_customer: inv.message_to_customer,
                                      subtotal: inv.subtotal,
                                      discount: inv.discount,
                                      tax: inv.tax,
                                      shipping: inv.shipping,
                                      total: inv.total,
                                      coupon_discount: inv.coupon_discount,
                                      coupon_id: inv.coupon_id,
                                      coupon_code: inv.coupon_code,
                                      status: inv.status,
                                      is_estimate: inv.is_estimate,
                                      line_items: inv.line_items,
                                      invoice_line_items: inv.invoice_line_items,
                                      created_at: inv.created_at,
                                      updated_at: inv.updated_at
                                    } as any);
                                    setIsViewOnly(true);
                                    setShowInvoiceModal(true);
                                  }}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const inv = invoice.rawData;

                                    setEditInvoice({
                                      id: inv.id.toString(),
                                      invoice_number: inv.invoice_number,
                                      customer_id: inv.customer_id,
                                      customer_name: inv.customer_name,
                                      customer_email: inv.customer_email,
                                      customer_phone: inv.customer_phone,
                                      billing_address: inv.billing_address,
                                      shipping_address: inv.shipping_address,
                                      issue_date: inv.issue_date,
                                      due_date: inv.due_date,
                                      po_number: inv.po_number,
                                      payment_terms: inv.payment_terms,
                                      ship_method: inv.ship_method,
                                      ship_date: inv.ship_date,
                                      tracking_number: inv.tracking_number,
                                      notes: inv.notes,
                                      message_to_customer: inv.message_to_customer,
                                      subtotal: inv.subtotal,
                                      discount: inv.discount,
                                      tax: inv.tax,
                                      shipping: inv.shipping,
                                      total: inv.total,
                                      coupon_discount: inv.coupon_discount,
                                      coupon_id: inv.coupon_id,
                                      coupon_code: inv.coupon_code,
                                      status: inv.status,
                                      is_estimate: inv.is_estimate,
                                      invoice_line_items: inv.invoice_line_items,
                                      line_items: inv.line_items,
                                      created_at: inv.created_at,
                                      updated_at: inv.updated_at
                                    } as any);
                                    setIsViewOnly(false);
                                    setShowInvoiceModal(true);
                                  }}
                                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to delete invoice ${invoice.doc_number}? This will delete it from both the database and QuickBooks.`)) {
                                      try {
                                        await deleteInvoice(invoice.id.toString());
                                        await loadData();
                                      } catch (error) {
                                        console.error('Error deleting invoice:', error);
                                        alert('Failed to delete invoice');
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {Math.ceil(filteredAndSortedInvoices.length / itemsPerPage) > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length} results
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {currentPage} of {Math.ceil(filteredAndSortedInvoices.length / itemsPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAndSortedInvoices.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredAndSortedInvoices.length / itemsPerPage)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
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
                    { label: 'Invoice date (latest)', value: 'date_desc' },
                    { label: 'Invoice date (oldest)', value: 'date_asc' },
                    { label: 'Amount (lowest)', value: 'amount_asc' },
                    { label: 'Amount (highest)', value: 'amount_desc' },
                  ],
                  selectedValues: [sortBy],
                },
                {
                  title: 'Status',
                  type: 'checkbox',
                  options: [
                    { label: 'Draft', value: 'draft' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Overdue', value: 'overdue' },
                  ],
                  selectedValues: statusFilter,
                },
              ]}
              onApply={(filters) => {
                const sortSection = filters.find(f => f.title === 'Sort');
                const statusSection = filters.find(f => f.title === 'Status');

                if (sortSection?.selectedValues[0]) {
                  setSortBy(sortSection.selectedValues[0]);
                }
                if (statusSection) {
                  setStatusFilter(statusSection.selectedValues);
                }
                setShowFilters(false);
              }}
              onReset={() => {
                setSortBy('date_desc');
                setStatusFilter([]);
                setShowFilters(false);
              }}
            />
          )}
        </div>

        <CreateInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setEditInvoice(null);
          }}
          onSuccess={() => {
            setShowInvoiceModal(false);
            setEditInvoice(null);
            loadData();
          }}
          invoiceType={invoiceType}
          editInvoice={editInvoice}
          isViewOnly={isViewOnly}
        />
      </div>
    </div>
  );
};

export default InvoicesEstimatesTab;