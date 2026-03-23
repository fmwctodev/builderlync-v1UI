import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { getProductById } from '../../data/productCatalog';
import type { ProductId } from '../../types/measurementOrder';

interface LockedProductDisplayProps {
  productId: ProductId;
  label?: string;
}

const LockedProductDisplay: React.FC<LockedProductDisplayProps> = ({
  productId,
  label = 'Selected Product (Locked)',
}) => {
  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-500 dark:text-gray-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Upgrade Only</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Lock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h4>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full">
                Premium
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {product.shortDescription}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Features
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border-t border-primary-100 dark:border-primary-900/40">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-700 dark:text-primary-300">
            Product selected for upgrade
          </span>
          {product.pricing.eagleViewBasePrice && (
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              ${product.pricing.eagleViewBasePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockedProductDisplay;
