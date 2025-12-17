import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BillingProps {
  userRole?: string;
}

const Billing: React.FC<BillingProps> = ({ userRole = 'Owner' }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and payment methods</p>
      </div>

      {userRole !== 'Owner' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage billing settings.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Professional Plan</h4>
            <p className="text-gray-600 dark:text-gray-400">$497/month • Billed monthly</p>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            disabled={userRole !== 'Owner'}
          >
            Change Plan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-primary-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${userRole === 'Owner'
                ? 'text-primary-600 hover:underline dark:text-primary-400'
                : 'text-gray-400 cursor-not-allowed'
              }`}
            disabled={userRole !== 'Owner'}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;