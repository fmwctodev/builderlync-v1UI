import { supabase, getCurrentUserId } from '../../lib/supabase';

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
  if (!supabase) {
    console.error('Supabase client not initialized');
    return {
      success: false,
      data: [],
      error: new Error('Supabase client not initialized')
    };
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('User not authenticated - returning empty roles list');
      return {
        success: true,
        data: []
      };
    }

    console.log('Fetching roles for organization:', userId);

    const { data, error } = await supabase
      .from('organization_roles')
      .select('*')
      .eq('organization_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roles from Supabase:', error);
      return {
        success: false,
        data: [],
        error
      };
    }

    console.log('Fetched roles:', data?.length || 0, 'roles found');

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Exception in getRoles:', error);
    return {
      success: false,
      data: [],
      error
    };
  }
};

export const getRole = async (id: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('organization_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getRole:', error);
    return {
      success: false,
      data: null,
      error
    };
  }
};

export const createRole = async (roleData: CreateRoleData) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('organization_roles')
      .insert({
        organization_id: userId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        is_custom: true,
        is_deletable: true,
        is_default: false,
        staff_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in createRole:', error);
    return {
      success: false,
      data: null,
      error
    };
  }
};

export const updateRole = async (id: string, roleData: Partial<CreateRoleData>) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (roleData.name) updateData.name = roleData.name;
    if (roleData.description) updateData.description = roleData.description;
    if (roleData.permissions) updateData.permissions = roleData.permissions;

    const { data, error } = await supabase
      .from('organization_roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in updateRole:', error);
    return {
      success: false,
      data: null,
      error
    };
  }
};

export const deleteRole = async (id: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { error } = await supabase
      .from('organization_roles')
      .delete()
      .eq('id', id)
      .eq('is_deletable', true);

    if (error) throw error;

    return {
      success: true,
      data: { id }
    };
  } catch (error) {
    console.error('Error in deleteRole:', error);
    return {
      success: false,
      error
    };
  }
};

export const assignRoleToStaff = async (staffId: string | number, roleId: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const staffIdStr = String(staffId);

    const { data, error } = await supabase
      .from('staff_role_assignments')
      .insert({
        staff_id: staffIdStr,
        role_id: roleId,
        assigned_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    const { data: currentRole } = await supabase
      .from('organization_roles')
      .select('staff_count')
      .eq('id', roleId)
      .single();

    if (currentRole) {
      await supabase
        .from('organization_roles')
        .update({ staff_count: (currentRole.staff_count || 0) + 1 })
        .eq('id', roleId);
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in assignRoleToStaff:', error);
    return {
      success: false,
      error
    };
  }
};

export const removeRoleFromStaff = async (staffId: string | number, roleId: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const staffIdStr = String(staffId);

    const { error } = await supabase
      .from('staff_role_assignments')
      .delete()
      .eq('staff_id', staffIdStr)
      .eq('role_id', roleId);

    if (error) throw error;

    const { data: currentRole } = await supabase
      .from('organization_roles')
      .select('staff_count')
      .eq('id', roleId)
      .single();

    if (currentRole) {
      const newCount = Math.max((currentRole.staff_count || 0) - 1, 0);
      await supabase
        .from('organization_roles')
        .update({ staff_count: newCount })
        .eq('id', roleId);
    }

    return {
      success: true,
      data: { staffId: staffIdStr, roleId }
    };
  } catch (error) {
    console.error('Error in removeRoleFromStaff:', error);
    return {
      success: false,
      error
    };
  }
};

export const getStaffRoles = async (staffId: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('staff_role_assignments')
      .select(`
        *,
        role:organization_roles(*)
      `)
      .eq('staff_id', staffId);

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error in getStaffRoles:', error);
    return {
      success: false,
      data: [],
      error
    };
  }
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
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('role_templates')
      .select('*')
      .eq('is_active', true)
      .order('role_type', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error in getRoleTemplates:', error);
    return {
      success: false,
      data: [],
      error
    };
  }
};

export const createRoleFromTemplate = async (templateId: string, customData?: { name?: string; description?: string; permissions?: Partial<RolePermissions> }) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data: template, error: templateError } = await supabase
      .from('role_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    const mergedPermissions = customData?.permissions
      ? { ...template.permissions, ...customData.permissions }
      : template.permissions;

    const { data, error } = await supabase
      .from('organization_roles')
      .insert({
        organization_id: userId,
        template_id: templateId,
        name: customData?.name || template.name,
        description: customData?.description || template.description,
        permissions: mergedPermissions,
        is_custom: false,
        is_deletable: true,
        is_default: false,
        staff_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in createRoleFromTemplate:', error);
    return {
      success: false,
      data: null,
      error
    };
  }
};

export const assignRoleToStaffMember = async (staffId: string | number, roleId: string) => {
  return assignRoleToStaff(staffId, roleId);
};
