import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import { store } from './shared/store';
import ErrorBoundary from './shared/components/ErrorBoundary';
import './index.css';
import { setupGlobalInterceptors } from './shared/utils/setupGlobalInterceptors';
import { analytics } from './shared/utils/analytics';

// Initialize the demo backend FIRST when the app is running in staging /
// demo mode. This installs the axios + fetch interceptors so every
// downstream service call resolves to mock data instead of attempting a
// real network request. Importing the module is enough — its top-level
// `installDemoBackend()` self-installs.
import './shared/utils/demoBackend';

// Initialize global 401 logout interceptors
setupGlobalInterceptors();

// Initialize Analytics
analytics.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);