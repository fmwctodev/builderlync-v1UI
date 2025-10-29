import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { roofRunnerReducer } from './slices';
import { authReducer } from '../../../shared/store/slices/authSlice';
import { watchAuthSagas } from '../../../shared/store/sagas/authSaga';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    watchAuthSagas(),
  ]);
}

export const store = configureStore({
  reducer: {
    roofRunner: roofRunnerReducer,
    auth: authReducer,
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