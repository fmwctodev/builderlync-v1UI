import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PaymentsTabProps {
  showActions: boolean;
  onActionsToggle: () => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ showActions, onActionsToggle }) => {
  const paymentActions = [
    'Add Card on File',
    'Charge Now',
    'Create Subscription',
    'Create Invoice',
    'Manage Cards',
    'Create Estimate'
  ];

  const PaymentSection = ({ title }: { title: string }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div>Date</div>
        <div>Amount</div>
        <div>Status</div>
      </div>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No {title.toLowerCase()} found
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No transactions yet! Create a new payment now
          </p>
          <div className="relative">
            <button 
              onClick={onActionsToggle}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              Actions
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {paymentActions.map((action) => (
                    <button 
                      key={action}
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

        <PaymentSection title="Transactions" />
        <PaymentSection title="Subscriptions" />
        <PaymentSection title="Invoices" />
      </div>
    </>
  );
};

export default PaymentsTab;