import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronRight, Search, Filter, Loader2, Calendar, Hash, DollarSign } from 'lucide-react';
import { qxoApi } from '../services/qxoApi';

interface QxoOrderHistoryProps {
  onBack: () => void;
  accountId?: string;
}

const QxoOrderHistory: React.FC<QxoOrderHistoryProps> = ({ onBack, accountId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const loadOrders = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await qxoApi.getOrders({
        accountId,
        pageNo: pageNum,
        pageSize: itemsPerPage
      });

      if (res.success) {
        setOrders(res.data || []);
        setTotalOrders(res.total || (res.data ? res.data.length : 0));
      }
    } catch (error) {
      console.error('Failed to load QXO orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (s.includes('ship') || s.includes('transit')) return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400';
    if (s.includes('cancel')) return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    if (s.includes('process') || s.includes('pending')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('ship') || s.includes('transit')) return <Truck className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-primary-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ClipboardList className="h-40 w-40 rotate-12" />
            </div>
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-primary-100 hover:text-white transition-colors text-sm font-medium mb-4 group"
            >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>
            <div className="relative z-10">
                <h1 className="text-3xl font-black tracking-tight">Beacon Order History</h1>
                <p className="mt-2 text-primary-100 font-medium opacity-90">Track and manage your material orders</p>
            </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Order # or Status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => loadOrders(1)} 
                  className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
                >
                    <Filter className="h-4 w-4" />
                </button>
             </div>
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-500 font-medium">Fetching orders from Beacon...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Order Info</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {orders.filter(o => !searchQuery || JSON.stringify(o).toLowerCase().includes(searchQuery.toLowerCase())).map((order) => (
                    <tr 
                      key={order.orderNumber || order.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <div className="text-sm font-black text-gray-900 dark:text-white mb-1">Order #{order.orderNumber || order.id}</div>
                             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {order.orderDate || 'Recent'}
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                             {order.branchCityState || order.branchName || 'Point of Sale'}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight uppercase ${getStatusColor(order.orderStatus || order.status)}`}>
                             {getStatusIcon(order.orderStatus || order.status)}
                             {order.orderStatus || order.status || 'Processing'}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24">
              <Package className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8">You haven't placed any orders with this Beacon account yet.</p>
              <button 
                onClick={onBack}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Re-using some standard icons for consistency
const ChevronLeft = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const ClipboardList = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
);

export default QxoOrderHistory;
