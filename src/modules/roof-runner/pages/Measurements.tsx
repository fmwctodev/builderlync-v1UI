import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, History, Pencil } from 'lucide-react';
import { measurementsApi } from '../services/measurementsApi';
import PlaceOrderPage from '../components/measurements/PlaceOrderPage';
import OrderSummaryPage from '../components/measurements/OrderSummaryPage';
import OrderHistoryPage from '../components/measurements/OrderHistoryPage';
import EagleViewMeasurement from '../components/measurements/EagleViewMeasurement';
import { eagleViewService } from '../services/eagleViewService';
import { profileService } from '../../../shared/services/profileService';

type ViewType = 'Dashboard' | 'Order' | 'Order Summary' | 'Order History' | 'EagleView';

interface OrderData {
  address: string;
  propertyType: string;
  isComplex: boolean;
  buildingId: string;
  measurementInstructions: string;
  selectedProducts: Record<string, boolean>;
  totalCost: number;
}

interface BusinessInfo {
  id?: number;
  company_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export default function Measurements() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ViewType>(
    searchParams.get('order') === 'true' ? 'Order' : 'Dashboard'
  );
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedYTD: 0,
    balance: 0
  });

  const initialJobId = searchParams.get('jobId');
  const initialAddress = searchParams.get('address');

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadBusinessInfo();
    fetchEagleViewStats();
  }, []);

  const fetchEagleViewStats = async () => {
    try {
      const [ordersResponse, statusResponse] = await Promise.all([
        eagleViewService.getReports(),
        eagleViewService.getConnectionStatus()
      ]);

      // Handle potentially wrapped orders data
      const orders = Array.isArray(ordersResponse)
        ? ordersResponse
        : (ordersResponse as any).data || (ordersResponse as any).items || [];

      // Sort by date desc if not already
      orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentOrders(orders.slice(0, 5));

      // Process orders for stats
      const currentYear = new Date().getFullYear();
      let pending = 0;
      let completedThisYear = 0;

      orders.forEach((order: any) => {
        // Status check
        // Status IDs: 1=Created, 2=InProcess, 3=Pending, 4=Closed, 5=Completed
        if (order.status_id >= 1 && order.status_id <= 3) {
          pending++;
        }

        // Year check
        if (order.status_id === 4 || order.status_id === 5) {
          if (order.created_at) {
            const orderYear = new Date(order.created_at).getFullYear();
            if (orderYear === currentYear) {
              completedThisYear++;
            }
          } else {
            // Count as current if no date (fallback)
            completedThisYear++;
          }
        }
      });

      // Check if status is wrapped in data object
      const connectionData = (statusResponse as any).data || statusResponse;

      setStats({
        totalOrders: orders.length,
        pendingOrders: pending,
        completedYTD: completedThisYear,
        balance: connectionData.credits || 0
      });
    } catch (error) {
      console.error('Failed to fetch EagleView stats:', error);
    }
  };

  const loadBusinessInfo = async () => {
    setLoading(true);
    try {
      const data = await measurementsApi.getMeasurements();

      if (data) {
        // Map API response (zipCode) to Component State (zip_code)
        setBusinessInfo({
          ...data,
          company_name: data.company_name,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode || (data as any).zip_code || '' // Handle likely property name difference
        });
      } else {
        // Fallback to Profile Service
        try {
          const profile = await profileService.getUserProfile();
          if (profile) {
            setBusinessInfo({
              company_name: profile.company_name || profile.companyName || profile.organization || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              zip_code: profile.zip_code || profile.zipCode || ''
            });
          }
        } catch (profileError) {
          console.error('Error fetching fallback profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderComplete = () => {
    setOrderData(null);
    setActiveTab('Dashboard');
    // Refresh stats after order
    fetchEagleViewStats();
  };

  const handleSaveBusinessInfo = async (newInfo: BusinessInfo) => {
    console.log("newInfo", newInfo);
    // Convert back to API format if needed (zip_code -> zipCode)
    const payload = {
      ...newInfo,
      companyName: newInfo.company_name, // API likely expects camelCase or snake_case depending on backend, keeping one ensures at least one hits
      company_name: newInfo.company_name,
      zipCode: newInfo.zip_code,
      zip_code: newInfo.zip_code
    };

    // measurementsApi expects specific fields, cast to any to allow flexible payload
    const result = await measurementsApi.createOrUpdateMeasurement(payload as any);
    console.log("Save Result:", result);

    if (result) {
      // Update local state with result
      setBusinessInfo({
        ...result,
        // Handle both casing from API response to ensure UI updates
        company_name: result.company_name || (result as any).companyName || newInfo.company_name,
        address: result.address || newInfo.address,
        city: result.city || newInfo.city,
        state: result.state || newInfo.state,
        zip_code: result.zipCode || (result as any).zip_code || newInfo.zip_code
      });
      setIsEditing(false);
    }
  };

  const handleAddBusinessInfo = () => {
    setBusinessInfo({
      company_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: ''
    });
    setIsEditing(true);
  };

  const getStatusLabel = (statusId: number) => {
    switch (statusId) {
      case 1: return { label: 'CREATED', color: 'bg-blue-100 text-blue-800' };
      case 2: return { label: 'IN PROCESS', color: 'bg-purple-100 text-purple-800' };
      case 3: return { label: 'PENDING', color: 'bg-orange-100 text-orange-800' };
      case 4: return { label: 'CLOSED', color: 'bg-gray-100 text-gray-800' };
      case 5: return { label: 'COMPLETED', color: 'bg-green-100 text-green-800' };
      default: return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-primary-600 h-20 rounded-lg">
        <div className="px-6 pt-5">
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
          ) : isEditing ? (
            <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{businessInfo?.id ? 'Edit' : 'Add'} Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={businessInfo?.company_name || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo!, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={businessInfo?.address || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo!, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    value={businessInfo?.city || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo!, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                  <input
                    type="text"
                    value={businessInfo?.state || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo!, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={businessInfo?.zip_code || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo!, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveBusinessInfo(businessInfo!)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : businessInfo ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{businessInfo.company_name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{businessInfo.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {businessInfo.city}, {businessInfo.state} {businessInfo.zip_code}
                  </p>
                </div>
                <button
                  className="text-primary-600 hover:text-primary-700"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Information</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No business information found</p>
                <button
                  onClick={handleAddBusinessInfo}
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
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order pending</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. report cost</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{new Date().getFullYear()} Year To Date</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reports Completed</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.completedYTD}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prepayments</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ {stats.balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>

            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4 mb-4">
                {recentOrders.map((order) => {
                  const statusInfo = getStatusLabel(order.status_id);
                  return (
                    <div key={order.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                          {order.address}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">You have {stats.totalOrders} order(s) placed.</p>
            )}

            <button
              onClick={() => setActiveTab('Order')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus size={16} className="inline mr-2" />
              Start New Order
            </button>
            {recentOrders.length > 0 && (
              <button
                onClick={() => setActiveTab('Order History')}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/10 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/20"
              >
                View All Orders
              </button>
            )}
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
                className={`text-sm font-medium transition-colors ${activeTab === 'Dashboard'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('../diy')}
                className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Create DIY Drawing"
              >
                <Pencil className="inline-block mr-1" size={16} />
                Create DIY
              </button>
              <button
                onClick={() => setActiveTab('Order History')}
                className={`flex items-center text-sm font-medium transition-colors ${activeTab === 'Order History'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <History className="inline-block mr-1" size={16} />
                Order History
              </button>
              {/* <button
                onClick={() => setActiveTab('EagleView')}
                className={`flex items-center text-sm font-medium transition-colors ${activeTab === 'EagleView'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Camera className="inline-block mr-1" size={16} />
                EagleView
              </button> */}
              <button
                onClick={() => setActiveTab('Order')}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${activeTab === 'Order'
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

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Order History' && (
        <OrderHistoryPage
          onBack={() => setActiveTab('Dashboard')}
          onPlaceNewOrder={() => setActiveTab('Order')}
        />
      )}
      {activeTab === 'Order' && (
        <PlaceOrderPage
          onOrderComplete={handleOrderComplete}
          onBack={() => setActiveTab('Dashboard')}
          initialJobId={initialJobId || undefined}
          initialAddress={initialAddress || undefined}
        />
      )}
      {activeTab === 'EagleView' && (
        <EagleViewMeasurement />
      )}
      {activeTab === 'Order Summary' && orderData && (
        <OrderSummaryPage
          orderData={orderData}
          onBack={() => setActiveTab('Order')}
          onComplete={() => setActiveTab('Dashboard')}
        />
      )}
    </div>
  );
}