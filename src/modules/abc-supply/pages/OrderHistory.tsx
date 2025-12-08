import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, DollarSign, Package, Loader2 } from 'lucide-react';
import { abcSupplyApi } from '../services/api';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await abcSupplyApi.getOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-600';
      case 'shipped': return 'bg-blue-600';
      case 'processing': return 'bg-yellow-600';
      case 'pending': return 'bg-gray-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ClipboardList className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Orders</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-gray-400">Your order history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <div className="text-sm text-gray-400">
          {orders.length} orders
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Order #{order.orderNumber}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{order.items.length} items</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div className="flex items-center space-x-1 mt-2 text-lg font-semibold text-white">
                  <DollarSign className="w-5 h-5" />
                  <span>{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{item.name} (SKU: {item.sku})</span>
                    <span className="text-gray-400">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-sm text-gray-400">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>

            {order.deliveryDate && (
              <div className="mt-4 text-sm text-gray-400">
                Expected delivery: {new Date(order.deliveryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;