import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { Product } from '../../abc-supply/types';
import { abcSupplyApi } from '../../abc-supply/services/api';
import CheckoutForm, { CheckoutFormData } from '../../abc-supply/components/CheckoutForm';

interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [branches, setBranches] = useState([]);
  const [shipTos, setShipTos] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      const fetchShipTos = async () => {
        try {
          const response = await fetch('https://builderlyncapi.testenvapp.com/api/abc-supply/accounts/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              filters: [{
                key: "storefront",
                condition: "equals",
                values: ["abc"]
              }],
              pagination: {
                itemsPerPage: 20,
                pageNumber: 1
              }
            })
          });
          const data = await response.json();
          if (data.success && data.data?.shipTos) {
            const sellableShipTos = data.data.shipTos.filter(item => item.isSellable === true);
            setShipTos(sellableShipTos);
            
            // Extract all branches from shipTos
            const allBranches = [];
            sellableShipTos.forEach(shipTo => {
              if (shipTo.branches) {
                shipTo.branches.forEach(branch => {
                  allBranches.push({
                    id: branch.number,
                    name: branch.name,
                    shipToNumber: shipTo.number
                  });
                });
              }
            });
            setBranches(allBranches);
          }
        } catch (error) {
          console.error('Failed to load shipTos:', error);
        }
      };
      fetchShipTos();
    }
  }, [isOpen]);

  const handleProceedToCheckout = () => {
    console.log('Proceed to Checkout clicked from ShoppingCart');
    setShowCheckoutForm(true);
  };

  const handleCheckoutSubmit = async (checkoutData: CheckoutFormData) => {
    console.log('Checkout form submitted:', checkoutData);
    
    if (items.length === 0) return;

    try {
      setLoading(true);
      const orderData = {
        items: items.map(item => ({
          productId: item.itemNumber,
          sku: item.itemNumber,
          name: item.familyName || `Product ${item.itemNumber}`,
          quantity: item.quantity,
          unitPrice: item.price || 0,
          uom: item.uoms?.[0]?.code || 'EA'
        })),
        branchNumber: checkoutData.branchNumber,
        deliveryAddress: checkoutData.deliveryAddress,
        contact: checkoutData.contact,
        deliveryDate: checkoutData.deliveryDate,
        instructions: checkoutData.instructions
      };

      console.log('Calling API with order data:', orderData);
      const result = await abcSupplyApi.createOrder(orderData);
      console.log('API call successful:', result);
      
      setShowCheckoutForm(false);
      setOrderSuccess(true);
      onCheckout(); // This will clear the cart in parent component
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* ShipTo Selection */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Ship To Address
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a ship to address...</option>
              {shipTos.map((shipTo) => (
                <option key={shipTo.number} value={shipTo.number}>
                  {shipTo.name} ({shipTo.number})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.itemNumber}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.familyName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Item #: {item.itemNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.supplierName}
                        </p>
                        {item.color?.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Color: {item.color.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          UOM: {item.uoms?.[0]?.code || 'EA'}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.itemNumber)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.itemNumber, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.itemNumber, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        {item.price ? (
                          <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${item.price.toFixed(2)} each
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Price on request</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (8%):</span>
                  <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={!selectedBranch || items.length === 0}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Final pricing will be confirmed at checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm mx-4">
            <ShoppingCart className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your order has been submitted and is being processed.</p>
            <button 
              onClick={() => {
                setOrderSuccess(false);
                onClose();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Checkout Form */}
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckoutSubmit}
        loading={loading}
        selectedShipTos={selectedBranch ? [selectedBranch] : []}
        shipTos={shipTos}
      />
    </div>
  );
};

export default ShoppingCartComponent;