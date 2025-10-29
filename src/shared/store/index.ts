import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { authReducer } from './slices/authSlice';
import { contactsReducer } from './slices/contactsSlice';
import { watchAuthSagas } from './sagas/authSaga';
import { default as contactsSaga } from './sagas/contactsSaga';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    watchAuthSagas(),
    contactsSaga(),
  ]);
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;