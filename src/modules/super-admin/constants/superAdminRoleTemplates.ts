export interface SuperAdminPermissions {
  overview: {
    view: boolean;
    export: boolean;
  };
  accounts: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage_billing: boolean;
    suspend: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage_roles: boolean;
    impersonate: boolean;
  };
  billing: {
    view: boolean;
    edit_plans: boolean;
    process_payments: boolean;
    refunds: boolean;
    export: boolean;
  };
  usage: {
    view: boolean;
    edit_limits: boolean;
    export: boolean;
  };
  features: {
    view: boolean;
    toggle_flags: boolean;
    manage_overrides: boolean;
  };
  integrations: {
    view: boolean;
    manage: boolean;
    view_health: boolean;
    test_connections: boolean;
  };
  security: {
    view_audit: boolean;
    manage_permissions: boolean;
    view_sessions: boolean;
    force_logout: boolean;
  };
  support: {
    view: boolean;
    create: boolean;
    edit: boolean;
    close: boolean;
    assign: boolean;
    manage_feedback: boolean;
  };
  system: {
    view_health: boolean;
    manage_settings: boolean;
    view_logs: boolean;
    deploy: boolean;
  };
  settings: {
    view: boolean;
    manage_staff: boolean;
    manage_roles: boolean;
    system_config: boolean;
  };
}

export interface SuperAdminRoleTemplate {
  id: string;
  name: string;
  description: string;
  role_type: string;
  ideal_for: string[];
  permissions: SuperAdminPermissions;
}

