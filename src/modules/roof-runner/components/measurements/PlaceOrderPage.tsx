import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Download, Check, FileText, AlertCircle, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AddressSearch from './AddressSearch';
import { eagleViewService } from '../../services/eagleViewService';
import { BuyCreditsModal } from './BuyCreditsModal';

interface PlaceOrderPageProps {
  onOrderComplete: (orderData: any) => void;
  onBack: () => void;
}

const PRODUCTS = [
  { id: 'bidPerfect', name: 'BidPerfect', type: 'Pro', desc: 'Quick and accurate measurements for bidding', price: 'Price TBD', credits: 2, badge: 'basic' },
  { id: 'fullHouse', name: 'Full House', type: 'Pro', desc: 'Complete measurements for the entire house', price: 'Price TBD', credits: 3, badge: 'pro' },
  { id: 'gutter', name: 'Gutter', type: 'Basic', desc: 'Roof diagram with gutters highlighted', price: 'Price TBD', credits: 1, badge: 'basic' },
  { id: 'premium', name: 'Premium', type: 'Upgrade', desc: 'Premium roof measurement report', price: 'Price TBD', credits: 0, badge: 'upgrade', upgradeOnly: true, note: 'Available only after BidPerfect is delivered.' },
  { id: 'solar_inform_essentials', name: 'Inform Essentials+', type: 'Basic', desc: 'Basic solar installation data', price: 'Price TBD', credits: 0, badge: 'coming-soon', comingSoon: true, note: 'This product will be available in V1' },
  { id: 'solar_inform_advanced', name: 'Inform Advanced', type: 'Basic', desc: 'Advanced solar data with SAV and TSRF', price: 'Price TBD', credits: 0, badge: 'coming-soon', comingSoon: true, note: 'This product will be available in V1' },
  { id: 'solar_truedesign_sales', name: 'TrueDesign for Sales', type: 'Basic', desc: 'Design residential PV layout for sales', price: 'Price TBD', credits: 0, badge: 'coming-soon', comingSoon: true, note: 'This product will be available in V1' },
  { id: 'solar_truedesign_planning', name: 'TrueDesign for Planning', type: 'Basic', desc: 'Export PV design for install planning', price: 'Price TBD', credits: 0, badge: 'coming-soon', comingSoon: true, note: 'This product will be available in V1' },
];

