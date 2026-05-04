import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { saveSuperAdminSession, isSuperAdminAuthenticated } from '../utils/super-admin-auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if already logged in as admin
    if (isSuperAdminAuthenticated()) {
      const from = (location.state as any)?.from || '/super-admin';
      navigate(from, { replace: true });
      return;
    }

    // Check if logged in as regular user or staff
    const regularToken = localStorage.getItem('token');
    if (regularToken) {
      setError('Please logout from your current session first');
    }
  }, [navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if logged in as regular user or staff
    const regularToken = localStorage.getItem('token');
    if (regularToken) {
      setError('Please logout from your current session first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Save admin session
      const adminUser = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: `${result.data.user.firstName} ${result.data.user.lastName}`,
        role: 'owner',
        status: 'active' as const,
      };

      saveSuperAdminSession(adminUser);
      localStorage.setItem('adminToken', result.data.token);

      const from = (location.state as any)?.from || '/super-admin';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Failed to connect to server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src="/logo/icon.png" alt="BuilderLync" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange();
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="owner@builderlync.io"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange();
                }}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Admin login only. Regular users should use the main login page.
          </p>
        </div>
      </div>
    </div>
  );
};
