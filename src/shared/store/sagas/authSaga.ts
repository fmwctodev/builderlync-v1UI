import { call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authApi, RegisterRequest, LoginRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest, VerifyRegistrationOtpRequest, Verify2FARequest } from '../services/authApi';
import {
  registerRequest, registerSuccess, registerFailure,
  loginRequest, loginSuccess, loginRequires2FA, loginFailure,
  verify2FARequest, verify2FASuccess, verify2FAFailure,
  forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure,
  verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure,
  resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure,
  verifyRegistrationOtpRequest, verifyRegistrationOtpSuccess, verifyRegistrationOtpFailure,
  resendRegistrationOtpRequest, resendRegistrationOtpSuccess, resendRegistrationOtpFailure
} from '../slices/authSlice';

function* registerSaga(action: PayloadAction<RegisterRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.register, action.payload);
    console.log('Registration response:', response);

    if (response.message === 'PENDING_PAYMENT') {
      console.log('Redirecting to billing for payment');
      window.location.href = `/billing?email=${encodeURIComponent(action.payload.email)}`;
      return;
    }

    console.log('Setting registration email:', action.payload.email);
    yield put(registerSuccess({ message: response.message, email: action.payload.email }));
  } catch (error: any) {
    console.error('Registration error in saga:', error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';

    if (errorMessage === 'INVALID_BETA_CODE') {
      window.location.href = '/billing';
      return;
    }

    yield put(registerFailure(errorMessage));
  }
}

function* loginSaga(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.login, action.payload);
    if (response.data.requires_2fa) {
      yield put(loginRequires2FA({ tempToken: response.data.temp_token! }));
    } else {
      yield put(loginSuccess({ user: response.data.user!, token: response.data.token! }));
    }
  } catch (error: any) {
    console.log('Login error:', JSON.stringify(error));
    yield put(loginFailure(error.message || 'Login failed'));
  }
}

function* verify2FASaga(action: PayloadAction<Verify2FARequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.verify2FA, action.payload);
    yield put(verify2FASuccess(response.data));
  } catch (error: any) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Verification failed';
    const attemptsRemaining = error.attemptsRemaining;
    yield put(verify2FAFailure({ message, attemptsRemaining }));
  }
}

function* forgotPasswordSaga(action: PayloadAction<ForgotPasswordRequest>): Generator<any, void, any> {
  try {
    yield call(authApi.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess(action.payload.email));
  } catch (error: any) {
    yield put(forgotPasswordFailure(error.message || 'Failed to send OTP'));
  }
}

function* verifyOtpSaga(action: PayloadAction<VerifyOtpRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.verifyOtp, action.payload);
    console.log('OTP verification response:', JSON.stringify(response));
    yield put(verifyOtpSuccess(response.data.token));
  } catch (error: any) {
    console.log('OTP verification error:', JSON.stringify(error));
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'OTP verification failed';
    yield put(verifyOtpFailure(message));
  }
}

function* resetPasswordSaga(action: PayloadAction<ResetPasswordRequest>): Generator<any, void, any> {
  try {
    yield call(authApi.resetPassword, action.payload);
    yield put(resetPasswordSuccess());
  } catch (error: any) {
    yield put(resetPasswordFailure(error.message || 'Password reset failed'));
  }
}

function* verifyRegistrationOtpSaga(action: PayloadAction<VerifyRegistrationOtpRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.verifyRegistrationOtp, action.payload);
    console.log(response)
    yield put(verifyRegistrationOtpSuccess(response.data));
  } catch (error: any) {
    console.log('OTP verification error:', error);
    const message = error.response?.data?.error || error.response?.data?.message || error.message || error || 'OTP verification failed';
    yield put(verifyRegistrationOtpFailure(message));
  }
}

function* resendRegistrationOtpSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(authApi.resendRegistrationOtp, { email: action.payload });
    yield put(resendRegistrationOtpSuccess());
  } catch (error: any) {
    yield put(resendRegistrationOtpFailure(error.message || 'Failed to resend OTP'));
  }
}

export function* watchAuthSagas() {
  yield takeEvery(registerRequest.type, registerSaga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(verify2FARequest.type, verify2FASaga);
  yield takeEvery(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeEvery(verifyOtpRequest.type, verifyOtpSaga);
  yield takeEvery(resetPasswordRequest.type, resetPasswordSaga);
  yield takeEvery(verifyRegistrationOtpRequest.type, verifyRegistrationOtpSaga);
  yield takeEvery(resendRegistrationOtpRequest.type, resendRegistrationOtpSaga);
}