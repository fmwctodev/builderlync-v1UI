import React from 'react';
import { ClipboardList } from 'lucide-react';

const OrderHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Order History</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
        <p className="text-gray-400">Your order history will appear here</p>
      </div>
    </div>
  );
};

export default OrderHistory;