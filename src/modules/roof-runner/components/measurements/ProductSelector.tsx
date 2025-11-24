import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Home, Cloud, Sun, Layout, Info } from 'lucide-react';
import { ProductCategory } from '../../data/measurementData';

interface ProductSelectorProps {
  categories: ProductCategory[];
  onProductSelect: (productId: string, isSelected: boolean) => void;
  propertyType: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  categories,
  onProductSelect,
  propertyType
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<Record<string, string>>({});

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'full-house': return <Home className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
      case 'roof': return <Cloud className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
      case 'solar': return <Sun className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
      case 'walls': return <Layout className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
      default: return <Home className="h-6 w-6 text-primary-600 dark:text-primary-400" />;
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleProductSelect = (categoryId: string, productId: string, productName: string) => {
    const isSelected = selectedProducts[productId];
    let newSelected:any;
    
    if (categoryId === 'walls') {
      // Walls can have multiple selections (checkbox behavior)
      newSelected = !isSelected;
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: newSelected
      }));
      onProductSelect(productId, newSelected);
    } else {
      // Other categories are radio button behavior (single selection)
      const newProducts = { ...selectedProducts };
      
      // Clear other selections in the same category
      Object.keys(newProducts).forEach(key => {
        const product = categories.flatMap(c => c.products).find(p => p.id === key);
        const productCategory = categories.find(c => c.products.some(p => p.id === key));
        if (productCategory?.id === categoryId && key !== productId) {
          delete newProducts[key];
          onProductSelect(key, false);
        }
      });
      
      // Toggle current selection
      newSelected = !isSelected;
      if (newSelected) {
        newProducts[productId] = true;
      } else {
        delete newProducts[productId];
      }
      
      setSelectedProducts(newProducts);
      onProductSelect(productId, newSelected);
    }

    // Set default delivery option if product is selected
    if (newSelected) {
      const product = categories
        .find(c => c.id === categoryId)
        ?.products.find(p => p.id === productId);
      
      if (product?.deliveryOptions?.length) {
        const defaultOption = product.deliveryOptions[0];
        setSelectedDeliveryModes(prev => ({
          ...prev,
          [productId]: defaultOption.label
        }));
      }
    } else {
      // Remove delivery mode when product is unselected
      setSelectedDeliveryModes(prev => {
        const newModes = { ...prev };
        delete newModes[productId];
        return newModes;
      });
    }
  };

  const handleDeliveryChange = (productId: string, selectedLabel: string) => {
    setSelectedDeliveryModes(prev => ({
      ...prev,
      [productId]: selectedLabel
    }));
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex items-center">
              {getCategoryIcon(category.id)}
              <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">{category.name}</span>
              {category.isNew && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded">
                  NEW
                </span>
              )}
            </div>
            {expandedCategories[category.id] ? (
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>

          {expandedCategories[category.id] && (
            <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 space-y-4">
                {category.products.map((product) => {
                  const isSelected = selectedProducts[product.id];
                  return (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type={category.id === 'walls' ? 'checkbox' : 'radio'}
                          name={category.id === 'walls' ? undefined : `product-${category.id}`}
                          className="form-checkbox h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded mt-0.5"
                          checked={isSelected}
                          onChange={() => handleProductSelect(category.id, product.id, product.name)}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</span>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{product.description}</p>
                            </div>
                            {/* <div className="text-gray-700 dark:text-gray-300 font-medium ml-4">
                              ${product.price.toFixed(2)}
                            </div> */}
                          </div>

                          {/* Hover tooltip */}
                          <div className="fixed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            {product.reportOptions?.points && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{product.name}</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                  {product.reportOptions.points.map((point, index) => (
                                    <div key={index}>{point}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {product.reportOptions?.warningText && (
                              <div className="flex gap-2 bg-primary-50 dark:bg-primary-900/20 items-start p-2 rounded">
                                <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                                <p className="text-primary-800 dark:text-blue-200 text-xs">
                                  {product.reportOptions.warningText}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* {isSelected && product.deliveryOptions && product.deliveryOptions.length > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">Delivery:</span>
                              <select
                                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={selectedDeliveryModes[product.id] || ''}
                                onChange={(e) => handleDeliveryChange(product.id, e.target.value)}
                              >
                                {product.deliveryOptions.map((option, idx) => (
                                  <option key={idx} value={option.label}>
                                    {option.label} ${option.price > 0 ? `+$${option.price}` : 'Free'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )} */}

                          {selectedDeliveryModes[product.id] === "3 Hours" && (
                            <div className="mt-3 flex gap-3 bg-primary-50 dark:bg-primary-900/20 items-start p-3 rounded-lg">
                              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                              <p className="text-primary-800 dark:text-blue-200 text-sm">
                                Note: If we need assistance locating the property, we will contact you by phone and/or email. 
                                The 3 hour delivery time starts once the structure has been identified.
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductSelector;