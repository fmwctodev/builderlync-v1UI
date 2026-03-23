import type { AccountMode, EagleViewAuthState } from '../types/measurementOrder';

export const VALIDATION_ERRORS = {
  NO_ACCOUNT_MODE: 'Please select a payment method to continue',
  EAGLEVIEW_NOT_AUTHENTICATED: 'Please log in to your EagleView account to continue',
  EAGLEVIEW_TOKEN_EXPIRED: 'Your EagleView session has expired. Please log in again.',
  INSUFFICIENT_CREDITS: 'Insufficient credit balance for this order',
  INVALID_CREDENTIALS_FORMAT: 'Please enter valid credentials',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
} as const;

export interface AccountModeValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAccountModeSelection(
  mode: AccountMode | null,
  eagleViewAuth: EagleViewAuthState | null
): AccountModeValidationResult {
  if (!mode) {
    return {
      valid: false,
      error: VALIDATION_ERRORS.NO_ACCOUNT_MODE,
    };
  }

  if (mode === 'eagleview') {
    if (!eagleViewAuth) {
      return {
        valid: false,
        error: VALIDATION_ERRORS.EAGLEVIEW_NOT_AUTHENTICATED,
      };
    }

    if (isTokenExpired(eagleViewAuth)) {
      return {
        valid: false,
        error: VALIDATION_ERRORS.EAGLEVIEW_TOKEN_EXPIRED,
      };
    }
  }

  return { valid: true };
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

export function validateEagleViewCredentials(
  username: string,
  password: string
): AccountModeValidationResult {
  if (!username || username.trim().length === 0) {
    return {
      valid: false,
      error: 'Username is required',
    };
  }

  if (username.trim().length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters',
    };
  }

  if (!password || password.length === 0) {
    return {
      valid: false,
      error: 'Password is required',
    };
  }

  return { valid: true };
}

export function hasEnoughCredits(balance: number, orderTotal: number): boolean {
  return balance >= orderTotal;
}

export function validateCreditsForOrder(
  balance: number,
  orderTotal: number
): AccountModeValidationResult {
  if (!hasEnoughCredits(balance, orderTotal)) {
    return {
      valid: false,
      error: `${VALIDATION_ERRORS.INSUFFICIENT_CREDITS}. You have $${balance.toFixed(2)} but need $${orderTotal.toFixed(2)}.`,
    };
  }

  return { valid: true };
}

export function formatValidationError(error: string): string {
  return error.charAt(0).toUpperCase() + error.slice(1);
}
