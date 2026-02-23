import { getEncryptedStorage } from './encryption';

export const getAuthToken = (): string | null => {
  const authData = getEncryptedStorage('auth');
  if (authData?.token) return authData.token;

  // Fallback to localStorage
  return localStorage.getItem('token') || null;
};

export const getAuthUser = () => {
  const authData = getEncryptedStorage('auth');
  return authData?.user || null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth');
  localStorage.removeItem('organizationId');
  localStorage.removeItem('currentOrganizationSlug');
};

export const logoutAndRedirect = () => {
  clearAuth();
  window.location.href = '/auth/login';
};