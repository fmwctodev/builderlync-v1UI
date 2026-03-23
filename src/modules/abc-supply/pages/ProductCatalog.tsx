import React from 'react';
import { ShoppingBag } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Product Catalog Coming Soon</h3>
        <p className="text-gray-400">Browse thousands of construction materials and supplies</p>
      </div>
    </div>
  );
};

export default ProductCatalog;