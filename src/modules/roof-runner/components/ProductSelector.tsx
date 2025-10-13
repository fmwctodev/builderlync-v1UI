import React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ProductCategory {
  name: string;
  products: Product[];
}

interface ProductSelectorProps {
  categories: ProductCategory[];
  onProductSelect: (productId: string, isSelected: boolean) => void;
  propertyType: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ categories, onProductSelect, propertyType }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Products</h2>
      
      <div className="space-y-6">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">{category.name}</h3>
            <div className="space-y-2">
              {category.products.map((product) => (
                <label key={product.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      onChange={(e) => onProductSelect(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{product.description}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${product.price}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;