export const SUPER_ADMIN_ROLE_TEMPLATES: SuperAdminRoleTemplate[] = [
  {
    id: 'company_admin',
    name: 'Company Admin',
    description: 'Full system control with all permissions across all super admin modules',
    role_type: 'company_admin',
    ideal_for: ['Platform Owner', 'CEO', 'CTO', 'Operations Director'],
    permissions: {
      overview: { view: true, export: true },
      accounts: { view: true, create: true, edit: true, delete: true, manage_billing: true, suspend: true },
      users: { view: true, create: true, edit: true, delete: true, manage_roles: true, impersonate: true },
      billing: { view: true, edit_plans: true, process_payments: true, refunds: true, export: true },
      usage: { view: true, edit_limits: true, export: true },
      features: { view: true, toggle_flags: true, manage_overrides: true },
      integrations: { view: true, manage: true, view_health: true, test_connections: true },
      security: { view_audit: true, manage_permissions: true, view_sessions: true, force_logout: true },
      support: { view: true, create: true, edit: true, close: true, assign: true, manage_feedback: true },
      system: { view_health: true, manage_settings: true, view_logs: true, deploy: true },
      settings: { view: true, manage_staff: true, manage_roles: true, system_config: true },
    },
  },
  {
    id: 'support_admin',
    name: 'Support Admin',
    description: 'Full support operations with elevated access to accounts and users',
    role_type: 'support_admin',
    ideal_for: ['Support Team Lead', 'Customer Success Manager'],
    permissions: {
      overview: { view: true, export: false },
      accounts: { view: true, create: false, edit: true, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: true, delete: false, manage_roles: false, impersonate: true },
      billing: { view: true, edit_plans: false, process_payments: false, refunds: false, export: false },
      usage: { view: true, edit_limits: false, export: false },
      features: { view: true, toggle_flags: false, manage_overrides: false },
      integrations: { view: true, manage: false, view_health: true, test_connections: false },
      security: { view_audit: true, manage_permissions: false, view_sessions: true, force_logout: false },
      support: { view: true, create: true, edit: true, close: true, assign: true, manage_feedback: true },
      system: { view_health: true, manage_settings: false, view_logs: true, deploy: false },
      settings: { view: true, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'support_user',
    name: 'Support User',
    description: 'Basic support ticket management with view-only access to accounts',
    role_type: 'support_user',
    ideal_for: ['Support Agent', 'Help Desk Specialist'],
    permissions: {
      overview: { view: true, export: false },
      accounts: { view: true, create: false, edit: false, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: false, edit_plans: false, process_payments: false, refunds: false, export: false },
      usage: { view: true, edit_limits: false, export: false },
      features: { view: false, toggle_flags: false, manage_overrides: false },
      integrations: { view: false, manage: false, view_health: false, test_connections: false },
      security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: true, create: true, edit: true, close: false, assign: false, manage_feedback: false },
      system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
      settings: { view: false, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'sales_admin',
    name: 'Sales Admin',
    description: 'Full sales operations with account management and team oversight',
    role_type: 'sales_admin',
    ideal_for: ['Sales Director', 'Account Manager', 'Sales Team Lead'],
    permissions: {
      overview: { view: true, export: true },
      accounts: { view: true, create: true, edit: true, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: true, edit_plans: false, process_payments: false, refunds: false, export: true },
      usage: { view: true, edit_limits: false, export: true },
      features: { view: true, toggle_flags: false, manage_overrides: false },
      integrations: { view: true, manage: false, view_health: false, test_connections: false },
      security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: true, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
      settings: { view: true, manage_staff: true, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'sales_user',
    name: 'Sales User',
    description: 'Basic sales operations with account viewing and editing',
    role_type: 'sales_user',
    ideal_for: ['Sales Representative', 'Account Executive'],
    permissions: {
      overview: { view: true, export: false },
      accounts: { view: true, create: true, edit: true, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: true, edit_plans: false, process_payments: false, refunds: false, export: false },
      usage: { view: true, edit_limits: false, export: false },
      features: { view: false, toggle_flags: false, manage_overrides: false },
      integrations: { view: false, manage: false, view_health: false, test_connections: false },
      security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: false, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
      settings: { view: false, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'developer_admin',
    name: 'Developer Admin',
    description: 'Full development access including integrations, API, and system management',
    role_type: 'developer_admin',
    ideal_for: ['Lead Developer', 'DevOps Engineer', 'System Architect'],
    permissions: {
      overview: { view: true, export: true },
      accounts: { view: true, create: false, edit: false, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: false, edit_plans: false, process_payments: false, refunds: false, export: false },
      usage: { view: true, edit_limits: false, export: true },
      features: { view: true, toggle_flags: true, manage_overrides: true },
      integrations: { view: true, manage: true, view_health: true, test_connections: true },
      security: { view_audit: true, manage_permissions: false, view_sessions: true, force_logout: false },
      support: { view: true, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: true, manage_settings: true, view_logs: true, deploy: true },
      settings: { view: true, manage_staff: false, manage_roles: false, system_config: true },
    },
  },
  {
    id: 'developer_user',
    name: 'Developer User',
    description: 'Read-only development access to integrations and system health',
    role_type: 'developer_user',
    ideal_for: ['Junior Developer', 'QA Engineer', 'Technical Support'],
    permissions: {
      overview: { view: true, export: false },
      accounts: { view: true, create: false, edit: false, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: false, edit_plans: false, process_payments: false, refunds: false, export: false },
      usage: { view: true, edit_limits: false, export: false },
      features: { view: true, toggle_flags: false, manage_overrides: false },
      integrations: { view: true, manage: false, view_health: true, test_connections: false },
      security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: true, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: true, manage_settings: false, view_logs: true, deploy: false },
      settings: { view: false, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'accounting_admin',
    name: 'Accounting Admin',
    description: 'Full financial access including billing, payments, and financial reporting',
    role_type: 'accounting_admin',
    ideal_for: ['CFO', 'Controller', 'Accounting Manager'],
    permissions: {
      overview: { view: true, export: true },
      accounts: { view: true, create: false, edit: false, delete: false, manage_billing: true, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: true, edit_plans: true, process_payments: true, refunds: true, export: true },
      usage: { view: true, edit_limits: false, export: true },
      features: { view: false, toggle_flags: false, manage_overrides: false },
      integrations: { view: true, manage: false, view_health: false, test_connections: false },
      security: { view_audit: true, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: true, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
      settings: { view: true, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
  {
    id: 'accounting_user',
    name: 'Accounting User',
    description: 'View-only financial access to billing and reports',
    role_type: 'accounting_user',
    ideal_for: ['Bookkeeper', 'Accounts Receivable', 'Junior Accountant'],
    permissions: {
      overview: { view: true, export: false },
      accounts: { view: true, create: false, edit: false, delete: false, manage_billing: false, suspend: false },
      users: { view: true, create: false, edit: false, delete: false, manage_roles: false, impersonate: false },
      billing: { view: true, edit_plans: false, process_payments: false, refunds: false, export: true },
      usage: { view: true, edit_limits: false, export: false },
      features: { view: false, toggle_flags: false, manage_overrides: false },
      integrations: { view: false, manage: false, view_health: false, test_connections: false },
      security: { view_audit: false, manage_permissions: false, view_sessions: false, force_logout: false },
      support: { view: false, create: false, edit: false, close: false, assign: false, manage_feedback: false },
      system: { view_health: false, manage_settings: false, view_logs: false, deploy: false },
      settings: { view: false, manage_staff: false, manage_roles: false, system_config: false },
    },
  },
];

export const countSuperAdminPermissions = (permissions: SuperAdminPermissions): number => {
  let count = 0;
  Object.values(permissions).forEach((category) => {
    Object.values(category).forEach((value) => {
      if (value === true) count++;
    });
  });
  return count;
};

export const getSuperAdminRoleTemplateById = (id: string): SuperAdminRoleTemplate | undefined => {
  return SUPER_ADMIN_ROLE_TEMPLATES.find((template) => template.id === id);
};

export const getSuperAdminRoleTemplateBadgeColor = (roleName: string): string => {
  const lowerName = roleName.toLowerCase();

  if (lowerName.includes('company') || lowerName.includes('admin') && lowerName.includes('company')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
  if (lowerName.includes('support')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
  if (lowerName.includes('sales')) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  }
  if (lowerName.includes('developer')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
  if (lowerName.includes('accounting')) {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
  }

  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};
