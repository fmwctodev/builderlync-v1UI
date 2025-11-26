import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  is_default: boolean;
  is_deletable: boolean;
  is_custom?: boolean;
  template_id?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  staff_count?: number;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  role_type: string;
  permissions: RolePermissions;
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  scheduling: {
    view_calendar: boolean;
    create_appointments: boolean;
    assign_crew: boolean;
    manage_dispatch: boolean;
  };
  estimates: {
    create_estimate: boolean;
    edit_estimate: boolean;
    approve_estimate: boolean;
    send_estimate: boolean;
  };
  reporting: {
    view_reports: boolean;
    export_reports: boolean;
    view_financial_reports: boolean;
  };
  field_operations: {
    upload_photos: boolean;
    complete_tasks: boolean;
    mark_job_complete: boolean;
    request_supplements: boolean;
  };
  integrations: {
    manage_eagleview: boolean;
    manage_material_orders: boolean;
    manage_quickbooks: boolean;
  };
  automation: {
    view_automation: boolean;
    edit_automation: boolean;
    manage_ai_settings: boolean;
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
    scheduling: {
      view_calendar: false,
      create_appointments: false,
      assign_crew: false,
      manage_dispatch: false,
    },
    estimates: {
      create_estimate: false,
      edit_estimate: false,
      approve_estimate: false,
      send_estimate: false,
    },
    reporting: {
      view_reports: false,
      export_reports: false,
      view_financial_reports: false,
    },
    field_operations: {
      upload_photos: false,
      complete_tasks: false,
      mark_job_complete: false,
      request_supplements: false,
    },
    integrations: {
      manage_eagleview: false,
      manage_material_orders: false,
      manage_quickbooks: false,
    },
    automation: {
      view_automation: false,
      edit_automation: false,
      manage_ai_settings: false,
    },
  };
};

export const getRoleTemplates = async () => {
  const response = await axios.get(`${API_URL}/role-templates`);
  return {
    success: true,
    data: response.data
  };
};

export const createRoleFromTemplate = async (templateId: string, customData?: { name?: string; description?: string; permissions?: Partial<RolePermissions> }) => {
  const response = await axios.post(`${API_URL}/roles/from-template`, {
    templateId,
    ...customData
  });
  return {
    success: true,
    data: response.data
  };
};

export const assignRoleToStaffMember = async (staffId: string, roleId: string) => {
  const response = await axios.post(`${API_URL}/staff/${staffId}/assign-role`, { roleId });
  return {
    success: true,
    data: response.data
  };
};
