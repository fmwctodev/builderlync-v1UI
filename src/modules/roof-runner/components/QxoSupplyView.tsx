import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Phone, Building } from 'lucide-react';
import { qxoApi } from '../services/qxoApi';
import QxoBranchLocator from './QxoBranchLocator';
import QxoProductCatalog from './QxoProductCatalog';
import QxoOrderHistory from './QxoOrderHistory';

interface Branch {
  id: string;
  name: string;
  address: {
    city: string;
    state: string;
  };
  phone: string;
}

const QxoSupplyView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const initialView = searchParams.get('tab') || 'dashboard';
  const [currentView, setCurrentViewLocal] = useState(initialView);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    orders: false,
    products: false,
    branches: false
  });

  const setCurrentView = (view: string) => {
    setCurrentViewLocal(view);
    setSearchParams(prev => {
      prev.set('tab', view);
      return prev;
    });
  };

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== currentView) {
      setCurrentViewLocal(urlTab);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadSelection = () => {
      const savedBranch = localStorage.getItem('qxo_selected_branch');
      if (savedBranch) {
        try {
          setSelectedBranch(JSON.parse(savedBranch));
        } catch (e) { console.error(e); }
      } else {
        setSelectedBranch(null);
      }
    };
    loadSelection();
    
    window.addEventListener('storage', loadSelection);
    return () => window.removeEventListener('storage', loadSelection);
  }, [currentView]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await qxoApi.getStatus();
        const connected = response.data?.connected || response?.connected;
        setIsConnected(connected);
        
        if (connected) {
          if (response.data?.profileData?.accountBranch && !localStorage.getItem('qxo_selected_branch')) {
              // Auto select branch if they have one attached to profile
              const branch = response.data.profileData.accountBranch;
              const branchObj = {
                  id: branch.branchNumber || branch.market,
                  name: branch.branchName,
                  address: branch.address,
                  phone: branch.branchPhone
              };
              localStorage.setItem('qxo_selected_branch', JSON.stringify(branchObj));
              setSelectedBranch(branchObj);
          }
          
          // Fetch Recent Orders
          setLoading(prev => ({ ...prev, orders: true }));
          const ordersRes = await qxoApi.getOrders({ pageSize: 5 });
          if (ordersRes.success) {
            setRecentOrders(ordersRes.data || []);
          }

          // Fetch Featured Products
          setLoading(prev => ({ ...prev, products: true }));
          const productsRes = await qxoApi.searchProducts({ keyword: 'Roofing', pageSize: 4 });
          if (productsRes.success) {
            let items = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.items || productsRes.data.data || []);
            setFeaturedProducts(items.slice(0, 4));
          }
        }
      } catch (error) {
        setIsConnected(false);
      } finally {
        setCheckingConnection(false);
        setLoading(prev => ({ ...prev, orders: false, products: false }));
      }
    };
    checkConnection();
  }, [selectedBranch?.id]); // Refetch if branch changes

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderDashboard = () => {
    if (checkingConnection) {
      return (
        <div className="flex items-center justify-center py-20">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <Building className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">QXO Account Not Connected</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-8">
            Please connect your QXO (Beacon) account in settings to access custom pricing, inventory, and material ordering.
          </p>
          <button
            onClick={() => navigate(`/org/${orgSlug}/settings/integrations`)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Connect QXO (Beacon)
          </button>
        </div>
      );
    }

    if (!selectedBranch) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-full mb-4">
            <Building className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect to a Branch</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-8">
            Please select your preferred QXO branch to view local product availability, access your custom pricing, and place material orders.
          </p>
          <button
            onClick={() => setCurrentView('branches')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <MapPin className="h-5 w-5" />
            Find a Branch
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <section className="bg-primary-700 dark:bg-primary-800 rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-start text-white">
            <div>
              <h1 className="text-3xl font-bold">{getGreeting()}, Contractor</h1>
              <p className="mt-2 text-primary-100">
                Connected to: <span className="font-semibold">{selectedBranch?.name || selectedBranch?.branchName || 'Selected Branch'}</span>
              </p>
            </div>
            <button onClick={() => setCurrentView('branches')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-900 rounded-md text-sm font-medium transition">
              <Building className="h-4 w-4" /> Change Branch
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={() => setCurrentView('products')} className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex items-center transition cursor-pointer group text-white">
              <div className="h-10 w-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Browse Products</h3>
                <p className="text-sm opacity-80">Search our catalog</p>
              </div>
            </div>
            <div onClick={() => setCurrentView('branches')} className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex items-center transition cursor-pointer group text-white">
              <div className="h-10 w-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Find Branches</h3>
                <p className="text-sm opacity-80">Locate nearest stores</p>
              </div>
            </div>
            <div onClick={() => setCurrentView('orders')} className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex items-center transition cursor-pointer group text-white">
              <div className="h-10 w-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">View Orders</h3>
                <p className="text-sm opacity-80">Check status and history</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <button onClick={() => setCurrentView('orders')} className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-6">
              {loading.orders ? <p className="text-center py-6 text-gray-500">Loading recent orders...</p> : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-gray-500">Order #{order.orderNumber}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{order.branchCityState}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center py-6 text-gray-500">No recent orders found.</p>}
            </div>
          </section>

          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Selected Branch</h2>
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
                  <Building className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {selectedBranch?.name || selectedBranch?.branchName}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-2">Branch #{selectedBranch?.id || selectedBranch?.branchNumber}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                   <p>{selectedBranch?.address?.address1 || selectedBranch?.address?.addressLine1}</p>
                   {(selectedBranch?.address?.address2 || selectedBranch?.address?.addressLine2) && <p>{selectedBranch?.address?.address2 || selectedBranch?.address?.addressLine2}</p>}
                   <p>{selectedBranch?.address?.city}, {selectedBranch?.address?.state} {selectedBranch?.address?.postalCode}</p>
                </div>
                {selectedBranch?.phone && (
                  <div className="mt-4 flex items-center gap-2 text-primary-600 font-medium">
                    <Phone className="h-4 w-4" />
                    <span>{selectedBranch.phone}</span>
                  </div>
                )}
                <button onClick={() => setCurrentView('branches')} className="mt-6 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                  Change Branch
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h2>
                <button onClick={() => setCurrentView('products')} className="text-primary-600 text-sm font-medium hover:text-primary-700 transition">View all</button>
              </div>
              <div className="p-4">
                {loading.products ? <p className="text-center py-4 text-gray-500">Loading products...</p> : featuredProducts.length > 0 ? (
                   <div className="text-center py-4 text-gray-500">No products available.</div>
                ) : <div className="text-center py-4 text-gray-500">No products available.</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'branches') return <QxoBranchLocator onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'products') return <QxoProductCatalog onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'orders') return <QxoOrderHistory onBack={() => setCurrentView('dashboard')} />;
  
  return renderDashboard();
};

export default QxoSupplyView;
