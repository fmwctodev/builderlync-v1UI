import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, ChevronDown, CreditCard, MapPin } from 'lucide-react';
import { eagleViewService } from '../../services/eagleViewService';
import { validatePaymentInfo, isPaymentInfoComplete } from '../../utils/paymentValidation';
import ReadinessSummary from './ReadinessSummary';
import type { ReadinessStatus } from '../../types/readiness';

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
  const [showEmailRecipients, setShowEmailRecipients] = useState(false);
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [claimInfo, setClaimInfo] = useState({
    claimNumber: '',
    claimInformation: '',
    poNumber: '',
    dateOfLoss: '',
    catId: ''
  });
  const [activeOptions, setActiveOptions] = useState(['Yes', 'Ask', 'Yes', 'Yes']);
  const [includeDXF, setIncludeDXF] = useState(false);
  const [includeRXF, setIncludeRXF] = useState(false);
  const [includeXML, setIncludeXML] = useState(true);
  const [includePropertyOwner, setIncludePropertyOwner] = useState(false);
  const [includeCustomCover, setIncludeCustomCover] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const paymentReadiness = useMemo(() => {
    const validation = validatePaymentInfo(paymentInfo);
    const isComplete = isPaymentInfoComplete(paymentInfo);
    let status: ReadinessStatus = 'PASS';
    let blockingCount = 0;

    if (!isComplete) {
      status = 'FAIL';
      blockingCount = 1;
    } else if (!validation.isValid) {
      status = 'FAIL';
      blockingCount = Object.keys(validation.errors).length;
    }

    return { status, blockingCount, isComplete };
  }, [paymentInfo]);

  const scrollToPayment = () => {
    setShowPaymentInfo(true);
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const processingFee = 5.00;
  const taxRate = 0.08;
  const subtotal = orderData.totalCost + processingFee;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentInfo({...paymentInfo, cardNumber: formatted});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const cardDigits = paymentInfo.cardNumber.replace(/\s/g, '');
    
    if (!paymentInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!paymentInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!cardDigits) errors.cardNumber = 'Card number is required';
    else if (cardDigits.length < 13 || cardDigits.length > 19) errors.cardNumber = 'Invalid card number';
    if (!paymentInfo.expiryMonth) errors.expiryMonth = 'Expiry month is required';
    if (!paymentInfo.expiryYear) errors.expiryYear = 'Expiry year is required';
    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) errors.cvv = 'Valid CVV is required';
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(paymentInfo.expiryYear);
    const expMonth = parseInt(paymentInfo.expiryMonth);
    
    // if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    //   errors.expiryDate = 'Card has expired';
    // }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      setShowPaymentInfo(true);
      return;
    }
    
    setIsPlacingOrder(true);
    
    try {
      const orderRequest = eagleViewService.createOrderData({
        address: orderData.address,
        buildingId: orderData.buildingId,
        productId: 1,
        claimInfo,
        paymentInfo,
        specialInstructions
      });
      
      const result = await eagleViewService.submitOrder(orderRequest);
      
      if (result.success) {
        setIsPlacingOrder(false);
        setToast({message: 'Order placed successfully!', type: 'success'});
        setTimeout(() => {
          setToast(null);
          onComplete();
        }, 2000);
      } else {
        throw new Error(result.error || 'Order failed');
      }
    } catch (error) {
      setIsPlacingOrder(false);
      setToast({message: 'Failed to place order. Please try again.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
      console.error('Order error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
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
                      Claim Information
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={claimInfo.claimInformation}
                      onChange={(e) => setClaimInfo({...claimInfo, claimInformation: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Loss
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={claimInfo.dateOfLoss}
                      onChange={(e) => setClaimInfo({...claimInfo, dateOfLoss: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cat ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={claimInfo.catId}
                    onChange={(e) => setClaimInfo({...claimInfo, catId: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Email Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowEmailRecipients(!showEmailRecipients)}
            >
              <span className="font-medium text-gray-900 dark:text-white">Email Recipients</span>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${showEmailRecipients ? 'rotate-180' : ''}`} />
            </button>
            {showEmailRecipients && (
              <div className="px-6 pb-6">
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                  Your reports will be sent to <span className="font-bold">your@email.com</span>.
                  <a href="#" className="underline text-primary-600 dark:text-primary-400 ml-1">
                    Edit Contact Information.
                  </a>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Send a copy of the report to:
                  </label>
                  <input
                    type="email"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter additional email addresses"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Substitutions and Customization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowSubstitutions(!showSubstitutions)}
            >
              <span className="font-medium text-gray-900 dark:text-white">Substitutions and Customization</span>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${showSubstitutions ? 'rotate-180' : ''}`} />
            </button>
            {showSubstitutions && (
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Roof measurement report substitutions</h3>
                  <div className="space-y-4">
                    {[
                      'If a Residential/Multi-Family Report is unavailable send me a Commercial Report:',
                      'If a Full House is unavailable, send me a Roof Only:',
                      'If a Premium Report is unavailable send me an Extended Coverage 3D Report:',
                      'If an Extended Coverage 3D Report is unavailable send me an Extended Coverage 2D Report:'
                    ].map((question, index) => (
                      <div key={index}>
                        <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">{question}</p>
                        <div className="inline-flex border border-primary-600 rounded overflow-hidden">
                          {['Yes', 'No', 'Ask'].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                const updated = [...activeOptions];
                                updated[index] = option;
                                setActiveOptions(updated);
                              }}
                              className={`px-3 py-1 text-sm font-medium ${
                                activeOptions[index] === option
                                  ? 'bg-primary-600 text-white'
                                  : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Additional Report Formats</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">(Not available for all reports)</p>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeDXF}
                        onChange={() => setIncludeDXF(!includeDXF)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">DXF</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeRXF}
                        onChange={() => setIncludeRXF(!includeRXF)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">RXF</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeXML}
                        onChange={() => setIncludeXML(!includeXML)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">XML</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add-ons and custom cover page</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includePropertyOwner}
                        onChange={() => setIncludePropertyOwner(!includePropertyOwner)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Property Owner Report</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeCustomCover}
                        onChange={() => setIncludeCustomCover(!includeCustomCover)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include custom cover page</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div ref={paymentSectionRef} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      value={paymentInfo.firstName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, firstName: e.target.value})}
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      value={paymentInfo.lastName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, lastName: e.target.value})}
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
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
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    value={paymentInfo.cardNumber}
                    onChange={handleCardNumberChange}
                  />
                  {validationErrors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.cardNumber}</p>
                  )}
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
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        validationErrors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                    />
                    {validationErrors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.cvv}</p>
                    )}
                    {validationErrors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.expiryDate}</p>
                    )}
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
              {!paymentReadiness.isComplete && (
                <ReadinessSummary
                  overallStatus={paymentReadiness.status}
                  blockingCount={paymentReadiness.blockingCount}
                  warningCount={0}
                  onTogglePanel={scrollToPayment}
                  showToggle={true}
                />
              )}

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
                  disabled={isPlacingOrder || !paymentReadiness.isComplete}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    Object.keys(validationErrors).length > 0 || !paymentReadiness.isComplete ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
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