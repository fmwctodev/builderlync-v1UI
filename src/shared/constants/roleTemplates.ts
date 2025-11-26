export interface ExtendedRolePermissions {
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

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  role_type: string;
  permissions: ExtendedRolePermissions;
  ideal_for: string[];
  is_system_template: boolean;
  is_active: boolean;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system control with all permissions',
    role_type: 'admin',
    ideal_for: ['Owner', 'CEO', 'COO', 'Ops Director'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      jobs: { view: true, create: true, edit: true, delete: true, manage_status: true },
      financial: { view_billing: true, manage_billing: true, view_payments: true, process_payments: true, export_data: true },
      staff: { view: true, add: true, edit: true, delete: true, assign_roles: true },
      system: { manage_integrations: true, view_audit_logs: true, export_data: true, manage_brand: true },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: true },
      scheduling: { view_calendar: true, create_appointments: true, assign_crew: true, manage_dispatch: true },
      estimates: { create_estimate: true, edit_estimate: true, approve_estimate: true, send_estimate: true },
      reporting: { view_reports: true, export_reports: true, view_financial_reports: true },
      field_operations: { upload_photos: true, complete_tasks: true, mark_job_complete: true, request_supplements: true },
      integrations: { manage_eagleview: true, manage_material_orders: true, manage_quickbooks: true },
      automation: { view_automation: true, edit_automation: true, manage_ai_settings: true },
    },
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'High-level operational control',
    role_type: 'manager',
    ideal_for: ['Office Manager', 'GM', 'Ops Manager'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: false, export: true },
      jobs: { view: true, create: true, edit: true, delete: false, manage_status: true },
      financial: { view_billing: false, manage_billing: false, view_payments: true, process_payments: false, export_data: false },
      staff: { view: true, add: true, edit: true, delete: false, assign_roles: true },
      system: { manage_integrations: false, view_audit_logs: false, export_data: true, manage_brand: false },
      communications: { send_messages: true, manage_templates: true, view_conversations: true },
      marketing: { manage_campaigns: true, view_analytics: true, manage_automation: false },
      scheduling: { view_calendar: true, create_appointments: true, assign_crew: true, manage_dispatch: true },
      estimates: { create_estimate: true, edit_estimate: true, approve_estimate: true, send_estimate: true },
      reporting: { view_reports: true, export_reports: true, view_financial_reports: false },
      field_operations: { upload_photos: true, complete_tasks: true, mark_job_complete: true, request_supplements: true },
      integrations: { manage_eagleview: true, manage_material_orders: true, manage_quickbooks: false },
      automation: { view_automation: true, edit_automation: false, manage_ai_settings: false },
    },
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Pipeline and quoting focused',
    role_type: 'sales',
    ideal_for: ['Sales Rep', 'Canvasser', 'Account Executive'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      jobs: { view: true, create: true, edit: true, delete: false, manage_status: false },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: false, view_conversations: true },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
      scheduling: { view_calendar: true, create_appointments: true, assign_crew: false, manage_dispatch: false },
      estimates: { create_estimate: true, edit_estimate: true, approve_estimate: false, send_estimate: true },
      reporting: { view_reports: false, export_reports: false, view_financial_reports: false },
      field_operations: { upload_photos: true, complete_tasks: true, mark_job_complete: false, request_supplements: false },
      integrations: { manage_eagleview: true, manage_material_orders: false, manage_quickbooks: false },
      automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
    },
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Field and production operations',
    role_type: 'project_manager',
    ideal_for: ['PM', 'Production Manager', 'Crew Lead'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: false, edit: false, delete: false, export: false },
      jobs: { view: true, create: false, edit: true, delete: false, manage_status: true },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: true, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: false, view_conversations: true },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
      scheduling: { view_calendar: true, create_appointments: true, assign_crew: true, manage_dispatch: true },
      estimates: { create_estimate: false, edit_estimate: false, approve_estimate: false, send_estimate: false },
      reporting: { view_reports: true, export_reports: false, view_financial_reports: false },
      field_operations: { upload_photos: true, complete_tasks: true, mark_job_complete: true, request_supplements: true },
      integrations: { manage_eagleview: false, manage_material_orders: true, manage_quickbooks: false },
      automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
    },
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial, billing, and collections',
    role_type: 'finance',
    ideal_for: ['Accounting', 'Bookkeeper'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: false, edit: false, delete: false, export: true },
      jobs: { view: true, create: false, edit: false, delete: false, manage_status: false },
      financial: { view_billing: true, manage_billing: true, view_payments: true, process_payments: true, export_data: true },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: true, manage_brand: false },
      communications: { send_messages: false, manage_templates: false, view_conversations: false },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
      scheduling: { view_calendar: false, create_appointments: false, assign_crew: false, manage_dispatch: false },
      estimates: { create_estimate: false, edit_estimate: false, approve_estimate: false, send_estimate: false },
      reporting: { view_reports: true, export_reports: true, view_financial_reports: true },
      field_operations: { upload_photos: false, complete_tasks: false, mark_job_complete: false, request_supplements: false },
      integrations: { manage_eagleview: false, manage_material_orders: false, manage_quickbooks: true },
      automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
    },
  },
  {
    id: 'office_dispatcher',
    name: 'Office/Dispatcher',
    description: 'Inbound/outbound call and scheduling',
    role_type: 'office_dispatcher',
    ideal_for: ['CSR', 'Appointment Setter'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      jobs: { view: true, create: true, edit: false, delete: false, manage_status: false },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: true, manage_templates: false, view_conversations: true },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
      scheduling: { view_calendar: true, create_appointments: true, assign_crew: false, manage_dispatch: true },
      estimates: { create_estimate: false, edit_estimate: false, approve_estimate: false, send_estimate: false },
      reporting: { view_reports: false, export_reports: false, view_financial_reports: false },
      field_operations: { upload_photos: false, complete_tasks: true, mark_job_complete: false, request_supplements: false },
      integrations: { manage_eagleview: false, manage_material_orders: false, manage_quickbooks: false },
      automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
    },
  },
  {
    id: 'field_tech',
    name: 'Field Tech',
    description: 'Minimal on-site functionality',
    role_type: 'field_tech',
    ideal_for: ['Installer', 'Foreman', 'Inspector'],
    is_system_template: true,
    is_active: true,
    permissions: {
      contacts: { view: false, create: false, edit: false, delete: false, export: false },
      jobs: { view: true, create: false, edit: false, delete: false, manage_status: false },
      financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
      staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
      system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
      communications: { send_messages: false, manage_templates: false, view_conversations: false },
      marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
      scheduling: { view_calendar: false, create_appointments: false, assign_crew: false, manage_dispatch: false },
      estimates: { create_estimate: false, edit_estimate: false, approve_estimate: false, send_estimate: false },
      reporting: { view_reports: false, export_reports: false, view_financial_reports: false },
      field_operations: { upload_photos: true, complete_tasks: true, mark_job_complete: false, request_supplements: false },
      integrations: { manage_eagleview: false, manage_material_orders: false, manage_quickbooks: false },
      automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
    },
  },
];

