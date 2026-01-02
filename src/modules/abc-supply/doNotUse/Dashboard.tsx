import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, ClipboardList, ChevronRight, Package, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { abcSupplyApi } from '../services/api';
import { Product, Branch, Order } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [nearestBranches, setNearestBranches] = useState<Branch[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load featured products
        const productsResponse = await abcSupplyApi.getItems(1, 4);
        setFeaturedProducts(productsResponse.items || []);
        
        // Load nearest branches
        const branches = await abcSupplyApi.getBranches();
        setNearestBranches(branches.slice(0, 3));
        
        // Load recent orders
        const orders = await abcSupplyApi.getOrders();
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 3) : []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-gray-800 rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white">
          {getGreeting()}, {user?.firstName || 'Contractor'}
        </h1>
        <p className="mt-2 text-gray-400">
          Welcome to your ABC Supply Contractor Portal. Here's what's happening with your account today.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/abc-supply/products"
            className="bg-gray-700 rounded-lg p-4 flex items-center hover:bg-gray-600 transition group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition">Browse Products</h3>
              <p className="text-sm text-gray-400">Search our catalog</p>
            </div>
          </Link>

          <Link
            to="/abc-supply/branches"
            className="bg-gray-700 rounded-lg p-4 flex items-center hover:bg-gray-600 transition group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-green-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white group-hover:text-green-400 transition">Find Branches</h3>
              <p className="text-sm text-gray-400">Locate nearest stores</p>
            </div>
          </Link>

          <Link
            to="/abc-supply/orders"
            className="bg-gray-700 rounded-lg p-4 flex items-center hover:bg-gray-600 transition group"
          >
            <div className="h-10 w-10 flex-shrink-0 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition">View Orders</h3>
              <p className="text-sm text-gray-400">Check status and history</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Section */}
        <section className="lg:col-span-2 bg-gray-800 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            <Link to="/abc-supply/orders" className="text-blue-400 flex items-center text-sm font-medium hover:text-primary-300 transition">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm text-gray-400">Order #{order.orderNumber}</span>
                        <p className="font-medium text-white">${order.total.toFixed(2)} - {order.items.length} items</p>
                        <div className="mt-1 flex items-center">
                          {order.status === 'processing' && <Package className="h-4 w-4 text-yellow-500 mr-1" />}
                          {order.status === 'shipped' && <Truck className="h-4 w-4 text-blue-500 mr-1" />}
                          {order.status === 'delivered' && <Truck className="h-4 w-4 text-green-500 mr-1" />}
                          <span className="text-sm capitalize text-gray-300">{order.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No recent orders found.</p>
                <Link to="/abc-supply/products">
                  <button className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                    Start Shopping
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products & Nearest Branches */}
        <div className="space-y-6">
          {/* Featured Products */}
          <section className="bg-gray-800 rounded-lg">
            <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Featured Products</h2>
              <Link to="/abc-supply/products" className="text-blue-400 flex items-center text-sm font-medium hover:text-primary-300 transition">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="p-4">
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {featuredProducts.map((product, index) => (
                    <div key={index} className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <h4 className="font-medium text-white truncate">
                            {product.familyName || 'Product'}
                          </h4>
                          <p className="text-sm text-gray-400 truncate">
                            {product.supplierName} - {product.itemNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Loading featured products...</p>
                </div>
              )}
            </div>
          </section>

          {/* Nearest Branches */}
          <section className="bg-gray-800 rounded-lg">
            <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Nearest Branches</h2>
              <Link to="/abc-supply/branches" className="text-blue-400 flex items-center text-sm font-medium hover:text-primary-300 transition">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="p-4">
              {nearestBranches.length > 0 ? (
                <div className="space-y-3">
                  {nearestBranches.map((branch) => (
                    <div key={branch.id} className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                      <div>
                        <h4 className="font-medium text-white">{branch.name}</h4>
                        <p className="text-sm text-gray-400">{branch.address?.city}, {branch.address?.state}</p>
                        <p className="text-sm text-gray-400 mt-1">{branch.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Loading nearest branches...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;