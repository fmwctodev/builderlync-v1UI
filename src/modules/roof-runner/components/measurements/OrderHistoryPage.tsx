import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Plus, Calendar, MapPin, User, Filter, Download, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';
import axios from 'axios';

interface OrderHistoryPageProps {
  onBack: () => void;
  onPlaceNewOrder: () => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBack, onPlaceNewOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const getStatusInfo = (statusId: number) => {
    switch (statusId) {
      case 1: return { label: 'CREATED', color: 'bg-blue-100 text-blue-800' };
      case 2: return { label: 'IN PROCESS', color: 'bg-purple-100 text-purple-800' };
      case 3: return { label: 'PENDING', color: 'bg-orange-100 text-orange-800' };
      case 4: return { label: 'CLOSED', color: 'bg-gray-100 text-gray-800' };
      case 5: return { label: 'COMPLETED', color: 'bg-green-100 text-green-800' };
      default: return { label: 'UNKNOWN', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleDownloadReport = async (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    if (!order.response_data?.ReportIds?.length && !order.report_id) return;

    try {
      const token = localStorage.getItem('token');
      const reportId = order.report_id || order.response_data.ReportIds[0];

      // First get report details
      const reportResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/eagleview/report?reportId=${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (reportResponse.data.success && reportResponse.data.data?.ReportDownloadLink) {
        // Use the download link to download the file
        const downloadLink = reportResponse.data.data.ReportDownloadLink;
        const link = document.createElement('a');
        link.href = downloadLink;
        link.setAttribute('download', `report-${reportId}.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert('Report download link not available yet. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const loadOrders = useCallback(async (search = '', status = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (status !== 'all') params.append('status', status);

      const url = `${import.meta.env.VITE_API_BASE_URL}/eagleview/orders${params.toString() ? '?' + params.toString() : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
        setTotalOrders(response.data.total || response.data.data?.length || 0);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOrders(searchQuery, statusFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, loadOrders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (initialLoad && loading) {
    return (
      <div className="space-y-6">
        <div className="bg-primary-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Order History</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white hover:text-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Order History</h1>
              <p className="text-primary-100">View and track your Eagle View orders</p>
            </div>
          </div>
          <button
            onClick={onPlaceNewOrder}
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>

        <div className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by reference ID, address, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-primary-700 border border-primary-500 rounded-lg text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-200" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white appearance-none min-w-[160px] focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="1">CREATED</option>
              <option value="2">IN PROCESS</option>
              <option value="3">PENDING</option>
              <option value="4">CLOSED</option>
              <option value="5">COMPLETED</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-primary-200 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center px-2">
        <p className="text-gray-700 font-medium">
          Showing {orders.length} orders
          {(searchQuery || statusFilter !== 'all') && ` (filtered)`}
        </p>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Updating results...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status_id);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`transition-colors hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                            {order.address}, {order.city}, {order.state}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {/* {(order.response_data?.ReportIds?.length > 0 || order.report_id) && (
                            <button
                              onClick={(e) => handleDownloadReport(e, order)}
                              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                              title="Download Report"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          )} */}
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>Ref ID: {order.reference_id || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          {order.order_data?.placeOrderUser && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>By: {order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Unknown'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-2">
                          {(order.response_data?.ReportIds?.length > 0 || order.report_id) && (order.status_id >= 3) && (
                            <button
                              onClick={(e) => handleDownloadReport(e, order)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Download Report
                            </button>
                          )}
                          {/* Show chevron */}
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3">Order Details</h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3 shadow-sm">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Product ID:</span>
                              <span className="font-medium text-gray-900">{order.primary_product_id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Delivery Product ID:</span>
                              <span className="font-medium text-gray-900">{order.delivery_product_id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Last Updated:</span>
                              <span className="font-medium text-gray-900">
                                {order.updated_at ? new Date(order.updated_at).toLocaleString() : '-'}
                              </span>
                            </div>
                            {order.order_data?.orderReports?.claimNumber && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Claim Number:</span>
                                <span className="font-medium text-gray-900">{order.order_data.orderReports.claimNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3">System Info</h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3 shadow-sm">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Order ID (EV):</span>
                              <span className="font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{order.response_data?.OrderId || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Report ID (EV):</span>
                              <span className="font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                                {order.report_id || order.response_data?.ReportIds?.join(', ') || '-'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Sub-Status ID:</span>
                              <span className="font-medium text-gray-900">{order.sub_status_id || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {order.order_data?.orderReports?.comments && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-2">Comments</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                              {order.order_data.orderReports.comments}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-300 mb-4">
              <FileText className="w-16 h-16 mx-auto" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'Get started by placing your first measurement order.'}
            </p>
            <button
              onClick={onPlaceNewOrder}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition-all"
            >
              Place Your First Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
