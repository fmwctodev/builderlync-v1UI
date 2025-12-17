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
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ message: string; email?: string }>) => {
      state.loading = false;
      state.registrationEmail = action.payload.email || null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      setEncryptedStorage('auth', action.payload);
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    forgotPasswordRequest: (state) => {
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
    verifyOtpRequest: (state) => {
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
    resetPasswordRequest: (state) => {
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
    verifyRegistrationOtpRequest: (state) => {
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
    resendRegistrationOtpRequest: (state) => {
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
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
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
} = authSlice.actions;

export const authReducer = authSlice.reducer;