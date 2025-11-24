import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Package, Truck, ChevronDown } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';

const ABCSupplyView: React.FC = () => {
  const [currentView, setCurrentView] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('view') || 'dashboard';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('ABC Supply');
  const [recentOrders, setRecentOrders] = useState([
    {
      id: '1',
      orderNumber: 'ABC-2024-001',
      total: 2450.00,
      items: [{ name: 'Roofing Shingles' }, { name: 'Underlayment' }],
      status: 'processing',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      orderNumber: 'ABC-2024-002',
      total: 1875.50,
      items: [{ name: 'Gutters' }],
      status: 'shipped',
      createdAt: '2024-01-12'
    }
  ]);

  const [featuredProducts] = useState([
    { id: '1', name: 'GAF Timberline HD Shingles', manufacturer: 'GAF', sku: 'TL-HD-001' },
    { id: '2', name: 'Owens Corning Duration', manufacturer: 'Owens Corning', sku: 'OC-DUR-002' },
    { id: '3', name: 'CertainTeed Landmark', manufacturer: 'CertainTeed', sku: 'CT-LM-003' },
    { id: '4', name: 'Atlas StormMaster', manufacturer: 'Atlas', sku: 'AT-SM-004' }
  ]);

  const [nearestBranches] = useState([
    {
      id: '1',
      name: 'ABC Supply - Austin North',
      address: { city: 'Austin', state: 'TX' },
      phone: '(512) 555-0123'
    },
    {
      id: '2',
      name: 'ABC Supply - Austin South',
      address: { city: 'Austin', state: 'TX' },
      phone: '(512) 555-0124'
    },
    {
      id: '3',
      name: 'ABC Supply - Round Rock',
      address: { city: 'Round Rock', state: 'TX' },
      phone: '(512) 555-0125'
    }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-primary-600 dark:bg-primary-500 rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Contractor
            </h1>
            <p className="mt-2 text-gray-400">
              Welcome to your ABC Supply Contractor Portal. Here's what's happening with your account today.
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition"
            >
              {selectedSupplier}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <div className="py-1">
                  <button
                    onClick={() => { setSelectedSupplier('ABC Supply'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    ABC Supply
                  </button>
                  <button
                    disabled
                    className="w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed"
                  >
                    SRS
                  </button>
                  <button
                    disabled
                    className="w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed"
                  >
                    QXO
                  </button>
                </div>
              </div>
            )}
          </div>
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
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Order #{order.orderNumber}
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)} - {order.items.length} items
                        </p>
                        <div className="mt-1 flex items-center">
                          {order.status === 'processing' && (
                            <Package className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          {order.status === 'shipped' && (
                            <Truck className="h-4 w-4 text-primary-500 mr-1" />
                          )}
                          {order.status === 'delivered' && (
                            <Truck className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className={`text-sm capitalize ${
                            order.status === 'processing' ? 'text-yellow-600' :
                            order.status === 'shipped' ? 'text-primary-600' :
                            order.status === 'delivered' ? 'text-green-600' :
                            'text-gray-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
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
              <div className="grid grid-cols-1 gap-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-3 overflow-hidden">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {product.manufacturer} - {product.sku}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Nearest Branches */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nearest Branches</h2>
              <button className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="p-4">
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
                        {branch.address.city}, {branch.address.state}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {branch.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  if (currentView === 'products') return <ProductCatalog onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'orders') return <OrderHistory onBack={() => setCurrentView('dashboard')} />;
  return renderDashboard();
};

export default ABCSupplyView;