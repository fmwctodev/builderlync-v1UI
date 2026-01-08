import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import ABCSupplyView from '../components/ABCSupplyView';
import SRSSupplyView from '../components/SRSSupplyView';

export default function MaterialOrders() {
  const [selectedSupplier, setSelectedSupplier] = useState('ABC Supply');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCreateOrder = () => {
    // Navigate to products view without reloading
    const event = new CustomEvent('navigateToProducts', { detail: { supplier: selectedSupplier } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Material Orders</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Material Orders</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Supplier Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {selectedSupplier}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <div className="py-1">
                  {['ABC Supply', 'SRS'].map((supplier) => (
                    <button
                      key={supplier}
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        selectedSupplier === supplier
                          ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {supplier}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleCreateOrder}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Plus size={16} />
            <span>Create Material Order</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {selectedSupplier === 'ABC Supply' && <ABCSupplyView />}
          {selectedSupplier === 'SRS' && <SRSSupplyView />}
        </div>
      </div>
    </div>
  );
}