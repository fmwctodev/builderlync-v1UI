import React from 'react';

interface OrderSummaryProps {
  totalCost: number;
  onNext: () => void;
  disabled?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalCost, onNext, disabled = false }) => {
  const processingFee = 5.00;
  const taxRate = 0.08;
  const subtotal = totalCost + processingFee;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Products Subtotal</span>
          <span className="text-gray-900 dark:text-white">${totalCost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
          <span className="text-gray-900 dark:text-white">${processingFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
          <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By placing this order you agree to the Terms of Service and Privacy Policy.
        </p>
        
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            Save as Draft
          </button>
          
          <button 
            onClick={onNext}
            disabled={disabled}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;