import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, User, Lock, Mail } from 'lucide-react';
import {
  checkAuthStatus,
  syncUserToSupabase,
  signInToSupabase,
  getCurrentExternalUser,
  AuthStatusResult,
  SyncResult,
} from '../../../../shared/services/userSyncService';

const UserSync: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    loadAuthStatus();
    loadCurrentUser();
  }, []);

  const loadAuthStatus = async () => {
    setLoading(true);
    const status = await checkAuthStatus();
    setAuthStatus(status);
    if (status.externalUserEmail) {
      setEmail(status.externalUserEmail);
    }
    setLoading(false);
  };

  const loadCurrentUser = async () => {
    const user = await getCurrentExternalUser();
    setCurrentUser(user);
  };

  const handleSync = async () => {
    if (!email || !password) {
      setSyncResult({
        success: false,
        message: 'Please enter both email and password',
        email,
      });
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    const result = await syncUserToSupabase({ email, password });
    setSyncResult(result);

    if (result.success) {
      const signInResult = await signInToSupabase(email, password);
      if (signInResult.success) {
        await loadAuthStatus();
        setSyncResult({
          ...result,
          message: 'User synced and signed in successfully! You can now use all features.',
        });
      }
    }

    setSyncing(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setSyncResult({
        success: false,
        message: 'Please enter both email and password',
        email,
      });
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    const result = await signInToSupabase(email, password);
    setSyncResult(result);

    if (result.success) {
      await loadAuthStatus();
    }

    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Synchronization</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sync your account between External API and Supabase authentication systems
            </p>
          </div>
          <button
            onClick={loadAuthStatus}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">External API Auth</h3>
              {authStatus?.hasExternalAuth ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authStatus?.hasExternalAuth ? (
                <>
                  <span className="font-medium">Authenticated</span>
                  <br />
                  {authStatus.externalUserEmail}
                </>
              ) : (
                'Not authenticated'
              )}
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Supabase Auth</h3>
              {authStatus?.hasSupabaseAuth ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authStatus?.hasSupabaseAuth ? (
                <>
                  <span className="font-medium">Authenticated</span>
                  <br />
                  {authStatus.supabaseUserEmail}
                </>
              ) : (
                'Not authenticated'
              )}
            </p>
          </div>
        </div>

        {authStatus?.needsSync && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Sync Required</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account exists in the External API but not in Supabase. Database operations requiring
                  authentication will fail until you sync your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {!authStatus?.needsSync && authStatus?.hasExternalAuth && authStatus?.hasSupabaseAuth && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-200">Fully Synchronized</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your account is authenticated in both systems. All features are available.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {authStatus?.needsSync ? 'Sync Your Account' : 'Sign In to Supabase'}
          </h3>

          {currentUser && (
            <div className="bg-paper dark:bg-canvas rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={syncing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={syncing}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use the same password you use to log in to the application
              </p>
            </div>

            {syncResult && (
              <div
                className={`rounded-lg p-4 ${
                  syncResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start">
                  {syncResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm ${
                      syncResult.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {syncResult.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {authStatus?.needsSync && (
                <button
                  onClick={handleSync}
                  disabled={syncing || !email || !password}
                  className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {syncing ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </span>
                  ) : (
                    'Sync My Account'
                  )}
                </button>
              )}

              {!authStatus?.hasSupabaseAuth && !authStatus?.needsSync && (
                <button
                  onClick={handleSignIn}
                  disabled={syncing || !email || !password}
                  className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {syncing ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    'Sign In to Supabase'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Important Information</h4>
        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
          <li>• This page syncs your External API account with Supabase authentication</li>
          <li>• Both systems must be authenticated for all features to work correctly</li>
          <li>• Use the same email and password for both systems</li>
          <li>• After syncing, you may need to log out and log back in</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default UserSync;