export const getRoleTemplateByType = (roleType: string): RoleTemplate | undefined => {
  return ROLE_TEMPLATES.find((template) => template.role_type === roleType);
};

export const getDefaultExtendedPermissions = (): ExtendedRolePermissions => {
  return {
    contacts: { view: false, create: false, edit: false, delete: false, export: false },
    jobs: { view: false, create: false, edit: false, delete: false, manage_status: false },
    financial: { view_billing: false, manage_billing: false, view_payments: false, process_payments: false, export_data: false },
    staff: { view: false, add: false, edit: false, delete: false, assign_roles: false },
    system: { manage_integrations: false, view_audit_logs: false, export_data: false, manage_brand: false },
    communications: { send_messages: false, manage_templates: false, view_conversations: false },
    marketing: { manage_campaigns: false, view_analytics: false, manage_automation: false },
    scheduling: { view_calendar: false, create_appointments: false, assign_crew: false, manage_dispatch: false },
    estimates: { create_estimate: false, edit_estimate: false, approve_estimate: false, send_estimate: false },
    reporting: { view_reports: false, export_reports: false, view_financial_reports: false },
    field_operations: { upload_photos: false, complete_tasks: false, mark_job_complete: false, request_supplements: false },
    integrations: { manage_eagleview: false, manage_material_orders: false, manage_quickbooks: false },
    automation: { view_automation: false, edit_automation: false, manage_ai_settings: false },
  };
};
