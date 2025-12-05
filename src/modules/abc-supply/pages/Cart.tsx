import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { abcSupplyApi } from '../services/api';
import CheckoutForm, { CheckoutFormData } from '../components/CheckoutForm';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleCheckout = async (checkoutData: CheckoutFormData) => {
    if (items.length === 0) return;

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

      await abcSupplyApi.createOrder(orderData);
      setOrderSuccess(true);
      setShowCheckoutForm(false);
      clearCart();
    } catch (error) {
      console.error('Checkout failed:', error);
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

  if (items.length === 0) {
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
            onClick={() => setShowCheckoutForm(true)}
            disabled={items.length === 0}
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
      />
    </div>
  );
};

export default Cart;