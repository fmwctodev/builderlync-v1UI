import { call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { createContact, getContactById, CreateContactRequest, ContactResponse } from '../services/contactsApi';
import { createContactRequest, createContactSuccess, createContactFailure, getContactByIdRequest, getContactByIdSuccess, getContactByIdFailure } from '../slices/contactsSlice';

function* createContactSaga(action: PayloadAction<CreateContactRequest>) {
  console.log('createContactSaga triggered with:', action.payload);
  try {
    console.log('Calling API...');
    const response: ContactResponse = yield call(createContact, action.payload);
    console.log('API response:', response);
    yield put(createContactSuccess(response));
  } catch (error: any) {
    console.log('API error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create contact';
    yield put(createContactFailure(errorMessage));
  }
}

function* getContactByIdSaga(action: PayloadAction<number>) {
  try {
    const response: ContactResponse = yield call(getContactById, action.payload);
    yield put(getContactByIdSuccess(response));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch contact';
    yield put(getContactByIdFailure(errorMessage));
  }
}

function* contactsSaga() {
  console.log('contactsSaga initialized, watching for:', createContactRequest.type);
  yield takeEvery('contacts/createContactRequest', createContactSaga);
  yield takeEvery('contacts/getContactByIdRequest', getContactByIdSaga);
}

export default contactsSaga;