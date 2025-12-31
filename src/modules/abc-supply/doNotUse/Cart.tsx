import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { abcSupplyApi } from '../services/api';
import { ShipTo } from '../types';
import CheckoutForm, { CheckoutFormData } from '../components/CheckoutForm';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shipTos, setShipTos] = useState<ShipTo[]>([]);
  const [selectedShipTos, setSelectedShipTos] = useState<string[]>([]);

  useEffect(() => {
    const fetchShipTos = async () => {
      try {
        const data = await abcSupplyApi.getShipTos();
        setShipTos(data);
      } catch (error) {
        console.error('Failed to load shipTos:', error);
      }
    };
    fetchShipTos();
  }, []);

  const handleShipToChange = (shipToNumber: string, checked: boolean) => {
    setSelectedShipTos(prev => 
      checked 
        ? [...prev, shipToNumber]
        : prev.filter(num => num !== shipToNumber)
    );
  };

  const handleCheckout = async (checkoutData: CheckoutFormData) => {
    console.log('handleCheckout called with:', checkoutData);
    console.log('Cart items:', items);
    
    if (items.length === 0) {
      console.log('No items in cart, returning');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          sku: item.productId,
          name: `Product ${item.productId}`,
          quantity: item.quantity,
          unitPrice: 0,
          uom: item.uom
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
      
      // Only clear cart and show success if API call was successful
      setShowCheckoutForm(false);
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      // Don't clear cart on error - keep the form open so user can retry
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ShoppingCart className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-400">Your order has been submitted and is being processed.</p>
          <button 
            onClick={() => setOrderSuccess(false)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !showCheckoutForm) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
          <p className="text-gray-400">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
        <div className="text-sm text-gray-400">
          {items.length} items
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* ShipTo Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Select Ship To Addresses
            </h3>
            <div className="space-y-3">
              {shipTos.map((shipTo) => (
                <label key={shipTo.number} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedShipTos.includes(shipTo.number)}
                    onChange={(e) => handleShipToChange(shipTo.number, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-white">
                    {shipTo.name} ({shipTo.number})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          {items.map((item) => (
            <div key={`${item.productId}-${item.uom}`} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">Product ID: {item.productId}</h3>
                  <p className="text-gray-400 text-sm mb-4">Unit: {item.uom}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white font-medium w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Items ({items.length})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Shipping</span>
              <span>TBD</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Tax</span>
              <span>TBD</span>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              console.log('Proceed to Checkout clicked');
              if (selectedShipTos.length === 0) {
                alert('Please select at least one ship-to address');
                return;
              }
              setShowCheckoutForm(true);
            }}
            disabled={items.length === 0 || selectedShipTos.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={clearCart}
            className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckout}
        loading={loading}
        selectedShipTos={selectedShipTos}
        shipTos={shipTos}
      />
    </div>
  );
};

export default Cart;