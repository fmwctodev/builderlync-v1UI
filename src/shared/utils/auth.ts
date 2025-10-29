import { getEncryptedStorage } from './encryption';

export const getAuthToken = (): string | null => {
  const authData = getEncryptedStorage('auth');
  return authData?.token || null;
};

export const getAuthUser = () => {
  const authData = getEncryptedStorage('auth');
  return authData?.user || null;
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
};