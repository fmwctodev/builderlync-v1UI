import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verify2FARequest, clearError, reset2FAState } from '../../../shared/store/slices/authSlice';

interface Verify2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Verify2FAModal: React.FC<Verify2FAModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const dispatch = useAppDispatch();
  const { loading, error, tempToken, attemptsRemaining } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      if (error.includes('expired') || error.includes('Too many')) {
        setTimeout(() => {
          dispatch(reset2FAState());
          onClose();
        }, 2000);
      }
    }
  }, [error, onClose, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

    if (useBackupCode) {
      dispatch(verify2FARequest({ tempToken, backupCode: code }));
    } else {
      dispatch(verify2FARequest({ tempToken, code }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={() => {
            dispatch(reset2FAState());
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
            <Shield className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-gray-600 mt-2">
            {useBackupCode 
              ? 'Enter your backup code' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors text-center text-2xl tracking-widest"
              style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#dc2626'}
              onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
              placeholder={useBackupCode ? '12345678' : '000000'}
              maxLength={useBackupCode ? 8 : 6}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {attemptsRemaining < 5 && (
            <p className="text-sm text-orange-600 text-center">
              {attemptsRemaining} attempts remaining
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
            }}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
          >
            {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verify2FAModal;
