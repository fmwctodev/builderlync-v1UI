import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, DollarSign, Package, Loader2, X, AlertTriangle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { abcSupplyApi } from '../services/api';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Filter & Pagination State
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await abcSupplyApi.getOrdersHistory({
        startDate,
        endDate,
        itemsPerPage,
        pageNumber: pageNum
      });

      const responseData = response as any;
      setOrders(responseData.orders || []);
      // Attempt to extract total from various common pagination locations
      const total = responseData.total || (responseData.pagination ? responseData.pagination.totalItems : 0) || (responseData.orders ? responseData.orders.length : 0);
      setTotalOrders(total);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApplyFilter = () => {
    if (page === 1) {
      fetchOrders(1);
    } else {
      setPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalOrders / itemsPerPage)) {
      setPage(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-600';
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'complete':
        return 'bg-green-600';
      case 'shipped': return 'bg-blue-600';
      case 'processing':
      case 'open':
        return 'bg-yellow-600';
      case 'pending': return 'bg-gray-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleOrderClick = async (order: any) => {
    setSelectedOrder(order); // Show initial data

    try {
      // Attempt to fetch full details
      // The API expects confirmationNumber. We'll try confirmationNumber (preferred), then orderId/id.
      const confirmationNumber = order.confirmationNumber || order.confirmationId || order.id || order.orderId || order.orderNumber;

      if (confirmationNumber) {
        const details = await abcSupplyApi.getOrderDetails(confirmationNumber);
        console.log("Fetched order details:", details);

        if (details) {
          if (details.errorMessage) {
            // If the API returns an error message (like "not processed by ERP"),
            // attach it to the order object so the modal can display it.
            // We preserve the existing list data.
            setSelectedOrder((prev: any) => ({
              ...prev,
              processingStatus: details.errorMessage
            }));
          } else {
            // Update state with full detailed data. 
            setSelectedOrder((prev: any) => ({ ...prev, ...details }));
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch order details", e);
    }
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <div className="text-sm text-gray-400 mt-1">
            {totalOrders} orders found
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-end gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 text-white border-none rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 text-white border-none rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Orders</h3>
          <p className="text-gray-400">{error}</p>
          <button onClick={() => fetchOrders(page)} className="mt-4 text-blue-400 hover:text-blue-300 underline">Try Again</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
          <p className="text-gray-400">Try adjusting your date filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.orderId || order.id || Math.random()}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Order #{order.orderNumber || order.id}</h3>
                    {(order.confirmationNumber || order.confirmationId) && (
                      <div className="text-sm text-gray-400 mt-1">
                        Confirmation #: <span className="text-gray-300">{order.confirmationNumber || order.confirmationId}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</span>
                      </div>
                      {order.lines && (
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>{order.lines.length} items</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                      {(order.status || 'Unknown').charAt(0).toUpperCase() + (order.status || 'Unknown').slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 mt-2 text-lg font-semibold text-white">
                      <DollarSign className="w-5 h-5" />
                      <span>{Number(order.totalAmount || order.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Items Preview:</h4>
                  <div className="space-y-2">
                    {order.lines && order.lines.slice(0, 3).map((line: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{line.itemDescription}</span>
                        <span className="text-gray-400">Qty: {line.orderedQty?.value || 0}</span>
                      </div>
                    ))}
                    {(!order.lines || order.lines.length === 0) && (
                      <div className="text-sm text-gray-500">No line items available</div>
                    )}
                    {order.lines && order.lines.length > 3 && (
                      <div className="text-sm text-gray-400">
                        +{order.lines.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-300 text-sm">
                Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={closeOrderModal} />
      )}

    </div>
  );
};

const OrderDetailsModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                  Order Details
                </h3>
                <div className="text-sm text-gray-500 mt-1">#{order.orderNumber || order.id}</div>
                {(order.confirmationNumber || order.confirmationId) && (
                  <div className="text-sm text-gray-500">Confirmation #: {order.confirmationNumber || order.confirmationId}</div>
                )}
              </div>
              <button onClick={onClose} className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Processing Status Message */}
            {order.processingStatus && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Order Status Notice
                    </h3>
                    <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>{order.processingStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shipping Info</h4>
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-white"><span className="font-medium">Job Name:</span> {order.jobName || 'N/A'}</p>
                  <p className="text-gray-900 dark:text-white"><span className="font-medium">PO Number:</span> {order.customerPO || order.purchaseOrder || 'N/A'}</p>
                  <p className="text-gray-900 dark:text-white"><span className="font-medium">Status:</span> {order.status}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Summary</h4>
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-white"><span className="font-medium">Date:</span> {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}</p>
                  <p className="text-gray-900 dark:text-white"><span className="font-medium">Total:</span> ${Number(order.totalAmount || order.total || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line Items</h4>
              <div className="space-y-3">
                {order.lines && order.lines.map((line: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{line.itemDescription}</p>
                      <p className="text-xs text-gray-500 mt-1">Item #: {line.itemNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white font-medium">Qty: {line.orderedQty?.value} {line.orderedQty?.uom}</p>
                      {line.unitPrice && (
                        <p className="text-sm text-gray-500">${Number(line.unitPrice.value || 0).toFixed(2)} / {line.unitPrice.uom}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!order.lines || order.lines.length === 0) && (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-gray-500">
                    No line items available
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;