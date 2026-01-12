import React, { useState } from 'react';
import { srsService } from '../../services/srsService';

interface SRSConnectionProps {
  onConnectionSuccess: () => void;
  onClose: () => void;
}

export default function SRSConnection({ onConnectionSuccess, onClose }: SRSConnectionProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '', branchId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await srsService.authenticate(credentials);
      
      if (result.success) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Connect to SRS Distribution</h2>
        
        <form onSubmit={handleConnect}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Branch ID (Optional)</label>
            <input
              type="text"
              value={credentials.branchId}
              onChange={(e) => setCredentials({...credentials, branchId: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}