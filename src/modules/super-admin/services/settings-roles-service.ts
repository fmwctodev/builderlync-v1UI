import {
  SuperAdminRoleTemplate,
  SuperAdminRole,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/settings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const STATIC_TEMPLATES: SuperAdminRoleTemplate[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system control with all permissions',
    role_type: 'admin',
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      jobs: { view: true, create: true, edit: true, delete: true, manage_status: true },
      financial: { view_billing: true, manage_billing: true, view_payments: true, process_payments: true, export_data: true },
      staff: { view: true, add: true, edit: true, delete: true, assign_roles: true },
      system: { manage_integrations: true, view_audit_logs: true, export_data: true, manage_brand: true },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: true },
    },
    is_system_template: true,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'High-level operational control',
    role_type: 'manager',
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: false, export: true },
      jobs: { view: true, create: true, edit: true, delete: false, manage_status: true },
      financial: { view_billing: false, manage_billing: false, view_payments: true, process_payments: false, export_data: false },
      staff: { view: true, add: true, edit: true, delete: false, assign_roles: true },
      system: { manage_integrations: false, view_audit_logs: false, export_data: true, manage_brand: false },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: false },
    },
    is_system_template: true,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Pipeline and quoting focused',
    role_type: 'sales',
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      jobs: { view: true, create: true, edit: true, delete: false, manage_status: false },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: false, view_conversations: true },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
    },
    is_system_template: true,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

export async function getRoleTemplates(): Promise<{
  success: boolean;
  data?: SuperAdminRoleTemplate[];
  error?: string;
}> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles/templates`, {
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    const result = await response.json();

    if (!response.ok) {
      return { success: true, data: STATIC_TEMPLATES };
    }

    const templates = Array.isArray(result.data) ? result.data : STATIC_TEMPLATES;
    return { success: true, data: templates };
  } catch (error: any) {
    console.error('Error fetching role templates:', error);
    return { success: true, data: STATIC_TEMPLATES };
  }
}

export async function getSuperAdminRoles(): Promise<{
  success: boolean;
  data?: SuperAdminRole[];
  error?: string;
}> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles`, {
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
    if (!response.ok) throw new Error(result.error || 'Failed to fetch roles');

    const rolesData = Array.isArray(result.data.data) ? result.data.data : [];
    return { success: true, data: rolesData };
  } catch (error: any) {
    console.error('Error fetching super admin roles:', error);
    return { success: false, error: error.message };
  }
}

export async function getRoleById(
  id: string
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles/${id}`, {
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Failed to fetch role');

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Error fetching role by ID:', error);
    return { success: false, error: error.message };
  }
}

export async function createRole(
  request: CreateRoleRequest
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(request),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Failed to create role');

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Error creating role:', error);
    return { success: false, error: error.message };
  }
}

export async function createRoleFromTemplate(
  templateId: string,
  customName?: string
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const sourceTemplate = STATIC_TEMPLATES.find(t => t.id === templateId);

    if (!sourceTemplate) {
      throw new Error('Template not found');
    }

    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        name: customName || sourceTemplate.name,
        description: sourceTemplate.description,
        permissions: sourceTemplate.permissions,
      }),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Failed to create role from template');

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Error creating role from template:', error);
    return { success: false, error: error.message };
  }
}

export async function updateRole(
  id: string,
  request: UpdateRoleRequest
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(request),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Failed to update role');

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRole(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/super-admin/roles/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Failed to delete role');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return { success: false, error: error.message };
  }
}

export function countPermissions(permissions: any): number {
  let count = 0;
  Object.values(permissions || {}).forEach((category: any) => {
    Object.values(category || {}).forEach((value) => {
      if (value === true) count++;
    });
  });
  return count;
}
