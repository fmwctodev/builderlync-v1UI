import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Plus, Calendar, MapPin, User, Filter, Download } from 'lucide-react';
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

  const handleDownloadReport = async (order: any) => {
    if (!order.response_data?.ReportIds?.length) return;
    
    try {
      const token = localStorage.getItem('token');
      const reportId = order.response_data.ReportIds[0];
      
      // First get report details
      const reportResponse = await axios.get(
        `https://builderlyncapi.testenvapp.com/api/eagleview/report?reportId=${reportId}`,
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
        alert('Report download link not available.');
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
      
      const url = `https://builderlyncapi.testenvapp.com/api/eagleview/orders${params.toString() ? '?' + params.toString() : ''}`;
      
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
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50"
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
              className="pl-10 pr-4 py-2 w-full bg-primary-700 border border-primary-500 rounded-lg text-white placeholder-primary-200"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-200" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white appearance-none min-w-[140px]"
            >
              <option value="0">PENDING</option>
              <option value="1">REQUESTED</option>
              <option value="2">IN PROGRESS</option>
              <option value="3">DELIVERED</option>
              <option value="4">COMPLETE</option>
              <option value="5">PROCESSED</option>
              <option value="6">PICKUP REQUESTED</option>
              <option value="7">PICKUP COMPLETED</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-primary-200 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-gray-700">
          Showing {orders.length} orders
          {(searchQuery || statusFilter !== 'all') && ` (filtered)`}
        </p>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.reference_id}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Eagle View Order
                      </span>
                      {order.response_data?.ReportIds?.length > 0 && (
                        <button
                          onClick={() => handleDownloadReport(order)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                          title="Download Report"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">City:</span>
                        <span>{order.city}, {order.state} {order.zip}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      {order.order_data?.placeOrderUser && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Ordered by: {order.order_data.placeOrderUser}</span>
                        </div>
                      )}
                    </div>

                    {order.order_data?.orderReports && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          {order.order_data.orderReports.batchId && (
                            <div>Batch ID: {order.order_data.orderReports.batchId}</div>
                          )}
                          {order.order_data.orderReports.dateOfLoss && (
                            <div>Date of Loss: {order.order_data.orderReports.dateOfLoss}</div>
                          )}
                          {order.order_data.orderReports.claimNumber && (
                            <div>Claim Number: {order.order_data.orderReports.claimNumber}</div>
                          )}
                          {order.order_data.orderReports.pONumber && (
                            <div>PO Number: {order.order_data.orderReports.pONumber}</div>
                          )}
                        </div>
                        {order.order_data.orderReports.comments && (
                          <div className="mt-2">
                            <span className="font-medium">Comments:</span> {order.order_data.orderReports.comments}
                          </div>
                        )}
                      </div>
                    )}

                    {order.response_data && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Order ID:</span> {order.response_data.OrderId}
                        {order.response_data.ReportIds && order.response_data.ReportIds.length > 0 && (
                          <span className="ml-4">
                            <span className="font-medium">Report IDs:</span> {order.response_data.ReportIds.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No orders match your search criteria.' : 'You haven\'t placed any orders yet.'}
            </p>
            <button
              onClick={onPlaceNewOrder}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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