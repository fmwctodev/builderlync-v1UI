import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verify2FARequest, clearError } from '../../../../shared/store/slices/authSlice';
import Toast from '../../../../shared/components/Toast';

const Verify2FA: React.FC = () => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, user, tempToken, attemptsRemaining } = useAppSelector((state) => state.auth);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!tempToken) {
      navigate('/auth/login');
    }
  }, [tempToken, navigate]);

  useEffect(() => {
    if (user) {
      const orgSlug = user.companySlug || localStorage.getItem('currentOrganizationSlug');
      if (orgSlug) {
        localStorage.setItem('currentOrganizationSlug', orgSlug);
        navigate(`/org/${orgSlug}`);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setToast({message: error, type: 'error'});
      if (error.includes('expired') || error.includes('Too many')) {
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    }
  }, [error, navigate]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
            <Shield className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">
            {useBackupCode 
              ? 'Enter your backup code' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors text-center text-2xl tracking-widest"
              style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#dc2626'}
              onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
              placeholder={useBackupCode ? '12345678' : '000000'}
              maxLength={useBackupCode ? 8 : 6}
              required
            />
          </div>

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

          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-900"
          >
            Back to login
          </button>
        </form>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Verify2FA;
