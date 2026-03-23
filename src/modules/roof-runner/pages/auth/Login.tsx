import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginRequest, clearError } from '../../../../shared/store/slices/authSlice';
import Toast from '../../../../shared/components/Toast';
import { useAutoLogout } from '../../../../shared/utils/autoLogout';
import { supabase } from '../../../../shared/lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  const successMessage = location.state?.message;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  useEffect(() => {
    const handlePostLoginRedirect = async () => {
      console.log('🔍 Login useEffect - user state:', user);
      if (!user) {
        console.log('⏳ No user in state yet');
        return;
      }

      try {
        console.log('✅ User detected, fetching organizations...');

        // Get the actual Supabase user with UUID
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (!supabaseUser) {
          console.error('No Supabase user found');
          return;
        }

        // Fetch user's organizations using Supabase UUID
        const { data: memberships, error: membershipsError } = await supabase
          .from('organization_members')
          .select('organization_id,role')
          .eq('user_id', supabaseUser.id)
          .eq('is_active', true);

        if (membershipsError) {
          console.error('Error fetching memberships:', membershipsError);
          // Fall back to organization selector on error
          navigate('/organizations');
          return;
        }

        if (!memberships || memberships.length === 0) {
          console.log('No organizations found, redirecting to selector');
          navigate('/organizations');
          return;
        }

        // Fetch organization details
        const orgIds = memberships.map(m => m.organization_id);
        const { data: organizations, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name, slug')
          .in('id', orgIds);

        if (orgsError) {
          console.error('Error fetching organizations:', orgsError);
          navigate('/organizations');
          return;
        }

        // Check for previously accessed organization
        const storedOrgSlug = localStorage.getItem('currentOrganizationSlug');
        const storedOrg = organizations?.find(org => org.slug === storedOrgSlug);

        if (storedOrg) {
          console.log('✅ Redirecting to stored organization:', storedOrg.slug);
          localStorage.setItem('currentOrganizationId', storedOrg.id);
          navigate(`/org/${storedOrg.slug}/dashboard`, { replace: true });
          return;
        }

        // If user has exactly one organization, redirect directly
        if (organizations.length === 1) {
          const org = organizations[0];
          console.log('✅ Single organization found, redirecting to dashboard:', org.slug);
          localStorage.setItem('currentOrganizationId', org.id);
          localStorage.setItem('currentOrganizationSlug', org.slug);
          navigate(`/org/${org.slug}/dashboard`, { replace: true });
          return;
        }

        // Multiple organizations - show selector
        console.log(`Multiple organizations found (${organizations.length}), showing selector`);
        navigate('/organizations');
      } catch (error) {
        console.error('Error in post-login redirect:', error);
        navigate('/organizations');
      }
    };

    handlePostLoginRedirect();
  }, [user, navigate]);

  useEffect(() => {
    if (successMessage) {
      setToast({message: successMessage, type: 'success'});
    }
  }, [successMessage]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    </div>
  );
};

export default Login;