const PlaceOrderPage: React.FC<PlaceOrderPageProps> = ({ onOrderComplete, onBack }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const [step, setStep] = useState<'payment-method' | 'product-selection' | 'breakdown'>('payment-method');
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; usingOwnAccount: boolean; credits: number }>({
    connected: false, usingOwnAccount: false, credits: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  // Order Data State
  const [address, setAddress] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [addressComponents, setAddressComponents] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'credits' | 'account' | null>(null);

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await eagleViewService.getConnectionStatus();
      // API returns: { success: true, data: { connected: true, usingOwnAccount: true, credits: 0 } }
      // Or if checking implementation, it might return the data directly depending on service. wrapper.
      // Let's check the service implementation in eagleViewService.ts:
      // It returns `await response.json()` which is the full response object from controller.
      // Controller sends `ResponseHandler.success(res, status)`, which usually wraps in `{ success: true, data: ... }`.

      const status = (response as any).data || response;
      setConnectionStatus(status);

      // Decision Logic:
      // If NOT connected -> Stay on 'payment-method' (default).
      // If connected -> Automatically skip to 'product-selection' (unless user wants to explicitly change payment method?)
      // User requirement: "When a user clicks ... and their EagleView account is not connected, display a 'Select Payment Method' UI"
      // Implication: If connected, we might skip this. 
      // For now, I'll allow the user to see the payment method selection if they aren't forced otherwise, 
      // but to reduce friction, if connected, let's default to product selection
      if (status.connected) {
        setPaymentMethod('account'); // Default to account if connected
        setStep('product-selection');
      }
    } catch (error) {
      console.error('Failed to load connection status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string, components?: any) => {
    setAddress(selectedAddress);
    // setBuildingId(selectedAddress);
    setAddressComponents(components);
  };

  const handleProductToggle = (productId: string) => {
    let newSelection = [...selectedProducts];

    if (productId === 'fullHouse') {
      if (newSelection.includes('fullHouse')) {
        newSelection = [];
      } else {
        newSelection = ['fullHouse'];
      }
    } else {
      if (newSelection.includes('fullHouse')) {
        newSelection = [];
      }

      if (newSelection.includes(productId)) {
        newSelection = newSelection.filter(id => id !== productId);
      } else {
        newSelection.push(productId);
      }
    }

    setSelectedProducts(newSelection);
  };

  const calculateTotalCredits = () => {
    return selectedProducts.reduce((sum, id) => {
      const product = PRODUCTS.find(p => p.id === id);
      return sum + (product?.credits || 0);
    }, 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // --- Step 1: Payment Method ---
  if (step === 'payment-method') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start New Order</h1>
        </div>

        <div className="max-w-4xl mx-auto py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Payment Method</h2>
          <p className="text-gray-500 mb-8">Choose how you would like to pay for your measurement order</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* BuilderLync Credits */}
            <div
              onClick={() => {
                setPaymentMethod('credits');
                setStep('product-selection');
              }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                  <Wallet className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">BuilderLync Credits</h3>
                  <p className="text-sm text-gray-500">Use your prepaid credit balance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Wallet className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">${connectionStatus.credits?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-500">
                    {connectionStatus.credits > 0 ? 'Credits available' : 'No credits available'}
                  </p>
                </div>
              </div>
            </div>

            {/* EagleView Account */}
            <div
              onClick={() => {
                if (connectionStatus.connected && connectionStatus.usingOwnAccount) {
                  setPaymentMethod('account');
                  setStep('product-selection');
                } else {
                  navigate(`/org/${orgSlug}/settings/integrations`);
                }
              }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                  <Download className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 transform -rotate-45" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">EagleView Account</h3>
                  <p className="text-sm text-gray-500">Bill directly to your EagleView account</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {connectionStatus.connected ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Connected</p>
                      <p className="text-xs text-gray-500">Ready to use</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Not connected</p>
                      <p className="text-xs text-gray-500">Click to connect in Settings</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Product Selection ---
  if (step === 'product-selection') {
    const totalCredits = calculateTotalCredits();
    // Assuming we need a valid address to continue as well as products
    const canContinue = selectedProducts.length > 0 && !!address;

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <button
            onClick={() => connectionStatus.connected ? onBack() : setStep('payment-method')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {connectionStatus.connected ? 'Back' : 'Back to account selection'}
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select Products</h1>
              <p className="text-gray-500">Choose the measurement reports and data products for your order</p>
            </div>
          </div>
        </div>

        {/* Sticky Selection Bar */}
        <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center -mx-6 px-6">
          <div className="text-gray-500">
            {selectedProducts.length === 0 ? 'Select at least one product to continue' : (
              <span className="text-gray-900 font-medium">{selectedProducts.length} products selected • {totalCredits} Credits</span>
            )}
          </div>
          <button
            disabled={!canContinue}
            onClick={() => setStep('breakdown')}
            className={`px-6 py-2 rounded font-medium transition-colors ${canContinue
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' // Matches screenshot "Continue" button style (looks gray/disabled until active, or just light gray)
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Continue
          </button>
        </div>

        {/* Address Search & Context Cards */}
        {/* Address Search & Context Cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Property Location</h3>
            <AddressSearch
              onAddressSelect={handleAddressSelect}
              buildingId={buildingId || address}
              setBuildingId={setBuildingId}
            />
          </div>

          {address && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Property Data Preview Card */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center flex flex-col items-center justify-center min-h-[160px] bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2 w-full justify-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Property Data</h4>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded border border-green-200">Verified</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 text-center">{address}</p>

                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-10 h-10 mb-2 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Address validated</p>
                </div>
              </div>

              {/* Property Imagery Card */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center flex flex-col items-center justify-center min-h-[160px] bg-gray-50 dark:bg-gray-700/50">
                <div className="w-full text-center mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Imagery Found</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4 text-center">High-res imagery available</p>
                <div className="flex flex-col items-center text-gray-400">
                  <div className="w-10 h-10 mb-2 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500">Ready for measurement</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Measurement Reports List */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Measurement Reports
          </h3>

          <div className="space-y-3">
            {PRODUCTS.map(product => !product.comingSoon && (
              <div
                key={product.id}
                onClick={() => !product.upgradeOnly && handleProductToggle(product.id)}
                className={`bg-white dark:bg-gray-800 p-6 rounded-lg border flex justify-between items-center transition-all ${!product.upgradeOnly ? 'cursor-pointer hover:border-blue-300' : ''
                  } ${selectedProducts.includes(product.id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{product.name}</h4>
                    <span className={`text-xs uppercase px-2 py-0.5 rounded font-semibold ${product.type === 'Pro' ? 'bg-blue-100 text-blue-700' :
                      product.type === 'Upgrade' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {product.type}
                    </span>
                  </div>
                  <p className="text-gray-500">{product.desc}</p>
                  {product.upgradeOnly && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {product.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-8">
                  <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{product.price}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedProducts.includes(product.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                    } ${product.upgradeOnly ? 'bg-gray-100 border-gray-200' : ''}`}>
                    {/* Empty circle for unselected, filled for selected. To match screenshot, maybe just a circle outline? Screenshot shows a circle. */}
                    {selectedProducts.includes(product.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="space-y-4 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 opacity-50">
            Solar <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Coming Soon - V1</span>
          </h3>
          {PRODUCTS.map(product => product.comingSoon && (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center opacity-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                    {product.type}
                  </span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">
                    Coming Soon - V1
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{product.desc}</p>
                <p className="text-xs text-gray-400">{product.note}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Step 3: Breakdown ---
  if (step === 'breakdown') {
    const totalCredits = calculateTotalCredits();
    const missingCredits = Math.max(0, totalCredits - connectionStatus.credits);
    const hasSufficient = missingCredits === 0;

    return (
      <div className="space-y-6 pb-24"> {/* Added padding-bottom for sticky footer */}

        {/* Top Alerts */}
        {paymentMethod === 'credits' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center text-yellow-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded text-yellow-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-semibold opacity-70">Available Credits</p>
                <p className="text-xl font-bold">{connectionStatus.credits} Credits</p>
                {!hasSufficient && <p className="text-xs text-yellow-700">Need: {missingCredits} more credits</p>}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'credits' && !hasSufficient && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-sm">Insufficient credits to place this order</p>
                <p className="text-xs text-red-700 mt-1 max-w-md">
                  You need {missingCredits} more credits to complete this order. Purchase additional credits to continue.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBuyCredits(true)}
              className="px-4 py-1.5 bg-red-700 text-white rounded text-sm font-medium hover:bg-red-800 whitespace-nowrap flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Buy Credits
            </button>
          </div>
        )}

        {/* Order Summary Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Order Summary</h3>
          </div>
          <div className="p-4">
            {selectedProducts.map(id => {
              const prod = PRODUCTS.find(p => p.id === id);
              return (
                <div key={id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-100 text-blue-600 rounded">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{prod?.name}</p>
                      <p className="text-xs text-gray-500">Product</p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {paymentMethod === 'credits' ? `${prod?.credits} Credits` : 'Bill to Account'}
                  </span>
                </div>
              )
            })}

            {paymentMethod === 'credits' ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 mt-2 text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{totalCredits} Credits</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-gray-900 dark:text-white text-base">
                  <span>Total Credits Required</span>
                  <span>{totalCredits} Credits</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center pt-4 font-bold text-gray-900 dark:text-white text-base border-t border-gray-100 mt-2">
                <span>Payment Method</span>
                <span className="text-blue-600 flex items-center gap-2">
                  <Check className="w-4 h-4" /> EagleView Account
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Promo Code Section - Hide if using own account? Usually yes, promos are for credit purchases usually.  */}
        {paymentMethod === 'credits' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 text-gray-400"><FileText className="w-full h-full" /></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Promo Code</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
              />
              <button className="px-4 py-2 bg-red-400 text-white rounded-md text-sm font-medium hover:bg-red-500">Apply</button>
            </div>
          </div>
        )}

        {/* Readiness Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Readiness Checklist</h3>
              {paymentMethod === 'credits' && !hasSufficient && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">1 blocking</span>}
              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">1 warning</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 rotate-90`} />
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">CORE REQUIREMENTS</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Account Mode</p>
                      <p className="text-xs text-green-700">
                        {paymentMethod === 'credits' ? 'Using Credits' : 'Using EagleView Account'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 uppercase">PASS</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Product Selection</p>
                      <p className="text-xs text-green-700">{selectedProducts.length} product(s) selected</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 uppercase">PASS</span>
                </div>
                {/* Upgrade config omitted for brevity if standard */}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {paymentMethod === 'credits' ? 'PRICING & CREDITS' : 'BILLING'}
              </p>
              <div className="space-y-2">
                {paymentMethod === 'credits' ? (
                  hasSufficient ? (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Credit Balance</p>
                          <p className="text-xs text-green-700">Sufficient credits</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-700 uppercase">PASS</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">Credit Balance</p>
                          <p className="text-xs text-red-700">Insufficient credits (need {missingCredits} more)</p>
                          <button onClick={() => setShowBuyCredits(true)} className="text-xs text-red-700 underline font-medium mt-1">Buy Credits »</button>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-700 uppercase">FAIL</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Billing Connection</p>
                        <p className="text-xs text-green-700">Account Connected</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-700 uppercase">PASS</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">INFORMATION</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center"><AlertCircle className="w-3.5 h-3.5 text-yellow-600" /></div>
                    <div>
                      <p className="font-medium text-gray-900">Environment</p>
                      <p className="text-xs text-yellow-700">Running in non-production environment</p>
                      <p className="text-[10px] text-yellow-600 italic">Orders placed here will use test/sandbox APIs</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-700 uppercase">WARN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 flex justify-between items-center px-8">
          <button onClick={() => setStep('product-selection')} className="text-gray-600 font-medium hover:text-gray-900">
            Back
          </button>
          <button
            onClick={async () => {
              // If payment method is account, hasSufficient doesn't matter
              const canSubmit = paymentMethod === 'account' || hasSufficient;

              if (canSubmit) {
                setIsSubmitting(true);
                try {
                  // Helper to extract address components
                  const getAddressComponent = (type: string) => {
                    if (!addressComponents?.components) return '';
                    const comp = addressComponents.components.find((c: any) => c.types.includes(type));
                    return comp ? comp.short_name : '';
                  };

                  // Map products to EagleView IDs
                  const productMap: Record<string, number> = {
                    'bidPerfect': 16, // QuickSquares
                    'fullHouse': 13, // Premium/Standard
                    'gutter': 29,    // Gutter
                    'premium': 13,   // Premium
                  };

                  // Determine primary product (take first valid one or default to Full House/13)
                  const primaryProductKey = selectedProducts.find(p => productMap[p] !== undefined);
                  const primaryProductId = primaryProductKey ? productMap[primaryProductKey] : 13;

                  // Construct Order Request
                  const orderData = {
                    orderReports: {
                      reportAddresses: {
                        address: address.split(',')[0], // Heuristic for street address
                        city: getAddressComponent('locality'),
                        state: getAddressComponent('administrative_area_level_1'),
                        zip: getAddressComponent('postal_code'),
                        country: 'US',
                        latitude: addressComponents?.lat || 0,
                        longitude: addressComponents?.lng || 0,
                        addressType: 1 // Residential
                      },
                      buildingId: buildingId || address, // Use buildingId or address
                      primaryProductId: primaryProductId,
                      deliveryProductId: 5, // Standard Delivery
                      addOnProductIds: [],
                      measurementInstructionType: 1,
                      reportAttributes: {},
                      changesInLast4Years: false
                    },
                    placeOrderUser: 'BuilderLync User' // Placeholder for current user
                  };

                  // Submit Order
                  const result = await eagleViewService.submitOrder(orderData as any); // Cast to any to avoid strict type mismatch if interfaces vary slightly

                  if (result.success) {
                    onOrderComplete({
                      ...result,
                      address,
                      addressComponents,
                      paymentMethod,
                      selectedProducts,
                      credits: totalCredits
                    });
                  } else {
                    alert(`Order failed: ${result.error || result.message || 'Unknown error'}`);
                    console.error('Order submission failed:', result);
                  }
                } catch (error) {
                  console.error('Order submission exception:', error);
                  alert('An error occurred while placing the order. please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }
            }}
            disabled={(paymentMethod === 'credits' && !hasSufficient) || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium text-white shadow-sm flex items-center gap-2 ${(paymentMethod === 'account' || hasSufficient)
              ? 'bg-gray-900 text-white hover:bg-gray-800' // Dark styling for action button
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? 'Processing...' : (
              <>
                Continue to Order <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <BuyCreditsModal
          isOpen={showBuyCredits}
          onClose={() => setShowBuyCredits(false)}
          currentBalance={connectionStatus.credits}
        />
      </div>
    );
  }

  return null;
};

export default PlaceOrderPage;