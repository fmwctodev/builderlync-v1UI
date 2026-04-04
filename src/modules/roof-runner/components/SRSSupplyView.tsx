import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Truck, Building, FileStack } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';
import SRSOrderTemplates from './SRSOrderTemplates';
import { srsApi } from '../services/srsApi';
import { srsService } from '../services/srsService';

interface Product {
  productImageUrl: any;
  productVariants: any;
  itemNumber: string;
  itemDescription: string;
  familyName?: string;
  supplierName?: string;
}

interface Branch {
  id: string;
  name: string;
  address: {
    city: string;
    state: string;
  };
  phone: string;
}

const SRSSupplyView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const initialView = searchParams.get('tab') || 'dashboard';
  const [currentView, setCurrentViewLocal] = useState(initialView);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const setCurrentView = (view: string) => {
    setCurrentViewLocal(view);
    setSearchParams(prev => {
      prev.set('tab', view);
      return prev;
    });
  };

  // Sync state if URL changes externally
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== currentView) {
      setCurrentViewLocal(urlTab);
    }
  }, [searchParams]);

  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  useEffect(() => {
    const loadSelection = () => {
      const savedBranch = localStorage.getItem('srs_selected_branch');
      if (savedBranch) {
        try {
          setSelectedBranch(JSON.parse(savedBranch));
        } catch (e) { console.error(e); }
      } else {
        setSelectedBranch(null);
      }
    };
    loadSelection();
    
    // Listen for changes from BranchLocator
    window.addEventListener('storage', loadSelection);
    return () => window.removeEventListener('storage', loadSelection);
  }, [currentView]);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [nearestBranches, setNearestBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    products: true,
    branches: true
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await srsService.validateConnection();
        setIsConnected(connected);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };
    checkConnection();

    const handleNavigateToProducts = () => {
      setCurrentView('products');
    };

    window.addEventListener('navigateToProducts', handleNavigateToProducts);
    return () => window.removeEventListener('navigateToProducts', handleNavigateToProducts);
  }, []);

  useEffect(() => {
    const loadRecentOrders = async () => {
      if (!isConnected) return;
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endDate = tomorrow.toISOString().split('T')[0];
        
        const response = await srsApi.getOrdersHistory({
          startDate: '2024-03-15',
          endDate: endDate,
          itemsPerPage: 20,
          pageNumber: 1
        });
        
        if (response.success) {
          const orders = response.data?.items || [];
          setRecentOrders(orders.slice(0, 10));
        } else {
          setRecentOrders([]);
        }
      } catch (error) {
        console.error('Failed to load recent orders:', error);
        setRecentOrders([]);
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    loadRecentOrders();
  }, [isConnected]);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      if (!isConnected) return;
      try {
        const response = await srsApi.getItems(1, 4);
        const products = response.data?.data || response.data || [];
        const mappedProducts = products.map((product: any) => ({
          itemNumber: product.productVariants?.[0]?.variantCode || product.productId?.toString() || product.itemNumber,
          itemDescription: product.productName || product.itemDescription,
          familyName: product.productCategory || product.familyName,
          supplierName: product.manufacturer || product.supplierName,
          productImageUrl: product.productImageUrl,
          productVariants: product.productVariants
        }));
        setFeaturedProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to load featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    loadFeaturedProducts();
  }, [isConnected]);

  useEffect(() => {
    const loadNearestBranches = async () => {
      if (!isConnected) return;
      try {
        const savedLocation = localStorage.getItem('srs_shipping_location');
        let lat, lng;

        if (savedLocation) {
          const parsed = JSON.parse(savedLocation);
          lat = parsed.lat;
          lng = parsed.lng;
        }

        if (lat && lng) {
          const response = await srsApi.getBranches(lat, lng, 50);
          const branches = response.data?.data || response.data || [];
          setNearestBranches(branches.slice(0, 4));
          setLoading(prev => ({ ...prev, branches: false }));
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await srsApi.getBranches(latitude, longitude, 50);
              const branches = response.data?.data || response.data || [];
              setNearestBranches(branches.slice(0, 4));
              setLoading(prev => ({ ...prev, branches: false }));
            },
            async () => {
               const response = await srsApi.getBranches();
               const branches = response.data?.data || response.data || [];
              setNearestBranches(branches.slice(0, 4));
              setLoading(prev => ({ ...prev, branches: false }));
            }
          );
         } else {
           const response = await srsApi.getBranches();
           const branches = response.data?.data || response.data || [];
          setNearestBranches(branches.slice(0, 4));
          setLoading(prev => ({ ...prev, branches: false }));
        }
      } catch (error) {
        console.error('Failed to load nearest branches:', error);
        setNearestBranches([]);
        setLoading(prev => ({ ...prev, branches: false }));
      }
    };
    loadNearestBranches();
  }, [isConnected]);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SRS Account Not Connected</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-8">
            Please connect your SRS Distribution account in settings to access custom pricing, inventory, and material ordering.
          </p>
          <button
            onClick={() => navigate(`/org/${orgSlug}/settings/integrations`)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Connect SRS Distribution
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
            Please select your preferred SRS Distribution branch to view local product availability, access your custom pricing, and place material orders.
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
        <section className="bg-primary-600 dark:bg-primary-500 rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-start text-white">
            <div>
              <h1 className="text-3xl font-bold">{getGreeting()}, Contractor</h1>
              <div className="mt-2 space-y-1">
                <p className="text-primary-100 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Connected to: <span className="font-semibold">{selectedBranch?.name || selectedBranch?.branchName || 'Selected Branch'}</span>
                </p>
                {localStorage.getItem('srs_shipping_location') && (
                  <p className="text-primary-200 text-sm flex items-center gap-2 italic">
                    <MapPin className="h-3 w-3" />
                    Job Site: {JSON.parse(localStorage.getItem('srs_shipping_location')!).address}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setCurrentView('branches')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded-md text-sm font-medium transition shadow-sm border border-primary-500/30">
              Change Location / Branch
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
            <div onClick={() => setCurrentView('templates')} className="bg-white/10 hover:bg-white/20 rounded-lg p-4 flex items-center transition cursor-pointer group text-white">
              <div className="h-10 w-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
                <FileStack className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Order Templates</h3>
                <p className="text-sm opacity-80">Use saved templates</p>
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
                    <div key={order.orderNumber || index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-gray-500">Order #{order.orderNumber}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{order.branchCityState} - {order.productQty} items</p>
                          <div className="mt-1 flex items-center text-sm">
                            <Truck className="h-4 w-4 mr-1 text-primary-500" />
                            <span className="capitalize">{order.orderStatus || 'Processing'}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">{order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : 'Pending'}</div>
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h2>
                <button onClick={() => setCurrentView('products')} className="text-primary-600 text-sm font-medium hover:text-primary-700 transition">View all</button>
              </div>
              <div className="p-4">
                {loading.products ? <p className="text-center py-4 text-gray-500">Loading products...</p> : featuredProducts.length > 0 ? (
                  <div className="space-y-3">
                    {featuredProducts.map((product, idx) => (
                      <div key={product.itemNumber || idx} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">{product.itemDescription}</h4>
                          <p className="text-xs text-gray-500 truncate">{product.supplierName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-4 text-gray-500">No products available.</p>}
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nearest Branches</h2>
              </div>
              <div className="p-4">
                {loading.branches ? <p className="text-center py-4 text-gray-500">Loading branches...</p> : nearestBranches.length > 0 ? (
                  <div className="space-y-3">
                    {nearestBranches.map((branch) => (
                      <div key={branch.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{branch.name}</h4>
                        <p className="text-xs text-gray-500">{branch.address?.city}, {branch.address?.state}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-4 text-gray-500">No branches found.</p>}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} supplier="SRS" />;
  if (currentView === 'products') return (isConnected && selectedBranch) ? <ProductCatalog onBack={() => setCurrentView('dashboard')} supplier="SRS" branchId={selectedBranch?.id} /> : renderDashboard();
  if (currentView === 'orders') return (isConnected && selectedBranch) ? <OrderHistory onBack={() => setCurrentView('dashboard')} supplier="SRS" branchId={selectedBranch?.id} /> : renderDashboard();
  if (currentView === 'templates') return (isConnected) ? <SRSOrderTemplates onBack={() => setCurrentView('dashboard')} branchId={selectedBranch?.id} /> : renderDashboard();
  
  return renderDashboard();
};

export default SRSSupplyView;
