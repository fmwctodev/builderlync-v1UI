import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  is_default: boolean;
  is_deletable: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  staff_count?: number;
}

export interface RolePermissions {
  contacts: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
  jobs: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage_status: boolean;
  };
  financial: {
    view_billing: boolean;
    manage_billing: boolean;
    view_payments: boolean;
    process_payments: boolean;
    export_data: boolean;
  };
  staff: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    assign_roles: boolean;
  };
  system: {
    manage_integrations: boolean;
    view_audit_logs: boolean;
    export_data: boolean;
    manage_brand: boolean;
  };
  communications: {
    send_messages: boolean;
    manage_templates: boolean;
    view_conversations: boolean;
  };
  marketing: {
    manage_campaigns: boolean;
    view_analytics: boolean;
    manage_automation: boolean;
  };
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: RolePermissions;
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  id: string;
}

export const getRoles = async () => {
  const response = await axios.get(`${API_URL}/roles`);
  return {
    success: true,
    data: response.data
  };
};

export const getRole = async (id: string) => {
  const response = await axios.get(`${API_URL}/roles/${id}`);
  return {
    success: true,
    data: response.data
  };
};

export const createRole = async (roleData: CreateRoleData) => {
  const response = await axios.post(`${API_URL}/roles`, roleData);
  return {
    success: true,
    data: response.data
  };
};

export const updateRole = async (id: string, roleData: Partial<CreateRoleData>) => {
  const response = await axios.put(`${API_URL}/roles/${id}`, roleData);
  return {
    success: true,
    data: response.data
  };
};

export const deleteRole = async (id: string) => {
  const response = await axios.delete(`${API_URL}/roles/${id}`);
  return {
    success: true,
    data: response.data
  };
};

export const assignRoleToStaff = async (staffId: string, roleId: string) => {
  const response = await axios.post(`${API_URL}/staff/${staffId}/roles`, { roleId });
  return {
    success: true,
    data: response.data
  };
};

export const removeRoleFromStaff = async (staffId: string, roleId: string) => {
  const response = await axios.delete(`${API_URL}/staff/${staffId}/roles/${roleId}`);
  return {
    success: true,
    data: response.data
  };
};

export const getStaffRoles = async (staffId: string) => {
  const response = await axios.get(`${API_URL}/staff/${staffId}/roles`);
  return {
    success: true,
    data: response.data
  };
};

export const getDefaultPermissions = (): RolePermissions => {
  return {
    contacts: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
    },
    jobs: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      manage_status: false,
    },
    financial: {
      view_billing: false,
      manage_billing: false,
      view_payments: false,
      process_payments: false,
      export_data: false,
    },
    staff: {
      view: false,
      add: false,
      edit: false,
      delete: false,
      assign_roles: false,
    },
    system: {
      manage_integrations: false,
      view_audit_logs: false,
      export_data: false,
      manage_brand: false,
    },
    communications: {
      send_messages: false,
      manage_templates: false,
      view_conversations: false,
    },
    marketing: {
      manage_campaigns: false,
      view_analytics: false,
      manage_automation: false,
    },
  };
};
