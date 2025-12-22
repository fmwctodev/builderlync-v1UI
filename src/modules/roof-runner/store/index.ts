import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { roofRunnerReducer } from './slices';
import { authReducer } from '../../../shared/store/slices/authSlice';
import { contactsReducer } from '../../../shared/store/slices/contactsSlice';
import { watchAuthSagas } from '../../../shared/store/sagas/authSaga';
import { default as contactsSaga } from '../../../shared/store/sagas/contactsSaga';
import { dashboardApi } from '../../../shared/store/services/dashboardApi';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    watchAuthSagas(),
    contactsSaga(),
  ]);
}

export const store = configureStore({
  reducer: {
    roofRunner: roofRunnerReducer,
    auth: authReducer,
    contacts: contactsReducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
    .concat(dashboardApi.middleware)
    .concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;