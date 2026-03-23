import React from 'react';
import { ShoppingBag } from 'lucide-react';

const MaterialOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Material Orders</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Material Management</h3>
        <p className="text-gray-500 dark:text-gray-400">Order and track construction materials for your projects</p>
      </div>
    </div>
  );
};

export default MaterialOrders;