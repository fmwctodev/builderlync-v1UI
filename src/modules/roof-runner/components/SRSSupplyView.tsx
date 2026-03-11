import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Package, Truck, Building } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';
import { srsApi } from '../services/srsApi';

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
  const initialView = searchParams.get('tab') || 'dashboard';
  const [currentView, setCurrentViewLocal] = useState(initialView);

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
  }, [currentView]); // Re-check when view changes

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [nearestBranches, setNearestBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    products: true,
    branches: true
  });

  useEffect(() => {
    const handleNavigateToProducts = () => {
      setCurrentView('products');
    };

    window.addEventListener('navigateToProducts', handleNavigateToProducts);
    return () => window.removeEventListener('navigateToProducts', handleNavigateToProducts);
  }, []);

  useEffect(() => {
    const loadRecentOrders = async () => {
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
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await srsApi.getItems(1, 4);
        // Handle nested data structure: response.data.data
        const products = response.data?.data || response.data || [];
        // Map to preserve image data
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
  }, []);

  useEffect(() => {
    const loadNearestBranches = async () => {
      try {
        // Try to get user's location for nearest branches
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await srsApi.getBranches(latitude, longitude, 50, 1, 4);
              const branches = response.data?.data || response.data || [];
              setNearestBranches(branches.slice(0, 4));
              setLoading(prev => ({ ...prev, branches: false }));
            },
            async () => {
              // Fallback: get branches without location
              const response = await srsApi.getBranches(undefined, undefined, undefined, 1, 4);
              const branches = response.data?.data || response.data || [];
              setNearestBranches(branches.slice(0, 4));
              setLoading(prev => ({ ...prev, branches: false }));
            }
          );
        } else {
          // Fallback: get branches without location
          const response = await srsApi.getBranches(undefined, undefined, undefined, 1, 4);
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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderDashboard = () => {
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
        {/* Welcome Section */}
        <section className="bg-primary-600 dark:bg-primary-500 rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Contractor
            </h1>
            <p className="mt-2 text-primary-100">
              Connected to: <span className="font-semibold">{selectedBranch?.name || selectedBranch?.branchName || 'Selected Branch'}</span>
            </p>
          </div>
          <button
             onClick={() => setCurrentView('branches')}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm font-medium transition"
          >
            Change Branch
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentView('products')}
            className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 flex items-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition cursor-pointer group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition">Browse Products</h3>
              <p className="text-sm text-primary-600 dark:text-gray-400">Search our catalog</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('branches')}
            className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 flex items-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition cursor-pointer group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition">Find Branches</h3>
              <p className="text-sm text-primary-600 dark:text-gray-400">Locate nearest stores</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('orders')}
            className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 flex items-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition cursor-pointer group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition">View Orders</h3>
              <p className="text-sm text-primary-600 dark:text-gray-400">Check status and history</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Section */}
        <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <button className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="p-6">
            {loading.orders ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">Loading recent orders...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div
                    key={order.orderNumber || index}
                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Order #{order.orderNumber}
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.branchCityState} - {order.productQty} items
                        </p>
                        <div className="mt-1 flex items-center">
                          {order.orderStatus === 'PROCESSING' && (
                            <Package className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          {order.orderStatus === 'SHIPPED' && (
                            <Truck className="h-4 w-4 text-primary-500 mr-1" />
                          )}
                          {order.orderStatus === 'DELIVERED' && (
                            <Truck className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className={`text-sm capitalize ${
                            order.orderStatus === 'PROCESSING' ? 'text-yellow-600' :
                            order.orderStatus === 'SHIPPED' ? 'text-primary-600' :
                            order.orderStatus === 'DELIVERED' ? 'text-green-600' :
                            'text-gray-500'
                          }`}>
                            {order.orderStatus || order.orderType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No recent orders found.</p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products & Nearest Branches */}
        <div className="space-y-6">
          {/* Featured Products */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h2>
              <button className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="p-4">
              {loading.products ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Loading featured products...</p>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {featuredProducts.map((product, key) => (
                    <div
                      key={product.itemNumber || key}
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    >
                      <div className="flex items-center">
                        {(product.productImageUrl || product.productVariants?.[0]?.variantImageURL) ? (
                          <><img 
                            src={product.productImageUrl || product.productVariants?.[0]?.variantImageURL} 
                            alt={product.itemDescription || 'Product image'}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => { 
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          </>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="ml-3 overflow-hidden">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {product.familyName || product.itemDescription || 'Product'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {product.supplierName} - {product.itemNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No featured products available.</p>
                </div>
              )}
            </div>
          </section>

          {/* Nearest Branches */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nearest Branches</h2>
              <button 
                onClick={() => setCurrentView('branches')}
                className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="p-4">
              {loading.branches ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Loading nearest branches...</p>
                </div>
              ) : nearestBranches.length > 0 ? (
                <div className="space-y-3">
                  {nearestBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {branch.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {branch.address?.city}, {branch.address?.state}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {branch.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No branches available.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
  }; // closing brace of renderDashboard

  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} supplier="SRS" />;

  if (!selectedBranch && currentView !== 'dashboard') {
    // If no branch selected, show dashboard which prompts branch selection
    return renderDashboard();
  }

  if (currentView === 'products') return <ProductCatalog onBack={() => setCurrentView('dashboard')} supplier="SRS" />;
  if (currentView === 'orders') return <OrderHistory onBack={() => setCurrentView('dashboard')} supplier="SRS" />;
  return renderDashboard();
};

export default SRSSupplyView;