import React, { useState } from 'react';
import { srsService } from '../../services/srsService';

interface SRSConnectionProps {
  onConnectionSuccess: () => void;
  onClose: () => void;
}

export default function SRSConnection({ onConnectionSuccess, onClose }: SRSConnectionProps) {
  const [customerCode, setCustomerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await srsService.saveCustomerProfile(customerCode.trim());
      
      if (result.success && result.data?.connected) {
        onConnectionSuccess();
      } else {
        setError(result.message || 'Connection failed');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect to SRS Distribution</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your SRS customer code to enable pricing and ordering.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Customer Code
            </label>
            <input
              type="text"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Enter your SRS customer code"
              autoComplete="off"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Example: X000000</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
