import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginRequest, clearError, reset2FAState } from '../../../../shared/store/slices/authSlice';
import Toast from '../../../../shared/components/Toast';
import { useAutoLogout } from '../../../../shared/utils/autoLogout';
import Verify2FAModal from '../../components/Verify2FAModal';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, user, requires2FA } = useAppSelector((state) => state.auth);
  const hasBillingAccess = !!(
    user?.is_beta_user ||
    user?.has_active_subscription ||
    user?.subscription_status === 'active' ||
    user?.subscription_status === 'trialing'
  );
  const successMessage = location.state?.message;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  useAutoLogout();

  useEffect(() => {
    // Check if logged in as admin
    const adminToken = localStorage.getItem('adminToken');
    const adminSession = localStorage.getItem('super_admin_session');
    if (adminToken || adminSession) {
      setToast({message: 'Please logout from admin session first', type: 'error'});
    }
  }, []);

  useEffect(() => {
    if (requires2FA) {
      setShow2FAModal(true);
    } else if (user) {
      if (!hasBillingAccess) {
        navigate(`/billing?email=${encodeURIComponent(user.email || email)}`, { replace: true });
        return;
      }

      const orgSlug = user.companySlug || localStorage.getItem('currentOrganizationSlug');
      if (orgSlug) {
        localStorage.setItem('currentOrganizationSlug', orgSlug);
        navigate(`/org/${orgSlug}`, { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [user, requires2FA, navigate, email, hasBillingAccess]);

  useEffect(() => {
    if (successMessage) {
      setToast({message: successMessage, type: 'success'});
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      if (error === 'Please verify your email first') {
        navigate('/auth/verify-otp', { state: { email, from: 'login' } });
      } else {
        setToast({message: error, type: 'error'});
      }
    }
  }, [error, email, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if logged in as admin
    const adminToken = localStorage.getItem('adminToken');
    const adminSession = localStorage.getItem('super_admin_session');
    if (adminToken || adminSession) {
      setToast({message: 'Please logout from admin session first', type: 'error'});
      return;
    }

    dispatch(reset2FAState()); // Clear any previous 2FA state
    dispatch(loginRequest({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo/icon.png" alt="BuilderLync" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your BuilderLync account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
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
                placeholder="Enter your password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 focus:ring-2" style={{'--tw-ring-color': '#dc2626', 'accentColor': '#dc2626'} as React.CSSProperties} />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/auth/forgot-password" style={{color: '#dc2626'}} className="text-sm hover:opacity-80">
              Forgot password?
            </Link>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{backgroundColor: '#dc2626', '--tw-ring-color': '#dc2626'} as React.CSSProperties}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI;
                const scope = encodeURIComponent('openid email profile');
                const responseType = 'code';
                const accessType = 'offline';
                const prompt = 'select_account';

                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}&state=${JSON.stringify({ type: 'login', timestamp: Date.now() })}`;

                window.location.href = authUrl;
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" style={{color: '#dc2626'}} className="hover:opacity-80 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 2FA Modal */}
      <Verify2FAModal 
        isOpen={show2FAModal} 
        onClose={() => {
          setShow2FAModal(false);
          dispatch(reset2FAState());
        }} 
      />
    </div>
  );
};

export default Login;
