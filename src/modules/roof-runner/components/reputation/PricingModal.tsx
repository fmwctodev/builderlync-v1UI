import React from 'react';
import { X, Check } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose your plan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Great new plans to choose from</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Plan</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$30</span>
                <span className="text-gray-600 dark:text-gray-400"> / month</span>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                Select Plan
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Saver Plan</h3>
              <div className="mb-2">
                <span className="text-lg text-gray-500 line-through">$100</span>
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  17% Savings
                </span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$150</span>
                <span className="text-gray-600 dark:text-gray-400"> / 6 months</span>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                Select Plan
              </button>
            </div>

            <div className="border-2 border-red-500 rounded-lg p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Best Value
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Annual Advantage Plan</h3>
              <div className="mb-2">
                <span className="text-lg text-gray-500 line-through">$360</span>
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  17% Savings
                </span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$300</span>
                <span className="text-gray-600 dark:text-gray-400"> / year</span>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                Select Plan
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;