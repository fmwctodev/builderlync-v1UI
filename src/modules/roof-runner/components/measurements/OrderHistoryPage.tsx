import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Package, Truck, CheckCircle, Clock, Plus } from 'lucide-react';

interface OrderHistoryPageProps {
  onBack: () => void;
  onPlaceNewOrder: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  product: string;
  address: string;
  datePlaced: string;
  delivery: string;
  cost: number;
  status: 'created' | 'in-process' | 'completed' | 'delivered';
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBack, onPlaceNewOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample order data
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      product: 'Full House™',
      address: '123 Main St, Anytown, ST 12345',
      datePlaced: '2024-01-15',
      delivery: 'Regular',
      cost: 105.00,
      status: 'completed'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      product: 'Premium Roof',
      address: '456 Oak Ave, Somewhere, ST 67890',
      datePlaced: '2024-01-12',
      delivery: 'Express',
      cost: 64.50,
      status: 'in-process'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      product: 'Walls, Windows & Doors',
      address: '789 Pine Rd, Elsewhere, ST 54321',
      datePlaced: '2024-01-08',
      delivery: 'Regular',
      cost: 78.00,
      status: 'delivered'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="h-4 w-4" />;
      case 'in-process': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      case 'in-process': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'delivered': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary-600 dark:bg-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 hover:text-white bg-primary-700 hover:bg-primary-800 rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-primary-100">View and track your measurement orders</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by order #, product, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-primary-700 border border-primary-500 rounded-lg text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-200" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
          >
            <option value="all">All Status</option>
            <option value="created">Created</option>
            <option value="in-process">In Process</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
          </select>
          
          <button
            onClick={onPlaceNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-700 dark:text-gray-300">
          Showing {filteredOrders.length} of {orders.length} orders
          {searchQuery && (
            <span className="text-sm font-normal ml-2">
              (filtered by search: "{searchQuery}")
            </span>
          )}
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {filteredOrders.length > 0 ? (
          <>
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-6 gap-4 bg-gray-50 dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 p-4 rounded-t-lg">
              <div>Order #</div>
              <div>Product</div>
              <div>Address</div>
              <div>Date</div>
              <div>Delivery</div>
              <div>Status</div>
            </div>

            {/* Orders */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-6 gap-4 items-center">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {highlightText(order.orderNumber, searchQuery)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {highlightText(order.product, searchQuery)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {highlightText(order.address, searchQuery)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(order.datePlaced).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {order.delivery}
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {highlightText(order.orderNumber, searchQuery)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {highlightText(order.product, searchQuery)}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {highlightText(order.address, searchQuery)}
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(order.datePlaced).toLocaleDateString()}</span>
                      <span>{order.delivery} Delivery</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery 
                ? `No orders match your search for "${searchQuery}"`
                : "You haven't placed any measurement orders yet."
              }
            </p>
            <button
              onClick={onPlaceNewOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Place Your First Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;