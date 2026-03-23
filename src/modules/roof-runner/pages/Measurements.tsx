import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, History, Settings } from 'lucide-react';
import PlaceOrderPage from '../components/measurements/PlaceOrderPage';
import OrderSummaryPage from '../components/measurements/OrderSummaryPage';
import OrderHistoryPage from '../components/measurements/OrderHistoryPage';
import { OrderDetailPage } from '../components/measurements/OrderDetailPage';
import AccountModeSelector from '../components/measurements/AccountModeSelector';
import { ProductSelectionStep } from '../components/measurements/ProductSelectionStep';
import { CreditCostBreakdownStep } from '../components/measurements/CreditCostBreakdownStep';
import { PrefilledBanner } from '../components/measurements/PrefilledBanner';
import { MeasurementOrderProvider, useMeasurementOrderContext } from '../context/MeasurementOrderContext';
import type { MeasurementOrder } from '../types/measurementOrder';
import { isInstantEstimatorRouteState } from '../types/estimatorNavigation';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { organizationsApi, OrganizationBusinessInfo } from '../../../shared/services/organizationsApi';

type ViewType = 'dashboard' | 'account-selection' | 'product-selection' | 'credit-breakdown' | 'place-order' | 'order-summary' | 'order-history' | 'order-detail';

interface OrderData {
  address: string;
  propertyType: string;
  isComplex: boolean;
  buildingId: string;
  measurementInstructions: string;
  selectedProducts: Record<string, boolean>;
  totalCost: number;
}


