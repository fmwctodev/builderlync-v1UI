import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import Toast from '../../../../shared/components/Toast';

const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setToast({message: 'Invalid or missing setup token', type: 'error'});
      setTimeout(() => navigate('/auth/login'), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setToast({message: 'Passwords do not match', type: 'error'});
      return;
    }

    if (password.length < 8) {
      setToast({message: 'Password must be at least 8 characters', type: 'error'});
      return;
    }

    setLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175/api';
      const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({message: 'Password set successfully! Redirecting to login...', type: 'success'});
        setTimeout(() => navigate('/auth/login', { state: { message: 'Password set successfully. Please login.' } }), 2000);
      } else {
        const errorMsg = data.error || data.message || 'Failed to set password';
        if (errorMsg.toLowerCase().includes('token') && (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('expired'))) {
          setTokenError(true);
          setToast({message: 'Invalid or expired setup token', type: 'error'});
        } else {
          setToast({message: errorMsg, type: 'error'});
        }
      }
    } catch (error) {
      setToast({message: 'An error occurred. Please try again.', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo/icon.png" alt="BuilderLync" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            The password setup link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 transition-colors font-medium"
            style={{backgroundColor: '#dc2626'}}
          >
            Go to Login
          </button>
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
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo/icon.png" alt="BuilderLync" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Your Password</h1>
          <p className="text-gray-600 mt-2">Create a secure password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                placeholder="Confirm your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Password requirements:</p>
            <ul className="space-y-1">
              <li className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle size={16} className={password.length >= 8 ? 'text-green-500' : 'text-gray-400'} />
                At least 8 characters
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || password !== confirmPassword || password.length < 8}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
          >
            {loading ? 'Setting Password...' : 'Set Password'}
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

export default SetPassword;
