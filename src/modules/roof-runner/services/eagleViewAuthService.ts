import type { EagleViewAuthRequest, EagleViewAuthResponse, EagleViewAuthState } from '../types/measurementOrder';

const EAGLEVIEW_AUTH_ENDPOINT = 'https://eagleview-backend-7pe3.onrender.com/api/auth';
const AUTH_TIMEOUT_MS = 30000;

export async function authenticateEagleView(request: EagleViewAuthRequest): Promise<EagleViewAuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const response = await fetch(EAGLEVIEW_AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: request.username,
        password: request.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid username or password',
          errorCode: 'INVALID_CREDENTIALS',
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: 'Account does not have permission to access EagleView',
          errorCode: 'PERMISSION_DENIED',
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          error: 'EagleView service is temporarily unavailable. Please try again later.',
          errorCode: 'SERVICE_UNAVAILABLE',
        };
      }

      return {
        success: false,
        error: errorData.message || `Authentication failed with status ${response.status}`,
        errorCode: 'AUTH_FAILED',
      };
    }

    const data = await response.json();

    return {
      success: true,
      token: data.token || data.accessToken,
      accountId: data.accountId || data.account_id,
      accountName: data.accountName || data.account_name || request.username,
      expiresAt: data.expiresAt || data.expires_at,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Authentication request timed out. Please check your connection and try again.',
          errorCode: 'TIMEOUT',
        };
      }

      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          success: false,
          error: 'Unable to connect to EagleView. Please check your internet connection.',
          errorCode: 'NETWORK_ERROR',
        };
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred during authentication',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}

export function isTokenExpired(auth: EagleViewAuthState): boolean {
  if (!auth.expiresAt) {
    const authenticatedTime = new Date(auth.authenticatedAt).getTime();
    const now = Date.now();
    const defaultExpiryHours = 8;
    return now - authenticatedTime > defaultExpiryHours * 60 * 60 * 1000;
  }

  const expiryTime = new Date(auth.expiresAt).getTime();
  const bufferMs = 5 * 60 * 1000;
  return Date.now() > expiryTime - bufferMs;
}

export function validateCredentialsFormat(username: string, password: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  return { valid: true };
}

const SESSION_STORAGE_KEY = 'eagleview_auth';

export function storeEagleViewAuth(auth: EagleViewAuthState): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(auth));
  } catch (error) {
    console.error('Failed to store EagleView auth:', error);
  }
}

export function retrieveEagleViewAuth(): EagleViewAuthState | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const auth = JSON.parse(stored) as EagleViewAuthState;

    if (isTokenExpired(auth)) {
      clearEagleViewAuth();
      return null;
    }

    return auth;
  } catch (error) {
    console.error('Failed to retrieve EagleView auth:', error);
    return null;
  }
}

export function clearEagleViewAuth(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear EagleView auth:', error);
  }
}
