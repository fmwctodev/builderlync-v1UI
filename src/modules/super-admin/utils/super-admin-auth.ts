import { SUPER_ADMINS, MOCK_PASSWORD, SESSION_DURATION_HOURS, STORAGE_KEY } from '../constants/auth';
import { SuperAdminUser, SuperAdminSession } from '../types';

export const validateSuperAdminLogin = (
  email: string,
  password: string
): SuperAdminUser | null => {
  if (password !== MOCK_PASSWORD) {
    return null;
  }

  const user = SUPER_ADMINS.find((admin) => admin.email === email && admin.status === 'active');
  return user || null;
};

export const saveSuperAdminSession = (user: SuperAdminUser): void => {
  const timestamp = Date.now();
  const expiresAt = timestamp + SESSION_DURATION_HOURS * 60 * 60 * 1000;

  const session: SuperAdminSession = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    timestamp,
    expiresAt,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const getSuperAdminSession = (): SuperAdminSession | null => {
  try {
    const sessionStr = localStorage.getItem(STORAGE_KEY);
    if (!sessionStr) {
      return null;
    }

    const session: SuperAdminSession = JSON.parse(sessionStr);

    if (Date.now() > session.expiresAt) {
      clearSuperAdminSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error parsing super admin session:', error);
    clearSuperAdminSession();
    return null;
  }
};

export const clearSuperAdminSession = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('adminToken');
};

export const isSuperAdminAuthenticated = (): boolean => {
  const session = getSuperAdminSession();
  return session !== null;
};

export const getSuperAdminRole = (): string | null => {
  const session = getSuperAdminSession();
  return session ? session.role : null;
};

export const getSuperAdminUser = (): SuperAdminSession | null => {
  return getSuperAdminSession();
};
