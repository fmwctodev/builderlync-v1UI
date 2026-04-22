import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronRight, Search, Filter } from 'lucide-react';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import { OrderHistoryItem } from '../../abc-supply/types';
import OrderDetailsModal from './OrderDetailsModal';

interface OrderHistoryProps {
  onBack: () => void;
  supplier?: string;
  branchId?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack, supplier = 'ABC Supply', branchId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Pagination & Filter State
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadOrders = async (pageNum: number) => {
    try {
      setLoading(true);

      const params = {
        startDate,
        endDate,
        itemsPerPage,
        pageNumber: pageNum,
        search: searchQuery,
        branchId: branchId // also pass branchId if we want to filter history by branch
      };

      let response;
      if (supplier === 'SRS') {
        response = await srsApi.getOrdersHistory(params);
      } else {
        response = await abcSupplyApi.getOrdersHistory(params);
      }

      console.log("orders response:", response);

      if (response) {
        // Handle different response structures gracefully
        const responseData = response as any;
        
        // Match the backend ResponseHandler.success(res, { data, total }) format
        const items = responseData.orders ||
          responseData.items ||
          (responseData.data && Array.isArray(responseData.data) ? responseData.data : 
           (responseData.data && (responseData.data.data || responseData.data.items || responseData.data.orders))) ||
          [];
          
        setOrders(items);

        const total = responseData.total ||
          (responseData.pagination ? responseData.pagination.totalItems : 0) ||
          (responseData.data && responseData.data.total) ||
          (responseData.data && responseData.data.pagination ? responseData.data.pagination.totalItems : 0) ||
          items.length;
          
        setTotalOrders(total);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    loadOrders(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalOrders / itemsPerPage)) {
      setPage(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'shipped': return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400';
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'created': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      // Webhook statuses
      case 'updated': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'in_transit': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'arrived': return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400';
      case 'invoiced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />; // Delivery completed
      // Webhook statuses
      case 'updated': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'arrived': return <Truck className="h-4 w-4" />;
      case 'invoiced': return <Package className="h-4 w-4" />;
      case 'cancelled': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <button
          onClick={onBack}
          className="text-white hover:text-white text-sm mb-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{supplier} Order History</h1>
            <p className="mt-2 text-gray-400">View and track your orders</p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-end gap-2 bg-primary-800/50 p-2 rounded-lg">
            <div className="flex flex-col">
              <label className="text-xs text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-primary-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-primary-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-300 mb-1">Search (Opt)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Order #"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-primary-800 text-white border border-gray-600 rounded pl-2 pr-8 py-1 text-sm w-32 focus:outline-none focus:border-primary-400"
                />
                <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleApplyFilter}
              className="px-3 py-1.5 bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium rounded transition-colors flex items-center gap-1 h-[34px]"
            >
              <Filter size={14} /> Apply
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading orders...</span>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <div
                  key={order.orderNumber || (order as any).id}
                  className="p-6 hover:bg-primary-50 dark:hover:bg-primary-700 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order #{order.orderNumber || (order as any).id}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus || (order as any).status)}`}>
                          {getStatusIcon(order.orderStatus || (order as any).status)}
                          <span>{order.orderStatus || (order as any).status || 'Unknown'}</span>
                        </div>
                      </div>

                      {/* SRS Specific Technical IDs */}
                      {supplier === 'SRS' && (order as any).srs_response && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                          <div className="text-[10px] font-bold">
                            <span className="text-gray-400 uppercase tracking-widest mr-1.5">TX ID:</span>
                            <span className="text-primary-600 dark:text-primary-400 font-mono text-[12px] tracking-tight">
                              {(order as any).srs_response.transactionID || (order as any).transaction_id}
                            </span>
                          </div>
                          {(order as any).srs_response.orderID && (
                            <div className="text-[10px] font-bold">
                              <span className="text-gray-400 uppercase tracking-widest mr-1.5">SRS ID:</span>
                              <span className="text-gray-700 dark:text-gray-300 font-mono text-[12px] tracking-tight">
                                {(order as any).srs_response.orderID}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {supplier !== 'SRS' && ((order as any).confirmationNumber || (order as any).confirmationId) && (
                        <div className="text-sm text-gray-500 mb-2">
                          Confirmation #: <span className="text-gray-700 dark:text-gray-300">{(order as any).confirmationNumber || (order as any).confirmationId}</span>
                        </div>
                      )}

                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch {order.branch || (order as any).branch_code || (order as any).branchNumber}
                        {order.productQty ? ` - ${order.productQty} items` : 
                         (order as any).order_line_items ? ` - ${(order as any).order_line_items.length} items` :
                         (order as any).lines ? ` - ${(order as any).lines.length} items` : ''}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Date:</span> {
                            (order.invoiceDate || (order as any).created_at || (order as any).transactionDate) 
                              ? new Date(order.invoiceDate || (order as any).created_at || (order as any).transactionDate).toLocaleDateString()
                              : '---'
                          }
                        </div>
                        {supplier !== 'SRS' && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Order Type:</span> {order.orderType || (order as any).order_type || (order as any).orderType || 'Standard'}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Total:</span> ${
                            (order.totalAmount || (order as any).total_amount || (order as any).total_price || (order as any).totalAmount || (order as any).subtotal || 0).toFixed(2)
                          }
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center ml-4">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 rotate-180" /> {/* Reusing ChevronRight rotated for Prev to avoid import if lazy */}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || startDate ? 'No orders found matching your criteria.' : 'No orders found'}
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          supplier={supplier}
        />
      )}
    </div>
  );
};

export default OrderHistory;