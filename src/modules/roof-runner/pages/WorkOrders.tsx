import { useState, useEffect } from 'react';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { OrderHistoryResponse, OrderHistoryItem } from '../../abc-supply/types';

function OrderDetailsModal({ order, isOpen, onClose }: { order: OrderHistoryItem | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in progress':
      case 'processing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Number</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.orderNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">Branch {order.branch}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.branchCityState}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Type</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.orderType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Quantity</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.productQty}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrders() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    itemsPerPage: 20,
    pageNumber: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [startDate, setStartDate] = useState('2024-03-15');
  const [endDate, setEndDate] = useState('2026-06-15');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const statusOptions = ['all', 'pending', 'created', 'in progress', 'delivered', 'complete', 'processed', 'pickup requested', 'pickup completed'];

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status === 'all' ? '' : status);
    setIsStatusOpen(false);
  };

  const handleViewOrder = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: OrderHistoryResponse = await abcSupplyApi.getOrdersHistory({
        startDate,
        endDate,
        itemsPerPage: pagination.itemsPerPage,
        pageNumber: pagination.pageNumber,
        search: searchQuery || undefined,
        status: selectedStatus || undefined
      });

      if (response.success) {
        setOrders(response.data.items);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, pagination.pageNumber, searchQuery, selectedStatus]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Purchase Orders (P.O.)
      </h1>
      
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by P.O. number, vendor, job, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[100px] text-left"
          >
            {selectedStatus || 'All'}
          </button>

          {isStatusOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>


      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-2"></div>
                    Loading orders...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-red-500 dark:text-red-400">
                  <div className="flex items-center justify-center">
                    <div className="text-red-500 mr-2">⚠️</div>
                    {error}
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No orders found for the selected date range.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.orderNumber} order={order} onViewOrder={handleViewOrder} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.pageNumber - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.pageNumber * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
              disabled={pagination.pageNumber <= 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.pageNumber} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
              disabled={pagination.pageNumber >= pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

function OrderRow({ order, onViewOrder }: { order: OrderHistoryItem, onViewOrder: (order: OrderHistoryItem) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in progress':
      case 'processing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get shipping location from ship_to data
  const getShippingLocation = () => {
    try {
      if (order.ship_to) {
        const shippingAddress = JSON.parse(order.ship_to);
        return `${shippingAddress.address.city}, ${shippingAddress.address.state}`;
      }
    } catch (e) {
      console.error('Error parsing shipping address:', e);
    }
    return order.branchCityState || 'Unknown';
  };

  return (
    <tr>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.orderNumber}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Branch {order.branch}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{getShippingLocation()}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.orderType}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.productQty}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewOrder(order)}
            className="text-primary-600 hover:text-blue-900 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View
          </button>
          {/* <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ⋯
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">Download</button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">Delete</button>
              </div>
            )}
          </div> */}
        </div>
      </td>
    </tr>
  );
}
