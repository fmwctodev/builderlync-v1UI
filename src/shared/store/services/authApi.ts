const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Verify2FARequest {
  tempToken: string;
  code?: string;
  backupCode?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyRegistrationOtpRequest {
  email: string;
  otp: string;
}

export interface ResendRegistrationOtpRequest {
  email: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companySlug?: string;
  organizationId?: number | string;
  organization_id?: number | string;
  role?: {
    id: string;
    name: string;
    permissions: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    token?: string;
    requires_2fa?: boolean;
    temp_token?: string;
    user_id?: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface VerifyRegistrationOtpResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ResendRegistrationOtpResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  error_code?: string;
  attempts_remaining?: number;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    return result;
  },
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    return result;
  },
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send OTP');
    }

    return result;
  },
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'OTP verification failed');
    }

    return result;
  },
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify({ token: data.token, newPassword: data.newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed');
    }

    return result;
  },
  verifyRegistrationOtp: async (data: VerifyRegistrationOtpRequest): Promise<VerifyRegistrationOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result)

    if (!response.ok) {
      throw new Error(result.message || 'OTP verification failed');
    }

    return result;
  },
  resendRegistrationOtp: async (data: ResendRegistrationOtpRequest): Promise<ResendRegistrationOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-registration-otp`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to resend OTP');
    }

    return result;
  },
  verify2FA: async (data: Verify2FARequest): Promise<Verify2FAResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/verify-2fa`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const error: any = new Error(result.message || 'Verification failed');
      error.errorCode = result.error_code;
      error.attemptsRemaining = result.attempts_remaining;
      throw error;
    }

    return result;
  },
};