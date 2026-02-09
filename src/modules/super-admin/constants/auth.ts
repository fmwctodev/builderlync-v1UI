import { SuperAdminUser } from '../types';

export const SUPER_ADMINS: SuperAdminUser[] = [
  {
    id: '1',
    email: 'owner@builderlync.io',
    role: 'super_admin',
    name: 'Platform Owner',
    status: 'active',
  },
  {
    id: '2',
    email: 'ops@builderlync.io',
    role: 'operations',
    name: 'Operations Manager',
    status: 'active',
  },
  {
    id: '3',
    email: 'admin@builderlync.io',
    role: 'admin',
    name: 'System Admin',
    status: 'active',
  },
];

export const MOCK_PASSWORD = 'password123';
export const SESSION_DURATION_HOURS = 8;
export const STORAGE_KEY = 'superAdminAuth';
