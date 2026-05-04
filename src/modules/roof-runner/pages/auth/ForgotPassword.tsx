import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPasswordRequest, verifyOtpRequest, resetPasswordRequest, clearError } from '../../../../shared/store/slices/authSlice';
import Toast from '../../../../shared/components/Toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, email: storedEmail, resetToken } = useAppSelector((state) => state.auth);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleChangeEmail = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    dispatch(clearError());
  };

  useEffect(() => {
    if (storedEmail && step === 'email' && email === storedEmail) {
      setStep('otp');
    }
    if (resetToken && step === 'otp') {
      setStep('reset');
    }
    if (!loading && !error && !resetToken && step === 'reset' && newPassword) {
      navigate('/auth/login', { state: { message: 'Password reset successfully' } });
    }
  }, [storedEmail, resetToken, step, loading, error, newPassword, navigate, email]);

  useEffect(() => {
    if (error) {
      setToast({message: error, type: 'error'});
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPasswordRequest({ email }));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(verifyOtpRequest({ email, otp }));
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({message: 'Passwords do not match', type: 'error'});
      return;
    }
    dispatch(resetPasswordRequest({ token: resetToken!, newPassword }));
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#dc2626'}}>
              <span className="text-white text-xl font-bold">BL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
            <p className="text-gray-600 mt-2">We've sent a 6-digit code to {email}</p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors text-center text-2xl tracking-widest"
                style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleChangeEmail}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Change Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#dc2626'}}>
              <span className="text-white text-xl font-bold">BL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">Enter your new password</p>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                  style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                  placeholder="Enter new password"
                  required
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
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                  style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#dc2626'}}>
            <span className="text-white text-xl font-bold">BL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">No worries, we'll send you reset instructions</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors"
                style={{'--tw-ring-color': '#dc2626'} as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6">
          <Link
            to="/auth/login"
            className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;