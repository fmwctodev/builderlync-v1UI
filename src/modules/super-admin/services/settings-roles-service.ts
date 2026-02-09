import { supabase } from './supabase-client';
import {
  SuperAdminRoleTemplate,
  SuperAdminRole,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/settings';

export async function getRoleTemplates(): Promise<{
  success: boolean;
  data?: SuperAdminRoleTemplate[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_role_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching role templates:', error);
    return { success: false, error: error.message };
  }
}

export async function getSuperAdminRoles(): Promise<{
  success: boolean;
  data?: SuperAdminRole[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_roles')
      .select('*, template:super_admin_role_templates(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching super admin roles:', error);
    return { success: false, error: error.message };
  }
}

export async function getRoleById(
  id: string
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_roles')
      .select('*, template:super_admin_role_templates(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching role by ID:', error);
    return { success: false, error: error.message };
  }
}

export async function createRole(
  request: CreateRoleRequest
): Promise<{ success: boolean; data?: SuperAdminRole; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_roles')
      .insert({
        template_id: request.template_id,
        name: request.name,
        description: request.description,
        permissions: request.permissions,
        is_custom: request.is_custom || false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
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
    const { data: template, error: templateError } = await supabase
      .from('super_admin_role_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    const { data, error } = await supabase
      .from('super_admin_roles')
      .insert({
        template_id: templateId,
        name: customName || template.name,
        description: template.description,
        permissions: template.permissions,
        is_custom: false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
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
    const { data, error } = await supabase
      .from('super_admin_roles')
      .update(request)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteRole(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: role, error: roleError } = await supabase
      .from('super_admin_roles')
      .select('is_deletable')
      .eq('id', id)
      .single();

    if (roleError) throw roleError;

    if (!role.is_deletable) {
      throw new Error('This role cannot be deleted');
    }

    const { error } = await supabase
      .from('super_admin_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;

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
