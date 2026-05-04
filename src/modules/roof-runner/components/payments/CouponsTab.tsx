import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { getCoupons, deleteCoupon, Coupon } from '../../../../shared/store/services/couponsApi';
import CreateCouponModal from './CreateCouponModal';

const CouponsTab: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      setCoupons([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'all') return true;
    return coupon.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coupons</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All ({coupons.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm rounded-lg ${
                filter === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Active ({coupons.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 py-1 text-sm rounded-lg ${
                filter === 'inactive'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Inactive ({coupons.filter(c => c.status === 'inactive').length})
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading coupons...</div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No coupons found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first coupon to get started</p>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{coupon.coupon_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded">
                        {coupon.coupon_code}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `$${coupon.discount_value}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(coupon.start_date).toLocaleDateString()}
                      {coupon.end_date && ` - ${new Date(coupon.end_date).toLocaleDateString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {coupon.times_used}
                      {coupon.maximum_redemptions && ` / ${coupon.maximum_redemptions}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setShowCreateModal(true);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateCouponModal
        isOpen={showCreateModal}
        editCoupon={editingCoupon}
        onClose={() => {
          setEditingCoupon(null);
          setShowCreateModal(false);
        }}
        onSuccess={(_coupon) => {
          loadCoupons();
          setEditingCoupon(null);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

export default CouponsTab;
