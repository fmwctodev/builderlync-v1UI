import axios from 'axios';
import { logoutAndRedirect } from './auth';

/**
 * Sets up global interceptors for fetch and axios to handle 401 Unauthorized errors
 * by automatically logging out the user.
 */
export const setupGlobalInterceptors = () => {
    // 1. Setup Axios global interceptor
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 403) {
                // Special check to avoid logout on login attempts that fail with 401
                const isLoginPath = error.config?.url?.includes('/auth/login');
                if (!isLoginPath) {
                    logoutAndRedirect();
                }
            }
            return Promise.reject(error);
        }
    );

    // 2. Setup Fetch global interceptor (monkey-patch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        if (response.status === 403) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
            // Don't logout on login failures
            if (!url.includes('/auth/login')) {
                logoutAndRedirect();
            }
        }

        return response;
    };

    console.log('Global HTTP interceptors initialized');
};
