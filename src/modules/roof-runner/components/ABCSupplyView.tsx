import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Package, Truck, ChevronDown, AlertCircle, Settings, AlertTriangle, ArrowRight, Building } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';
import OrderDetailsModal from './OrderDetailsModal';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { Product, Branch, ShipTo } from '../../abc-supply/types';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const ABCSupplyView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('tab') || searchParams.get('view') || 'dashboard';
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
    const urlTab = searchParams.get('tab') || searchParams.get('view');
    if (urlTab && urlTab !== currentView) {
      setCurrentViewLocal(urlTab);
    }
  }, [searchParams]);

  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    products: true,
    connection: true
  });
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [selectedShipTo, setSelectedShipTo] = useState<ShipTo | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = async () => {
      try {
        const status = await abcSupplyApi.getStatus();
        setIsConnected(status.connected);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setLoading(prev => ({ ...prev, connection: false }));
      }
    };
    checkConnection();

    // Load selected branch and account from local storage
    loadSelection();
  }, []);

  const loadSelection = () => {
    const savedBranch = localStorage.getItem('abc_selected_branch');
    const savedShipTo = localStorage.getItem('abc_selected_shipto');

    if (savedBranch) {
      try {
        setSelectedBranch(JSON.parse(savedBranch));
      } catch (e) { console.error(e); }
    } else {
      setSelectedBranch(null);
    }

    if (savedShipTo) {
      try {
        setSelectedShipTo(JSON.parse(savedShipTo));
      } catch (e) { console.error(e); }
    } else {
      setSelectedShipTo(null);
    }
  };

  // Reload selected branch when view changes to dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      loadSelection();
    }
  }, [currentView]);

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endDate = tomorrow.toISOString().split('T')[0];

        const response = await abcSupplyApi.getOrdersHistory({
          startDate: '2024-03-15',
          endDate: endDate,
          itemsPerPage: 20,
          pageNumber: 1
        });

        if (response.success) {
          const orders = response.data.items || [];
          setRecentOrders(orders.slice(0, 10));
        } else {
          setRecentOrders([]);
        }
      } catch (error) {
        console.error('Failed to load recent orders:', error);
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    if (isConnected) {
      loadRecentOrders();
    } else {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, [isConnected]);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // If branch selected, try to get products available at that branch via search filter
        let products = [];
        if (selectedBranch && selectedBranch.number) {
          // Use filterItems with empty query to get branch availability
          // Note: If empty query not supported well, this might return empty.
          // Using a generic term or wildcard might be needed. 
          // For featured, we might just want to show *something*.
          // Assume searching for "shingle" or similar generic term, or just getItems if no robust branch filter for "all"
          // Actually, best to just use getItems for featured if search isn't robust for "all"
          // But user said: "Search Items... across all branches... misleadingly select items not available".
          // So we really should filter.
          // Let's try searching for "s" (very broad) or just use getItems and hope for best if no search term specific.
          // Actually, ProductCatalog logic (calling filterItems with '') is what we should mirror.
          const response = await abcSupplyApi.filterItems([''], 4, 1, selectedBranch.number);
          products = Array.isArray(response) ? response : [];
        } else {
          const response = await abcSupplyApi.getItems(1, 4);
          products = Array.isArray((response as any).items) ? (response as any).items : (response as any).items?.items || [];
        }
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    if (isConnected) {
      loadFeaturedProducts();
    } else {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, [isConnected, selectedBranch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="bg-[#D71920] rounded-lg p-6 md:p-8 relative overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Contractor
            </h1>
            <p className="mt-2 text-white/90">
              Welcome to your ABC Supply Contractor Portal.
            </p>
          </div>

          {/* Branch Selector Button */}
          <div className="relative flex flex-col items-end gap-2">
            <button
              onClick={() => setCurrentView('branches')}
              className="flex items-center gap-2 px-4 py-2 bg-[#A31318] text-white rounded-md hover:bg-[#8F1115] transition-colors border border-[#A31318]"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs text-red-200 uppercase font-bold tracking-wider">
                  {selectedBranch ? 'Selected Branch' : 'Select Account & Branch'}
                </span>
                <span className="font-medium truncate max-w-[200px]">
                  {selectedBranch ? selectedBranch.name : 'Find a Location'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
            {selectedShipTo && (
              <div className="text-xs text-red-100 flex items-center gap-1">
                <Building className="h-3 w-3" />
                Account: {selectedShipTo.name} ({selectedShipTo.number})
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentView('products')}
            className={`bg-white rounded-lg p-4 flex items-center hover:shadow-lg transition cursor-pointer group ${!selectedBranch || !isConnected ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="h-12 w-12 flex-shrink-0 bg-red-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-[#D71920]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D71920] transition">Browse Products</h3>
              <p className="text-sm text-[#D71920]">Search our catalog</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('branches')}
            className="bg-white rounded-lg p-4 flex items-center hover:shadow-lg transition cursor-pointer group"
          >
            <div className="h-12 w-12 flex-shrink-0 bg-red-50 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[#D71920]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D71920] transition">Find Branches</h3>
              <p className="text-sm text-[#D71920]">Locate nearest stores</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('orders')}
            className={`bg-white rounded-lg p-4 flex items-center hover:shadow-lg transition cursor-pointer group ${!isConnected ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="h-12 w-12 flex-shrink-0 bg-red-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-[#D71920]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D71920] transition">View Orders</h3>
              <p className="text-sm text-[#D71920]">Check status and history</p>
            </div>
          </div>
        </div>
      </section>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Connection & Branch Warnings */}
      {(!isConnected || !selectedBranch) && !loading.connection && (
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-0 overflow-hidden shadow-sm">
            <div className="p-4 bg-[#2C3344] bg-opacity-40 border-b border-gray-700/50 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-yellow-500">
                  {!isConnected ? 'Connect Your ABC Supply Account' : 'Select Account & Branch'}
                </h3>
                <p className="text-sm text-yellow-500/80 mt-1">
                  {!isConnected
                    ? 'To access products, pricing, and place orders, you must first connect your ABC Supply account.'
                    : 'Please select your Ship-To Account and Branch to view products and pricing available to you.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1E293B] flex flex-col md:flex-row gap-6 md:items-center text-sm text-gray-400">
              {!isConnected ? (
                <div className="flex items-center gap-2 text-red-400">
                  <Settings className="h-4 w-4" />
                  <span>No ABC Supply accounts configured</span>
                  <a href={`/org/${orgSlug}/settings/integrations`} className="text-blue-400 hover:text-blue-300 ml-2 flex items-center gap-1">
                    Go to Settings <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-400">
                  <MapPin className="h-4 w-4" />
                  <span>Account/Branch not selected</span>
                  <button onClick={() => setCurrentView('branches')} className="text-blue-400 hover:text-blue-300 ml-2 flex items-center gap-1">
                    Select Now <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isConnected && selectedBranch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <button onClick={() => setCurrentView('orders')} className="text-[#D71920] flex items-center text-sm font-medium hover:text-red-700 transition">
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
                      onClick={() => setSelectedOrder(order)}
                      className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer border-l-4 border-transparent hover:border-[#D71920]"
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
                            <span className={`text-sm capitalize ${order.orderStatus === 'processing' ? 'text-yellow-600' :
                              order.orderStatus === 'shipped' ? 'text-red-600' :
                                order.orderStatus === 'delivered' ? 'text-green-600' :
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
                  <p className="text-gray-500 dark:text-gray-400">No recent orders found for this branch.</p>
                  <button onClick={() => setCurrentView('products')} className="mt-3 px-4 py-2 text-sm font-medium text-white bg-[#D71920] rounded-md hover:bg-red-700">
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h2>
                <button onClick={() => setCurrentView('products')} className="text-[#D71920] flex items-center text-sm font-medium hover:text-red-700 transition">
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
                        className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer border-l-2 border-transparent hover:border-[#D71920]"
                      >
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-500">
                            <ShoppingBag className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                          </div>
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
          </div>
        </div>
      ) : null}
    </div>
  );

  if (currentView === 'products') return <ProductCatalog onBack={() => setCurrentView('dashboard')} supplier="ABC Supply" branchId={selectedBranch?.number} />;
  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'orders') return <OrderHistory onBack={() => setCurrentView('dashboard')} />;
  return renderDashboard();
};
export default ABCSupplyView;