function Measurements() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrganizationId, currentOrganizationSlug } = useCurrentOrganization();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [businessInfo, setBusinessInfo] = useState<OrganizationBusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [routeStateProcessed, setRouteStateProcessed] = useState(false);

  const {
    enterUpgradeMode,
    isUpgradeFlow,
    accountMode,
    exitUpgradeMode,
    setSelectedAddress,
    setPrefilledSource,
    clearPrefilledSource,
    prefilledSource,
    prefilledAddressText,
  } = useMeasurementOrderContext();

  useEffect(() => {
    if (routeStateProcessed) return;

    const state = location.state;
    if (isInstantEstimatorRouteState(state)) {
      setSelectedAddress(state.propertyId, state.addressText);
      setPrefilledSource('instant_estimator', state.addressText);

      if (state.initialTab === 'order-history') {
        setActiveTab('Order History');
      } else {
        setActiveTab('account-selection');
      }

      navigate(location.pathname, { replace: true, state: undefined });
      setRouteStateProcessed(true);
    }
  }, [location.state, routeStateProcessed, navigate, setSelectedAddress, setPrefilledSource, location.pathname]);

  useEffect(() => {
    if (currentOrganizationId) {
      loadBusinessInfo();
    }
  }, [currentOrganizationId]);

  const handleUpgradeOrder = (order: MeasurementOrder) => {
    enterUpgradeMode(order, activeTab === 'order-detail' ? 'order_detail' : 'order_history');
    if (accountMode) {
      setActiveTab('credit-breakdown');
    } else {
      setActiveTab('account-selection');
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('order-detail');
  };

  const handleBackFromDetail = () => {
    setSelectedOrderId(null);
    setActiveTab('Order History');
  };

  const handleViewSourceOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const loadBusinessInfo = async () => {
    if (!currentOrganizationId) return;
    setLoading(true);
    try {
      const data = await organizationsApi.getOrganizationBusinessInfo(currentOrganizationId);
      setBusinessInfo(data);
    } catch (err) {
      console.error('Error loading business info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderComplete = (data: OrderData) => {
    setOrderData(data);
    setActiveTab('order-summary');
  };

  const navigateToBusinessSettings = () => {
    navigate(`/org/${currentOrganizationSlug}/settings/business-info`);
  };

  const hasBusinessInfo = businessInfo && (businessInfo.friendly_business_name || businessInfo.legal_business_name);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-primary-600 h-48 rounded-lg">
        <div className="px-6 pt-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </div>

      <div className="-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
            </div>
          ) : hasBusinessInfo ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {businessInfo.friendly_business_name || businessInfo.legal_business_name}
                  </h2>
                  {businessInfo.street_address && (
                    <p className="text-gray-600 dark:text-gray-400">{businessInfo.street_address}</p>
                  )}
                  {(businessInfo.city || businessInfo.state_region || businessInfo.postal_code) && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {[businessInfo.city, businessInfo.state_region, businessInfo.postal_code].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {businessInfo.business_phone && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{businessInfo.business_phone}</p>
                  )}
                  {businessInfo.business_email && (
                    <p className="text-gray-600 dark:text-gray-400">{businessInfo.business_email}</p>
                  )}
                </div>
                <button
                  className="text-primary-600 hover:text-primary-700"
                  onClick={navigateToBusinessSettings}
                  title="Edit in Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Information</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No business information found</p>
                <button
                  onClick={navigateToBusinessSettings}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Business Info
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total order</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order pending</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. report cost</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">2025 Year To Date</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reports Completed</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prepayments</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You have no recent orders at this time</p>
            <button
              onClick={() => setActiveTab('account-selection')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus size={16} className="inline mr-2" />
              Start New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('Dashboard')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'Dashboard'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('Order History')}
                className={`flex items-center text-sm font-medium transition-colors ${
                  activeTab === 'Order History'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <History className="inline-block mr-1" size={16} />
                Order History
              </button>
              <button
                onClick={() => setActiveTab('account-selection')}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  activeTab === 'Order' || activeTab === 'account-selection'
                    ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {prefilledSource && (
        <div className="px-6 pt-4">
          <PrefilledBanner
            source={prefilledSource}
            addressText={prefilledAddressText}
            onDismiss={clearPrefilledSource}
          />
        </div>
      )}

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Order History' && (
        <OrderHistoryPage
          onBack={() => setActiveTab('Dashboard')}
          onPlaceNewOrder={() => setActiveTab('account-selection')}
          onUpgradeOrder={handleUpgradeOrder}
          onViewOrder={handleViewOrder}
        />
      )}
      {activeTab === 'order-detail' && selectedOrderId && (
        <OrderDetailPage
          orderId={selectedOrderId}
          onBack={handleBackFromDetail}
          onUpgradeOrder={handleUpgradeOrder}
          onViewSourceOrder={handleViewSourceOrder}
        />
      )}
      {activeTab === 'account-selection' && (
        <div className="p-6">
          <AccountModeSelector
            onContinue={() => setActiveTab(isUpgradeFlow ? 'credit-breakdown' : 'product-selection')}
            onBack={() => {
              if (isUpgradeFlow) {
                exitUpgradeMode();
              }
              setActiveTab('Dashboard');
            }}
          />
        </div>
      )}
      {activeTab === 'product-selection' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-h-[600px]">
          <ProductSelectionStep
            onContinue={() => setActiveTab('credit-breakdown')}
            onBack={() => setActiveTab('account-selection')}
          />
        </div>
      )}
      {activeTab === 'credit-breakdown' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 min-h-[600px]">
          <CreditCostBreakdownStep
            onContinue={() => setActiveTab('Order')}
            onBack={() => setActiveTab(isUpgradeFlow ? 'account-selection' : 'product-selection')}
          />
        </div>
      )}
      {activeTab === 'Order' && (
        <PlaceOrderPage
          onOrderComplete={handleOrderComplete}
          onBack={() => setActiveTab('credit-breakdown')}
        />
      )}
      {activeTab === 'order-summary' && orderData && (
        <OrderSummaryPage
          orderData={orderData}
          onBack={() => setActiveTab('Order')}
          onComplete={() => setActiveTab('Dashboard')}
        />
      )}
    </div>
  );
}

function MeasurementsPage() {
  return (
    <MeasurementOrderProvider>
      <Measurements />
    </MeasurementOrderProvider>
  );
}

export default MeasurementsPage;