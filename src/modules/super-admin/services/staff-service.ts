import {
  SuperAdminStaff,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffFilters,
} from '../types/settings';
import { getSuperAdminRoles } from './settings-roles-service';

export interface StaffListResponse {
  data: SuperAdminStaff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

const request = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || payload?.error || 'Request failed');
  }

  return payload;
};

const mapStaff = (item: any, roleById: Map<string, any>): SuperAdminStaff => {
  const role = item?.role_id ? roleById.get(String(item.role_id)) : null;

  return {
    id: String(item.id),
    email: item.email || '',
    first_name: item.first_name || '',
    last_name: item.last_name || '',
    phone: item.phone || null,
    status: item.status || 'active',
    avatar_url: item.avatar_url || null,
    last_login_at: item.last_login_at || null,
    invited_at: item.invited_at || item.created_at || new Date().toISOString(),
    invited_by: item.invited_by || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || item.created_at || new Date().toISOString(),
    roles: role ? [role] : [],
  };
};

export async function getSuperAdminStaff(
  filters: StaffFilters = {}
): Promise<{ success: boolean; data?: StaffListResponse; error?: string }> {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = filters;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const [staffRes, rolesRes] = await Promise.all([
      request(`/super-admin/staff?${params.toString()}`, { method: 'GET' }),
      getSuperAdminRoles(),
    ]);

    const roles = rolesRes.success && rolesRes.data ? rolesRes.data : [];
    const roleById = new Map(roles.map((role) => [String(role.id), role]));

    const raw = staffRes?.data || {};
    const rows = Array.isArray(raw.data) ? raw.data : [];

    return {
      success: true,
      data: {
        data: rows.map((item: any) => mapStaff(item, roleById)),
        total: Number(raw.total || 0),
        page: Number(raw.page || page),
        limit: Number(raw.limit || limit),
        totalPages: Number(raw.totalPages || 1),
      },
    };
  } catch (error: any) {
    console.error('Error fetching super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function getStaffById(
  id: string
): Promise<{ success: boolean; data?: SuperAdminStaff; error?: string }> {
  try {
    const [staffRes, rolesRes] = await Promise.all([
      request(`/super-admin/staff/${id}`, { method: 'GET' }),
      getSuperAdminRoles(),
    ]);

    const roleById = new Map(
      (rolesRes.success && rolesRes.data ? rolesRes.data : []).map((role) => [String(role.id), role])
    );
    const item = staffRes?.data?.data || staffRes?.data || null;
    if (!item) return { success: false, error: 'Staff not found' };

    return { success: true, data: mapStaff(item, roleById) };
  } catch (error: any) {
    console.error('Error fetching staff by ID:', error);
    return { success: false, error: error.message };
  }
}

export async function createSuperAdminStaff(
  requestBody: CreateStaffRequest
): Promise<{ success: boolean; data?: SuperAdminStaff; error?: string }> {
  try {
    const payload = await request('/super-admin/staff', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const item = payload?.data?.data || payload?.data || null;
    if (!item) return { success: false, error: 'Failed to create staff member' };
    return { success: true, data: item };
  } catch (error: any) {
    console.error('Error creating super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSuperAdminStaff(
  id: string,
  requestBody: UpdateStaffRequest & { role_id?: string | null }
): Promise<{ success: boolean; data?: SuperAdminStaff; error?: string }> {
  try {
    const payload = await request(`/super-admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });
    const item = payload?.data?.data || payload?.data || null;
    if (!item) return { success: false, error: 'Failed to update staff member' };
    return { success: true, data: item };
  } catch (error: any) {
    console.error('Error updating super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSuperAdminStaff(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await request(`/super-admin/staff/${id}`, { method: 'DELETE' });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function assignRoleToStaff(
  staffId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await updateSuperAdminStaff(staffId, { role_id: roleId });
    if (!response.success) throw new Error(response.error || 'Failed to assign role');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning role to staff:', error);
    return { success: false, error: error.message };
  }
}

export async function removeRoleFromStaff(
  staffId: string,
  _roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await updateSuperAdminStaff(staffId, { role_id: null });
    if (!response.success) throw new Error(response.error || 'Failed to remove role');
    return { success: true };
  } catch (error: any) {
    console.error('Error removing role from staff:', error);
    return { success: false, error: error.message };
  }
}

