import React, { useState } from 'react';
import { X, CreditCard, Building } from 'lucide-react';

interface AIEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIEmployeeModal: React.FC<AIEmployeeModalProps> = ({ isOpen, onClose }) => {
  const [paymentTab, setPaymentTab] = useState('card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscribe to AI Employee Unlimited</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$97</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">per month</div>
                <div className="text-sm text-gray-500 mb-6">Cancel any time</div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white">Additional features</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>*Unlimited AI Agent minutes</div>
                  <div>*Unlimited Conversation AI messages</div>
                  <div>*Unlimited reviews reply using Reviews AI</div>
                  <div>*Unlimited content generation using Content AI</div>
                  <div>*Unlimited image generation using Image AI</div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">Billed Monthly</div>
            </div>

            <div>
              <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setPaymentTab('card')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    paymentTab === 'card'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <CreditCard size={16} />
                  Pay using Card
                </button>
                <button
                  onClick={() => setPaymentTab('agency')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    paymentTab === 'agency'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Building size={16} />
                  Charge to agency
                </button>
              </div>

              {paymentTab === 'card' ? (
                <div className="space-y-4">
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    Add new card
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                      <span className="text-gray-900 dark:text-white">ending in 556</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">default</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Expiry 2/2029</div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">How "Charge to Agency" works:</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>The Stripe account at the agency level will be charged for this purchase (not the sub-account).</p>
                      <p>Your client/sub-account will not be billed now or in the future for this purchase.</p>
                      <p>Only the standard HighLevel price will be charged — any resell markup will not apply.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  By confirming your subscription, you allow HighLevel to charge your wallet for this payment and future payments. Your use of AI Employee is subject to HighLevel's Terms of Service, including Excessive Use Restrictions. If HighLevel determines in its sole discretion that your usage is excessive, abusive, or negatively impacts our platform, we reserve the right to throttle, limit, require service upgrades, or terminate your access with or without notice.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                  Cancel
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  Pay $97 & Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmployeeModal;