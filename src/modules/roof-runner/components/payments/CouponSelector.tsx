import React, { useState, useEffect } from 'react';
import { Tag, X, AlertCircle, Check } from 'lucide-react';
import { fetchCoupons, Coupon } from '../../../../shared/store/services/paymentsApi';

interface CouponSelectorProps {
  onCouponSelect: (coupon: Coupon | null) => void;
  selectedCoupon: Coupon | null;
  subtotal: number;
}

const CouponSelector: React.FC<CouponSelectorProps> = ({
  onCouponSelect,
  selectedCoupon,
  subtotal
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons({ status: 'active' });
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = (coupon: Coupon): { isValid: boolean; message: string } => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    if (coupon.status !== 'active') {
      return { isValid: false, message: 'This coupon is not currently active' };
    }

    if (startDate > now) {
      return { isValid: false, message: 'This coupon is not yet available' };
    }

    if (endDate && endDate < now) {
      return { isValid: false, message: 'This coupon has expired' };
    }

    if (coupon.max_redemptions && coupon.redemption_count >= coupon.max_redemptions) {
      return { isValid: false, message: 'This coupon has reached its maximum usage limit' };
    }

    return { isValid: true, message: 'Coupon applied successfully!' };
  };

  const calculateDiscount = (coupon: Coupon, subtotal: number): number => {
    if (coupon.discount_type === 'percentage') {
      return (subtotal * coupon.discount_value) / 100;
    } else {
      return Math.min(coupon.discount_value, subtotal);
    }
  };

  const handleCouponSelect = (coupon: Coupon) => {
    const validation = validateCoupon(coupon);

    if (!validation.isValid) {
      setValidationMessage(validation.message);
      setMessageType('error');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    setValidationMessage(validation.message);
    setMessageType('success');
    setTimeout(() => setValidationMessage(null), 3000);
    onCouponSelect(coupon);
  };

  const handleClearCoupon = () => {
    onCouponSelect(null);
    setValidationMessage(null);
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Tag size={16} />
          <span>Apply Coupon Code:</span>
        </label>
        {selectedCoupon && (
          <button
            onClick={handleClearCoupon}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
          >
            <X size={14} />
            <span>Remove Coupon</span>
          </button>
        )}
      </div>

      {validationMessage && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          messageType === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        }`}>
          {messageType === 'error' ? (
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
          ) : (
            <Check size={16} className="text-green-600 dark:text-green-400" />
          )}
          <p className={`text-sm ${
            messageType === 'error'
              ? 'text-red-700 dark:text-red-300'
              : 'text-green-700 dark:text-green-300'
          }`}>
            {validationMessage}
          </p>
        </div>
      )}

      {selectedCoupon ? (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Tag size={16} className="text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{selectedCoupon.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded font-mono text-xs">
                  {selectedCoupon.code}
                </code>
                <span className="font-medium text-primary-700 dark:text-primary-300">
                  {selectedCoupon.discount_type === 'percentage'
                    ? `${selectedCoupon.discount_value}% off`
                    : `$${selectedCoupon.discount_value.toFixed(2)} off`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Discount Amount</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                -${calculateDiscount(selectedCoupon, subtotal).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by coupon name or code..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Tag size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active coupons available</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {filteredCoupons.map((coupon) => {
                const validation = validateCoupon(coupon);
                return (
                  <button
                    key={coupon.id}
                    onClick={() => handleCouponSelect(coupon)}
                    disabled={!validation.isValid}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                      validation.isValid
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {coupon.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-600 dark:text-gray-300">
                            {coupon.code}
                          </code>
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}% off`
                              : `$${coupon.discount_value.toFixed(2)} off`}
                          </span>
                        </div>
                      </div>
                      {!validation.isValid && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponSelector;
