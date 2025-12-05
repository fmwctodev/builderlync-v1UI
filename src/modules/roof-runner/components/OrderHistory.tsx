import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronRight, Search, Filter } from 'lucide-react';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { Order } from '../../abc-supply/types';

interface OrderHistoryProps {
  onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await abcSupplyApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'shipped': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    searchQuery === '' ||
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6">
        <button 
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 text-sm mb-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <p className="mt-2 text-gray-400">View and track your orders</p>
        
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading orders...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Order #{order.orderNumber}
                      </span>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      ${order.total.toFixed(2)} - {order.items.length} items
                    </p>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="font-medium mb-1">Items:</div>
                      {order.items.map((item, index) => (
                        <div key={index} className="ml-2">
                          • {item.name} (Qty: {item.quantity})
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>Ordered: {new Date(order.createdAt).toLocaleDateString()}</div>
                      {order.status !== 'delivered' && (
                        <div>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'No orders found matching your search.' : 'No orders found'}
            </p>
            <button 
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;