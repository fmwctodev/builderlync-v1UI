import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, User, Mail } from 'lucide-react';
import { quickbooksApi } from '../../services/quickbooksApi';
import type { QuickBooksInvoice } from '../../types/quickbooks';

interface QuickBooksInvoicesProps {
  onSelectInvoice?: (invoice: QuickBooksInvoice) => void;
}

export default function QuickBooksInvoices({ onSelectInvoice }: QuickBooksInvoicesProps) {
  const [invoices, setInvoices] = useState<QuickBooksInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await quickbooksApi.getInvoices();
        setInvoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'open': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'overdue': return 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300';
      case 'draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading invoices: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          QuickBooks Invoices
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectInvoice?.(invoice)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {invoice.doc_number}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.customer_name}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.balance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email Status</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.email_status}
                  </p>
                </div>
              </div>
            </div>

            {invoice.contacts && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{invoice.contacts.full_name}</span>
                <span>•</span>
                <span>{invoice.contacts.email}</span>
              </div>
            )}

            {invoice.invoice_line_items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {invoice.invoice_line_items.length} line item{invoice.invoice_line_items.length !== 1 ? 's' : ''}:
                </p>
                <div className="space-y-1">
                  {invoice.invoice_line_items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.description} ({item.quantity} × {formatCurrency(item.unit_price)})
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  {invoice.invoice_line_items.length > 2 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{invoice.invoice_line_items.length - 2} more item{invoice.invoice_line_items.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}