import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { authReducer } from './slices/authSlice';
import { contactsReducer } from './slices/contactsSlice';
import tasksReducer, { tasksSaga } from './slices/tasksSlice';
import notesReducer, { notesSaga } from './slices/notesSlice';
import callReducer from './slices/callSlice';
import { watchAuthSagas } from './sagas/authSaga';
import { default as contactsSaga } from './sagas/contactsSaga';
import { dashboardApi } from './services/dashboardApi';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    watchAuthSagas(),
    contactsSaga(),
    tasksSaga(),
    notesSaga(),
  ]);
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    tasks: tasksReducer,
    notes: notesReducer,
    call: callReducer,
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
