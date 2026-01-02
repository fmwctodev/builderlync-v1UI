import React, { useState, useEffect } from 'react';
import { Plus, Package, Calendar, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMaterialOrdersByJobId, MaterialOrder } from '../../../shared/store/services/materialOrdersApi';

interface MaterialOrdersTabProps {
  jobId?: number;
}

const MaterialOrdersTab: React.FC<MaterialOrdersTabProps> = ({ jobId }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getMaterialOrdersByJobId(jobId);
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Error fetching material orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [jobId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'complete': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material orders</h2>
          <button 
            onClick={() => navigate(`/org/${orgSlug}/material-orders`)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Material order</span>
          </button>
        </div>
      </div>
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No material orders yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Create your first material order for this job</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Order #{order.purchase_order || order.id}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1.5" />
                        Branch: {order.branch_number}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialOrdersTab;