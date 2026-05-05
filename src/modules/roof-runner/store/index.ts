import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { roofRunnerReducer } from './slices';
import { authReducer } from '../../../shared/store/slices/authSlice';
import { contactsReducer } from '../../../shared/store/slices/contactsSlice';
import { watchAuthSagas } from '../../../shared/store/sagas/authSaga';
import { default as contactsSaga } from '../../../shared/store/sagas/contactsSaga';
import { dashboardApi } from '../../../shared/store/services/dashboardApi';
import { pipelinesApi } from '../../../shared/store/services/pipelinesApi';
import { jobPipelinesApi } from '../../../shared/store/services/jobPipelinesApi';

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
    [pipelinesApi.reducerPath]: pipelinesApi.reducer,
    [jobPipelinesApi.reducerPath]: jobPipelinesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
    .concat(dashboardApi.middleware, pipelinesApi.middleware, jobPipelinesApi.middleware, sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;