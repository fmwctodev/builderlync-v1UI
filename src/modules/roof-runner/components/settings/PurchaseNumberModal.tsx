import React, { useState, useEffect } from 'react';
import { X, Search, Phone, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import { getAvailableNumbers, purchaseNumber, AvailableNumber } from '../../../../shared/store/services/twilioApi';

interface PurchaseNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

const PurchaseNumberModal: React.FC<PurchaseNumberModalProps> = ({
  isOpen,
  onClose,
  onPurchaseSuccess
}) => {
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmNumber, setConfirmNumber] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      searchNumbers();
    }
  }, [isOpen]);

  const searchNumbers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAvailableNumbers(areaCode || undefined);
      if (response.success && response.data) {
        setAvailableNumbers(response.data);
      } else {
        setError(response.message || 'Failed to load available numbers');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error searching for numbers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (phoneNumber: string) => {
    setConfirmNumber(null);
    setPurchasing(phoneNumber);
    setError(null);
    try {
      const response = await purchaseNumber(phoneNumber);
      if (response.success) {
        onPurchaseSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to purchase number');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error purchasing number';
      setError(errorMessage);
    } finally {
      setPurchasing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Purchase Phone Number
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="Area code (optional)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-32"
          />
          <button
            onClick={searchNumbers}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : availableNumbers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No available numbers found. Try a different area code.
            </div>
          ) : (
            <div className="space-y-2">
              {availableNumbers.map((number) => (
                <div
                  key={number.phoneNumber}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-mono font-medium text-gray-900 dark:text-white">
                        {number.phoneNumber}
                      </span>
                      <div className="flex items-center space-x-2">
                        {number.capabilities.voice && (
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">Voice</span>
                          </div>
                        )}
                        {number.capabilities.sms && (
                          <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-xs">SMS</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{number.locality}, {number.region} {number.postalCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmNumber(number.phoneNumber)}
                    disabled={purchasing === number.phoneNumber}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {purchasing === number.phoneNumber ? 'Purchasing...' : 'Purchase'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>

      {confirmNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Purchase
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are about to purchase <span className="font-mono font-semibold">{confirmNumber}</span>
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Payment Information:</strong><br />
                The payment will be automatically deducted from your Twilio account balance. The number will be assigned to your account instantly upon successful payment.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmNumber(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(confirmNumber)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseNumberModal;