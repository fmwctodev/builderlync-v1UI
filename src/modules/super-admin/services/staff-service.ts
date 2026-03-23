import { supabase } from './supabase-client';
import {
  SuperAdminStaff,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffFilters,
} from '../types/settings';

export interface StaffListResponse {
  data: SuperAdminStaff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getSuperAdminStaff(
  filters: StaffFilters = {}
): Promise<{ success: boolean; data?: StaffListResponse; error?: string }> {
  try {
    const {
      search = '',
      status,
      role_id,
      page = 1,
      limit = 10,
    } = filters;

    let query = supabase
      .from('super_admin_staff')
      .select('*, super_admin_staff_role_assignments(role_id, super_admin_roles(*))', {
        count: 'exact',
      });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (role_id) {
      query = query.eq('super_admin_staff_role_assignments.role_id', role_id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const staffData: SuperAdminStaff[] = (data || []).map((staff: any) => ({
      ...staff,
      roles: staff.super_admin_staff_role_assignments?.map(
        (assignment: any) => assignment.super_admin_roles
      ),
    }));

    return {
      success: true,
      data: {
        data: staffData,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
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
    const { data, error } = await supabase
      .from('super_admin_staff')
      .select('*, super_admin_staff_role_assignments(role_id, super_admin_roles(*))')
      .eq('id', id)
      .single();

    if (error) throw error;

    const staffData: SuperAdminStaff = {
      ...data,
      roles: data.super_admin_staff_role_assignments?.map(
        (assignment: any) => assignment.super_admin_roles
      ),
    };

    return { success: true, data: staffData };
  } catch (error: any) {
    console.error('Error fetching staff by ID:', error);
    return { success: false, error: error.message };
  }
}

export async function createSuperAdminStaff(
  request: CreateStaffRequest
): Promise<{ success: boolean; data?: SuperAdminStaff; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('super_admin_staff')
      .insert({
        email: request.email,
        first_name: request.first_name,
        last_name: request.last_name,
        phone: request.phone,
        invited_by: userData.user?.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    if (request.role_id) {
      const { error: roleError } = await supabase
        .from('super_admin_staff_role_assignments')
        .insert({
          staff_id: data.id,
          role_id: request.role_id,
          assigned_by: userData.user?.id,
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSuperAdminStaff(
  id: string,
  request: UpdateStaffRequest
): Promise<{ success: boolean; data?: SuperAdminStaff; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_staff')
      .update(request)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating super admin staff:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSuperAdminStaff(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_staff')
      .delete()
      .eq('id', id);

    if (error) throw error;

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
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { error } = await supabase
      .from('super_admin_staff_role_assignments')
      .insert({
        staff_id: staffId,
        role_id: roleId,
        assigned_by: userData.user?.id,
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning role to staff:', error);
    return { success: false, error: error.message };
  }
}

export async function removeRoleFromStaff(
  staffId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_staff_role_assignments')
      .delete()
      .eq('staff_id', staffId)
      .eq('role_id', roleId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error removing role from staff:', error);
    return { success: false, error: error.message };
  }
}
