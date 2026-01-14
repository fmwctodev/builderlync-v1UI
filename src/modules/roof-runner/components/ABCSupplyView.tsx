import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Package, Truck, ChevronDown, AlertCircle, Settings, AlertTriangle } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';
import OrderDetailsModal from './OrderDetailsModal';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { Product, Branch } from '../../abc-supply/types';

const ABCSupplyView: React.FC = () => {
  const [currentView, setCurrentView] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('view') || 'dashboard';
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    products: true,
    branches: true
  });
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
        console.error('Error details:', (error as any).response?.data);
        // Keep existing orders if refresh fails
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    loadRecentOrders();
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await abcSupplyApi.getItems(1, 4);
        // Handle the nested structure: response.items.items
        const products = Array.isArray((response as any).items) ? (response as any).items : (response as any).items?.items || [];
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to load featured products:', error);
        console.error('Error details:', (error as any).response?.data);
        // Keep existing products if refresh fails
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const loadNearestBranches = async () => {
      try {
        const branches = await abcSupplyApi.getBranches();
        setAllBranches(branches); // Store all branches for the dropdown

      } catch (error) {
        console.error('Failed to load nearest branches:', error);
        // Keep existing branches if refresh fails
      } finally {
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



  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="bg-[#D71920] rounded-lg p-6 md:p-8 relative overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Contractor
            </h1>
            <p className="mt-2 text-white/90">
              Welcome to your ABC Supply Contractor Portal. Here's what's happening with your account today.
            </p>
          </div>

          {/* Branch Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A31318] text-white rounded-md hover:bg-[#8F1115] transition-colors border border-[#A31318]"
            >
              <span className="font-medium truncate max-w-[200px]">
                {selectedBranch ? selectedBranch.name : 'Select Branch'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showBranchDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Available Branches</p>
                </div>
                <div className="py-1">
                  {allBranches.length > 0 ? (
                    allBranches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col gap-1 ${selectedBranch?.id === branch.id
                          ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-[#D71920]'
                          : ''
                          }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{branch.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {branch.address?.city}, {branch.address?.state}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No branches found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentView('products')}
            className="bg-white rounded-lg p-4 flex items-center hover:shadow-lg transition cursor-pointer group"
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
            className="bg-white rounded-lg p-4 flex items-center hover:shadow-lg transition cursor-pointer group"
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

      {!selectedBranch ? (
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-0 overflow-hidden shadow-sm">
            <div className="p-4 bg-[#2C3344] bg-opacity-40 border-b border-gray-700/50 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-yellow-500">Select Account and Branch First</h3>
                <p className="text-sm text-yellow-500/80 mt-1">
                  You must select a ship-to account and branch before searching for products. Product availability and pricing vary by branch.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1E293B] flex flex-col md:flex-row gap-6 md:items-center text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>No ABC Supply accounts configured</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Select an account first</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400">Setup Required</h3>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                Select your ship-to account and branch above to enable product browsing and ordering. Product availability and pricing vary by branch location.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <button className="text-[#D71920] flex items-center text-sm font-medium hover:text-red-700 transition">
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
                            {order.orderStatus === 'processing' && (
                              <Package className="h-4 w-4 text-yellow-500 mr-1" />
                            )}
                            {order.orderStatus === 'shipped' && (
                              <Truck className="h-4 w-4 text-[#D71920] mr-1" />
                            )}
                            {order.orderStatus === 'delivered' && (
                              <Truck className="h-4 w-4 text-green-500 mr-1" />
                            )}
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
                  <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-[#D71920] rounded-md hover:bg-red-700">
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
                <button className="text-[#D71920] flex items-center text-sm font-medium hover:text-red-700 transition">
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
      )}
    </div>
  );

  if (currentView === 'products') return <ProductCatalog onBack={() => setCurrentView('dashboard')} supplier="ABC Supply" />;
  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'orders') return <OrderHistory onBack={() => setCurrentView('dashboard')} />;
  return renderDashboard();
};
export default ABCSupplyView;