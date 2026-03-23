import React, { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Check,
  AlertCircle,
  RefreshCw,
  Building2,
  Package
} from 'lucide-react';
import { useABCSupply } from '../../context/ABCSupplyContext';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { placeOrder, ABCSupplyOrderRequest } from '../../services/abcSupplyApi';

interface ABCSupplyCheckoutProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string, orderNumber: string) => void;
}

type DeliveryMethod = 'delivery' | 'pickup' | 'will_call';

export default function ABCSupplyCheckout({ onBack, onOrderPlaced }: ABCSupplyCheckoutProps) {
  const { currentOrganizationId } = useCurrentOrganization();
  const organizationId = currentOrganizationId || '';

  const {
    cartItems,
    selectedAccount,
    selectedBranch,
    cartSubtotal,
    cartItemCount,
    clearCart,
  } = useABCSupply();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [deliveryContact, setDeliveryContact] = useState({
    name: '',
    phone: '',
  });
  const [requestedDate, setRequestedDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedTax = cartSubtotal * 0.0825;
  const shippingCost = deliveryMethod === 'delivery' ? 0 : 0;
  const orderTotal = cartSubtotal + estimatedTax + shippingCost;

  const canSubmit = () => {
    if (!selectedAccount || !selectedBranch) return false;
    if (cartItems.length === 0) return false;
    if (!poNumber.trim()) return false;
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
        return false;
      }
      if (!deliveryContact.name || !deliveryContact.phone) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit() || !selectedAccount || !selectedBranch) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderRequest: ABCSupplyOrderRequest = {
        accountNumber: selectedAccount.accountNumber,
        branchNumber: selectedBranch.branchNumber,
        poNumber: poNumber.trim(),
        items: cartItems.map(item => ({
          itemNumber: item.product.itemNumber,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: item.pricing?.unitPrice || 0,
          description: item.product.itemDescription,
        })),
        deliveryMethod,
        specialInstructions: specialInstructions.trim() || undefined,
        requestedDeliveryDate: requestedDate || undefined,
        deliveryTimeWindow: timeWindow || undefined,
      };

      if (deliveryMethod === 'delivery') {
        orderRequest.deliveryAddress = deliveryAddress;
        orderRequest.deliveryContact = deliveryContact;
      }

      const response = await placeOrder(orderRequest, organizationId);

      if (response.success && response.orderId && response.orderNumber) {
        clearCart();
        onOrderPlaced(response.orderId, response.orderNumber);
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while placing the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
        <p className="text-white/70 mt-1">Complete your order details</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Account & Branch</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Ship-To Account</p>
                <p className="text-sm font-medium text-white">
                  {selectedAccount?.accountName || `Account #${selectedAccount?.accountNumber}`}
                </p>
                <p className="text-xs text-gray-400">#{selectedAccount?.accountNumber}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Branch Location</p>
                <p className="text-sm font-medium text-white">{selectedBranch?.branchName}</p>
                <p className="text-xs text-gray-400">Branch #{selectedBranch?.branchNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">PO Number</h2>
              <span className="text-red-400">*</span>
            </div>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="Enter your PO number"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Delivery Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'delivery', label: 'Delivery', desc: 'We deliver to your location' },
                { value: 'pickup', label: 'Pickup', desc: 'Pick up at branch' },
                { value: 'will_call', label: 'Will Call', desc: 'Schedule pickup time' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDeliveryMethod(option.value as DeliveryMethod)}
                  className={`p-4 rounded-lg border text-left transition ${
                    deliveryMethod === option.value
                      ? 'bg-primary-500/20 border-primary-500 text-white'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.label}</span>
                    {deliveryMethod === option.value && (
                      <Check className="h-4 w-4 text-primary-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary-400" />
                  <h2 className="text-lg font-semibold text-white">Delivery Address</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.line1}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })}
                      placeholder="123 Main St"
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={deliveryAddress.line2}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })}
                      placeholder="Apt, Suite, Unit, etc."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        State <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                        maxLength={2}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        ZIP <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary-400" />
                  <h2 className="text-lg font-semibold text-white">Delivery Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Contact Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryContact.name}
                      onChange={(e) => setDeliveryContact({ ...deliveryContact, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={deliveryContact.phone}
                      onChange={(e) => setDeliveryContact({ ...deliveryContact, phone: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Scheduling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Requested Date</label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={minDateStr}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Preferred Time</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No preference</option>
                  <option value="morning">Morning (7am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 5pm)</option>
                  <option value="first">First delivery of the day</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Special Instructions</h2>
            </div>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              placeholder="Any special instructions for delivery or order..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.product.itemNumber} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 truncate">{item.product.familyName}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {item.uom}
                    </p>
                  </div>
                  <span className="text-white ml-2">
                    ${item.pricing?.totalPrice?.toFixed(2) || '-'}
                  </span>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="text-sm text-gray-400">
                  + {cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Tax</span>
                <span className="text-white">${estimatedTax.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">TBD</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 mt-4 pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-semibold text-white">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Final total may vary based on actual shipping and tax
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit() || isSubmitting}
              className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Package className="h-5 w-5" />
                  Place Order
                </>
              )}
            </button>

            {!canSubmit() && !isSubmitting && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                Please fill in all required fields
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
