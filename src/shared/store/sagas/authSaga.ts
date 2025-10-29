import { call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authApi, RegisterRequest, LoginRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest } from '../services/authApi';
import {
  registerRequest, registerSuccess, registerFailure,
  loginRequest, loginSuccess, loginFailure,
  forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure,
  verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure,
  resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure
} from '../slices/authSlice';

function* registerSaga(action: PayloadAction<RegisterRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.register, action.payload);
    yield put(registerSuccess(response.data));
  } catch (error: any) {
    yield put(registerFailure(error.message || 'Registration failed'));
  }
}

function* loginSaga(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.login, action.payload);
    yield put(loginSuccess(response.data));
  } catch (error: any) {
    console.log('Login error:', JSON.stringify(error));
    yield put(loginFailure(error.message || 'Login failed'));
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
    yield put(verifyOtpFailure(error.message || 'OTP verification failed'));
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

export function* watchAuthSagas() {
  yield takeEvery(registerRequest.type, registerSaga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeEvery(verifyOtpRequest.type, verifyOtpSaga);
  yield takeEvery(resetPasswordRequest.type, resetPasswordSaga);
}