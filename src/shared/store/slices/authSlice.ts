import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../services/authApi';
import { setEncryptedStorage, getEncryptedStorage } from '../../utils/encryption';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  resetToken: string | null;
  email: string | null;
  registrationEmail: string | null;
  requires2FA: boolean;
  tempToken: string | null;
  attemptsRemaining: number;
}

const getInitialState = (): AuthState => {
  const authData = getEncryptedStorage('auth');
  return {
    user: authData?.user || null,
    token: authData?.token || null,
    loading: false,
    error: null,
    resetToken: null,
    email: null,
    registrationEmail: null,
    requires2FA: false,
    tempToken: null,
    attemptsRemaining: 5,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ message: string; email?: string }>) => {
      console.log('registerSuccess reducer called with:', action.payload);
      state.loading = false;
      state.registrationEmail = action.payload.email || null;
      state.error = null;
      console.log('registrationEmail set to:', state.registrationEmail);
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      console.log('registerFailure reducer called with:', action.payload);
      state.loading = false;
      state.error = action.payload;
      state.registrationEmail = null;
    },
    loginRequest: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
      state.requires2FA = false;
      state.tempToken = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.requires2FA = false;
      state.tempToken = null;
      setEncryptedStorage('auth', action.payload);
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginRequires2FA: (state, action: PayloadAction<{ tempToken: string }>) => {
      state.loading = false;
      state.requires2FA = true;
      state.tempToken = action.payload.tempToken;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.requires2FA = false;
      state.tempToken = null;
    },
    verify2FARequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    verify2FASuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.requires2FA = false;
      state.tempToken = null;
      state.attemptsRemaining = 5;
      setEncryptedStorage('auth', action.payload);
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    verify2FAFailure: (state, action: PayloadAction<{ message: string; attemptsRemaining?: number }>) => {
      state.loading = false;
      state.error = action.payload.message;
      if (action.payload.attemptsRemaining !== undefined) {
        state.attemptsRemaining = action.payload.attemptsRemaining;
      }
      // Reset 2FA state if session expired or rate limited
      if (action.payload.message.includes('expired') || action.payload.message.includes('Too many')) {
        state.requires2FA = false;
        state.tempToken = null;
        state.attemptsRemaining = 5;
      }
    },
    forgotPasswordRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.email = action.payload;
    },
    forgotPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyOtpRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    verifyOtpSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.resetToken = action.payload;
    },
    verifyOtpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.resetToken = null;
      state.email = null;
    },
    resetPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyRegistrationOtpRequest: (state, action: PayloadAction<{ email: string; otp: string }>) => {
      state.loading = true;
      state.error = null;
    },
    verifyRegistrationOtpSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      setEncryptedStorage('auth', action.payload);
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    verifyRegistrationOtpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resendRegistrationOtpRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    resendRegistrationOtpSuccess: (state) => {
      state.loading = false;
    },
    resendRegistrationOtpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.resetToken = null;
      state.email = null;
      state.registrationEmail = null;
      state.requires2FA = false;
      state.tempToken = null;
      state.attemptsRemaining = 5;
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    reset2FAState: (state) => {
      state.requires2FA = false;
      state.tempToken = null;
      state.attemptsRemaining = 5;
      state.error = null;
    },
    clearRegistrationEmail: (state) => {
      state.registrationEmail = null;
    },
  },
});

export const {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginRequires2FA,
  loginFailure,
  verify2FARequest,
  verify2FASuccess,
  verify2FAFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  verifyRegistrationOtpRequest,
  verifyRegistrationOtpSuccess,
  verifyRegistrationOtpFailure,
  resendRegistrationOtpRequest,
  resendRegistrationOtpSuccess,
  resendRegistrationOtpFailure,
  logout,
  clearError,
  reset2FAState,
  clearRegistrationEmail,
} = authSlice.actions;

export const authReducer = authSlice.reducer;