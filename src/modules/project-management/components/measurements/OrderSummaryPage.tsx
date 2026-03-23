import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, CreditCard, MapPin } from 'lucide-react';

interface OrderData {
  address: string;
  propertyType: string;
  isComplex: boolean;
  buildingId: string;
  measurementInstructions: string;
  selectedProducts: Record<string, boolean>;
  totalCost: number;
}

interface OrderSummaryPageProps {
  orderData: OrderData;
  onBack: () => void;
  onComplete: () => void;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ orderData, onBack, onComplete }) => {
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [showClaimInfo, setShowClaimInfo] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [claimInfo, setClaimInfo] = useState({
    claimNumber: '',
    claimInformation: '',
    poNumber: '',
    dateOfLoss: '',
    catId: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const processingFee = 5.00;
  const taxRate = 0.08;
  const subtotal = orderData.totalCost + processingFee;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSubmitOrder = async () => {
    setIsPlacingOrder(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsPlacingOrder(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-red-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:text-white bg-red-700 hover:bg-red-800 rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold">Finalize Order</h1>
            <p className="text-white">Review and complete your measurement order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">PROPERTY TYPE</h3>
                <p className="text-gray-900 dark:text-white">{orderData.propertyType}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">BUILDING ID</h3>
                <p className="text-gray-900 dark:text-white">{orderData.buildingId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{orderData.address}</span>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowSpecialInstructions(!showSpecialInstructions)}
            >
              <span className="font-medium text-gray-900 dark:text-white">Include Special Instructions</span>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${showSpecialInstructions ? 'rotate-180' : ''}`} />
            </button>
            {showSpecialInstructions && (
              <div className="px-6 pb-6">
                <textarea
                  className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter special instructions..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Claim Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowClaimInfo(!showClaimInfo)}
            >
              <span className="font-medium text-gray-900 dark:text-white">Claim Information</span>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${showClaimInfo ? 'rotate-180' : ''}`} />
            </button>
            {showClaimInfo && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Claim Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={claimInfo.claimNumber}
                      onChange={(e) => setClaimInfo({...claimInfo, claimNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PO Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={claimInfo.poNumber}
                      onChange={(e) => setClaimInfo({...claimInfo, poNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowPaymentInfo(!showPaymentInfo)}
            >
              <span className="font-medium text-gray-900 dark:text-white">Payment Information</span>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${showPaymentInfo ? 'rotate-180' : ''}`} />
            </button>
            {showPaymentInfo && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={paymentInfo.firstName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={paymentInfo.lastName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Month *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={paymentInfo.expiryMonth}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryMonth: e.target.value})}
                    >
                      <option value="">Month</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={paymentInfo.expiryYear}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryYear: e.target.value})}
                    >
                      <option value="">Year</option>
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year.toString().substring(2)}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Products</span>
                <span className="text-gray-900 dark:text-white">${orderData.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                <span className="text-gray-900 dark:text-white">${processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900 dark:text-white">Total (USD)</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By ordering a report you agree to our Terms of Use and Privacy Policy.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Edit Order
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isPlacingOrder}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Submit Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;