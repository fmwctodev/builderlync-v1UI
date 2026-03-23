import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authenticateEagleView, validateCredentialsFormat } from '../../services/eagleViewAuthService';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import type { EagleViewAuthState } from '../../types/measurementOrder';

interface EagleViewLoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const EagleViewLoginForm: React.FC<EagleViewLoginFormProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { setEagleViewAuth, eagleViewAuth } = useMeasurementOrderContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const validateFields = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateFields()) {
      return;
    }

    const formatValidation = validateCredentialsFormat(username.trim(), password);
    if (!formatValidation.valid) {
      setError(formatValidation.error || 'Invalid credentials format');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authenticateEagleView({
        username: username.trim(),
        password,
      });

      if (response.success && response.token) {
        const authState: EagleViewAuthState = {
          token: response.token,
          accountId: response.accountId,
          accountName: response.accountName,
          authenticatedAt: new Date().toISOString(),
          expiresAt: response.expiresAt,
        };

        setEagleViewAuth(authState);
        onSuccess?.();
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (eagleViewAuth) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Logged in as {eagleViewAuth.accountName || 'EagleView User'}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Session active
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label
          htmlFor="eagleview-username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          EagleView Username
        </label>
        <input
          id="eagleview-username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) {
              setFieldErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          placeholder="Enter your username"
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
            fieldErrors.username
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {fieldErrors.username && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="eagleview-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="eagleview-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="Enter your password"
            disabled={isLoading}
            className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
              fieldErrors.password
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
    </form>
  );
};

export default EagleViewLoginForm;
