import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { abcSupplyApi } from '../services/api';
import { ShipTo } from '../types';
import CheckoutForm, { CheckoutFormData } from '../components/CheckoutForm';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total, selectedShipTo, setSelectedShipTo, selectedBranch } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shipTos, setShipTos] = useState<ShipTo[]>([]);
  const [loadingShipTos, setLoadingShipTos] = useState(false);

  useEffect(() => {
    const fetchShipTos = async () => {
      try {
        setLoadingShipTos(true);
        const data = await abcSupplyApi.getShipTos();
        // Filter by isSellable: true per user request
        setShipTos(data.filter(s => s.isSellable));
      } catch (error) {
        console.error('Failed to load shipTos:', error);
      } finally {
        setLoadingShipTos(false);
      }
    };
    fetchShipTos();
  }, []);

  const handleShipToChange = (shipTo: ShipTo) => {
    setSelectedShipTo(shipTo);
  };

  const handleCheckout = async (checkoutData: CheckoutFormData) => {
    console.log('handleCheckout called with:', checkoutData);
    console.log('Cart items:', items);

    if (items.length === 0) {
      console.log('No items in cart, returning');
      return;
    }

    if (!selectedShipTo) {
      alert("No Ship-To account selected.");
      return;
    }

    // Determine branch number. 
    // User said: "get from the selected account and branch".
    // If selectedBranch is set (global), use it.
    // If not, try to fallback to selectedShipTo's associated branch?
    // Usually selectedBranch should differ from shipTo branch? 
    // shipTo usually has a 'homeBranch' or 'branches' list.
    // Let's prioritize selectedBranch.id if available.

    let branchNumberToUse = selectedBranch?.id;

    if (!branchNumberToUse) {
      // Check if selectedShipTo has branch info
      if (selectedShipTo.branches && selectedShipTo.branches.length > 0) {
        branchNumberToUse = selectedShipTo.branches[0].number;
      }
      // Note: shipTo interface also sometimes has direct 'branch' property in some contexts/API versions just seen in checkout form..
      // But type definition says 'branches: ShipToBranch[]'.
    }

    if (!branchNumberToUse) {
      alert("No branch selected and no default branch found for this account. Please select a branch.");
      return;
    }

    if (!selectedShipTo.address) {
      console.error("Selected Ship-To account has no address:", selectedShipTo);
      alert("Selected Ship-To account has no address information. Please select another account.");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          sku: item.productId,
          name: `Item ${item.productId}`,
          quantity: item.quantity,
          unitPrice: 0,
          uom: item.uom
        })),
        branchNumber: branchNumberToUse,
        shipToAccountNumber: selectedShipTo.number,
        deliveryAddress: {
          name: selectedShipTo.name,
          line1: selectedShipTo.address.line1 || "",
          line2: selectedShipTo.address.line2 || "",
          city: selectedShipTo.address.city || "",
          state: selectedShipTo.address.state || "",
          postal: selectedShipTo.address.postal || ""
        },
        contact: checkoutData.contact,
        deliveryDate: checkoutData.deliveryDate,
        instructions: checkoutData.instructions,
        // We pass deliveryService here, but createOrder signature in API likely needs update to accept it if it's new.
        // Assuming we pass it blindly or update API service next.
        // But wait, createOrder in api.ts accepts strict Typed object. 
        // I need to check api.ts createOrder signature. It doesn't have deliveryService in input type!
        // I will add it to the valid input there or force cast it here if I can't change it right now.
        // Better to update api.ts. For now, let's pass it and I will update api.ts in next step.
        deliveryService: checkoutData.deliveryService
      };

      console.log('Calling API with order data:', orderData);
      const result = await abcSupplyApi.createOrder(orderData);
      console.log('API call successful:', result);

      setShowCheckoutForm(false);
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Checkout failed:', error);
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
          <p className="text-gray-400 mb-4">Add some products to get started</p>
          <Link
            to="/abc-supply/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Browse Products
          </Link>
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
              Select Ship To Address
            </h3>

            {loadingShipTos ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : shipTos.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                No ship-to accounts found (or none sellable). Please contact support.
              </div>
            ) : (
              <div className="space-y-3">
                {shipTos.map((shipTo) => (
                  <label key={shipTo.number} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="shipTo"
                      checked={selectedShipTo?.number === shipTo.number}
                      onChange={() => handleShipToChange(shipTo)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block text-white font-medium">
                        {shipTo.name}
                      </span>
                      <span className="block text-sm text-gray-400">
                        Account #: {shipTo.number}
                      </span>
                      <span className="block text-sm text-gray-400">
                        {shipTo.address.line1}, {shipTo.address.city}, {shipTo.address.state}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cart Items */}
          {items.map((item) => (
            <div key={`${item.productId}-${item.uom}`} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">Item #: {item.productId}</h3>
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
              <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {!selectedBranch && (
              <div className="text-sm text-yellow-500 mb-2">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Select a branch for accurate pricing and fulfillment.
              </div>
            )}
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pricing calculated at checkout or by branch request.</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!selectedShipTo) {
                alert('Please select a ship-to address account.');
                return;
              }
              setShowCheckoutForm(true);
            }}
            disabled={items.length === 0 || !selectedShipTo}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium"
          >
            {selectedShipTo ? 'Proceed to Checkout' : 'Select Ship-To Account'}
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