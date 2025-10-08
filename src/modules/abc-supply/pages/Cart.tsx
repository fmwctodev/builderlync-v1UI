import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Cart: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
        <p className="text-gray-400">Add some products to get started</p>
      </div>
    </div>
  );
};

export default Cart;