import React, { useState, useEffect } from 'react';
import { FileStack, Plus, ChevronDown, ChevronUp, Loader2, Package } from 'lucide-react';
import { srsApi } from '../services/srsApi';
import Toast from '../../../shared/components/Toast';

interface SRSOrderTemplatesProps {
  onBack: () => void;
  branchId?: string;
}

const SRSOrderTemplates: React.FC<SRSOrderTemplatesProps> = ({ onBack, branchId }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await srsApi.getOrderTemplates();
        if (response.success) {
          setTemplates(response.data || []);
        } else {
          setToast({ message: response.message || 'Failed to fetch templates', type: 'error' });
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setToast({ message: 'An error occurred while fetching templates', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const toggleExpand = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  const handleAddToCart = async (template: any) => {
    setAddingToCart(template.templateId);
    try {
      // Logic to add products from template to cart
      // This usually involves dispatching to a Redux store or calling a cart service
      // For now, we'll simulate adding products and show a success message
      
      const cartKey = `srs_cart_${branchId || 'default'}`;
      const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const newItems = template.products.map((p: any) => ({
        id: p.productId,
        itemNumber: p.productId.toString(),
        itemDescription: p.productWebName,
        quantity: p.quantity || 1,
        selectedUOM: p.defaultUOM || 'EA',
        price: 0, // Price will be fetched by the cart/checkout process
        imageUrl: p.productImageUrl,
        supplier: 'SRS'
      }));

      // Merge or add new items
      const updatedCart = [...existingCart];
      newItems.forEach((newItem: any) => {
        const existingItemIndex = updatedCart.findIndex(item => item.id === newItem.id);
        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex].quantity += newItem.quantity;
        } else {
          updatedCart.push(newItem);
        }
      });

      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      
      // Trigger a storage event for other components (like ShoppingCart) to update
      window.dispatchEvent(new Event('storage'));
      setToast({ message: `Items from template "${template.name}" added to cart`, type: 'success' });
    } catch (error) {
      console.error('Error adding template to cart:', error);
      setToast({ message: 'Failed to add items to cart', type: 'error' });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading your order templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
          <FileStack className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Templates Found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
          You don't have any order templates in your SRS RoofHub account. Templates you create in RoofHub will appear here.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Templates</h2>
          <p className="text-gray-500 dark:text-gray-400">Quickly place orders using your saved RoofHub templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div 
            key={template.templateId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
          >
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(template.templateId)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                  <FileStack className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.products?.length || 0} products</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(template);
                  }}
                  disabled={addingToCart === template.templateId}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50"
                >
                  {addingToCart === template.templateId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add to Cart
                </button>
                {expandedTemplate === template.templateId ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedTemplate === template.templateId && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="mt-4 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template Products</h4>
                  {template.products && template.products.length > 0 ? (
                    template.products.map((product: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{product.productWebName}</p>
                            <p className="text-xs text-gray-500">Qty: {product.quantity} {product.defaultUOM}</p>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-gray-400">
                          {product.productId}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No products in this template.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SRSOrderTemplates;
