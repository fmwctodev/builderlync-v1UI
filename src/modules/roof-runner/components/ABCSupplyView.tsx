import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MapPin,
  ClipboardList,
  ChevronRight,
  Package,
  Truck,
  ChevronDown,
  Building2,
  ShoppingCart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import BranchLocator from './BranchLocator';
import OrderHistory from './OrderHistory';
import { ABCSupplyProvider, useABCSupply } from '../context/ABCSupplyContext';
import { AccountBranchHeader, ABCSupplyCart, ABCSupplyCheckout, OrderDetailsModal } from './abc-supply';
import { ABCSupplyOrder, fetchRecentOrders } from '../services/abcSupplyApi';

type ViewType = 'dashboard' | 'products' | 'branches' | 'orders' | 'cart' | 'checkout' | 'confirmation';

interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
}

const ABCSupplyViewContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get('view') as ViewType) || 'dashboard';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('ABC Supply');
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  const {
    selectedAccount,
    selectedBranch,
    cartItemCount,
    cartSubtotal,
  } = useABCSupply();

  const [recentOrders, setRecentOrders] = useState<ABCSupplyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ABCSupplyOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const orders = await fetchRecentOrders('', 3);
      setRecentOrders(orders);
    };
    loadOrders();
  }, []);

  const handleOrderClick = (order: ABCSupplyOrder) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

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

  const handleOrderPlaced = (orderId: string, orderNumber: string) => {
    setOrderConfirmation({ orderId, orderNumber });
    setCurrentView('confirmation');
  };

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="bg-green-600 rounded-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h1>
        <p className="text-white/80">Your order has been submitted to ABC Supply</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400 mb-2">Order Number</p>
        <p className="text-2xl font-bold text-white">{orderConfirmation?.orderNumber}</p>
        <p className="text-sm text-gray-400 mt-4">
          You will receive an email confirmation shortly. Track your order in the Order History section.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentView('orders')}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          View Order History
        </button>
        <button
          onClick={() => setCurrentView('products')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <section className="bg-primary-600 dark:bg-primary-500 rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, Contractor
            </h1>
            <p className="mt-2 text-gray-200">
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {cartItemCount > 0 && (
            <div
              onClick={() => setCurrentView('cart')}
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center hover:bg-green-100 dark:hover:bg-green-900/30 transition cursor-pointer group border-2 border-green-500/30"
            >
              <div className="h-10 w-10 flex-shrink-0 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center relative">
                <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-white text-xs flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-green-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition">View Cart</h3>
                <p className="text-sm text-green-600 dark:text-gray-400">${cartSubtotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <AccountBranchHeader
        onViewCart={() => setCurrentView('cart')}
        showCartSummary={false}
      />

      {(!selectedAccount || !selectedBranch) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">Setup Required</p>
            <p className="text-xs text-amber-400/80 mt-1">
              Select your ship-to account and branch above to enable product browsing and ordering.
              Product availability and pricing vary by branch location.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <button
              onClick={() => setCurrentView('orders')}
              className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Order #{order.orderNumber}
                          </span>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            order.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {order.status === 'processing' && <Package className="h-3 w-3" />}
                            {order.status === 'shipped' && <Truck className="h-3 w-3" />}
                            {order.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                        <p className="font-medium text-primary-600 dark:text-primary-400">
                          ${order.total.toFixed(2)} - {order.items.length} items
                        </p>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="font-medium mb-1">Items:</div>
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="ml-2">
                              {'\u2022'} {item.description} (Qty: {item.quantity})
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="ml-2 text-gray-500">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <div>Ordered: {new Date(order.createdAt).toLocaleDateString()}</div>
                          {order.status !== 'delivered' && order.estimatedDeliveryDate && (
                            <div>Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No recent orders found.</p>
                <button
                  onClick={() => setCurrentView('products')}
                  className="mt-3 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
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
              <button
                onClick={() => setCurrentView('products')}
                className="text-primary-600 flex items-center text-sm font-medium hover:text-primary-700 transition"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setCurrentView('products')}
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

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );

  if (currentView === 'products') {
    return (
      <ProductCatalog
        onBack={() => setCurrentView('dashboard')}
        onViewCart={() => setCurrentView('cart')}
      />
    );
  }
  if (currentView === 'branches') return <BranchLocator onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'orders') return <OrderHistory onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'cart') {
    return (
      <ABCSupplyCart
        onBack={() => setCurrentView('products')}
        onCheckout={() => setCurrentView('checkout')}
      />
    );
  }
  if (currentView === 'checkout') {
    return (
      <ABCSupplyCheckout
        onBack={() => setCurrentView('cart')}
        onOrderPlaced={handleOrderPlaced}
      />
    );
  }
  if (currentView === 'confirmation') {
    return renderConfirmation();
  }
  return renderDashboard();
};

const ABCSupplyView: React.FC = () => {
  return (
    <ABCSupplyProvider>
      <ABCSupplyViewContent />
    </ABCSupplyProvider>
  );
};

export default ABCSupplyView;
