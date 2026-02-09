import React, { useState, useEffect } from 'react';
import { ChevronDown, CreditCard, Receipt, Repeat } from 'lucide-react';
import { contactModulesApi, Invoice } from '../../../../shared/store/services/contactModulesApi';

interface PaymentsTabProps {
  contactId: number;
  showActions: boolean;
  onActionsToggle: () => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ contactId, showActions, onActionsToggle }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'subscriptions' | 'invoices'>('invoices');

  const fetchInvoices = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const response = await contactModulesApi.getInvoices(contactId);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [contactId]);

  const paymentActions = [
    'Add Card on File',
    'Charge Now',
    'Create Subscription',
    'Create Invoice',
    'Manage Cards',
    'Create Estimate'
  ];

  const filteredData = () => {
    switch (activeSubTab) {
      case 'transactions':
        return invoices.filter(inv => inv.status === 'paid');
      case 'subscriptions':
        return [];
      case 'invoices':
        return invoices;
      default:
        return invoices;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeSubTab === 'invoices' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeSubTab === 'transactions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Transactions ({invoices.filter(i => i.status === 'paid').length})
            </button>
            <button
              onClick={() => setActiveSubTab('subscriptions')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeSubTab === 'subscriptions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Subscriptions (0)
            </button>
          </div>

          <div className="relative">
            <button
              onClick={onActionsToggle}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2 text-sm font-medium"
            >
              Actions
              <ChevronDown className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 overflow-hidden">
                <div className="py-1">
                  {paymentActions.map((action) => (
                    <button
                      key={action}
                      onClick={onActionsToggle}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredData().length > 0 ? (
          <div className="space-y-3">
            {filteredData().map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                    <Receipt className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.invoice_number || `INV-${item.id}`}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.issue_date ? new Date(item.issue_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${item.total.toFixed(2)}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
              {activeSubTab === 'transactions' ? <CreditCard size={32} /> :
                activeSubTab === 'subscriptions' ? <Repeat size={32} /> : <Receipt size={32} />}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              No {activeSubTab} found for this contact
            </p>
            <p className="text-sm text-gray-400">
              Use the actions menu to create one
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentsTab;