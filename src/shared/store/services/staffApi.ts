import { supabase, hasValidSession, waitForAuth, getCurrentUserId } from '../../lib/supabase';

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  title?: string;
  department?: string;
  image?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  title?: string;
  department?: string;
  image?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface StaffMember {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  extension: string;
  image?: string;
  status: string;
  title?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data: StaffMember;
}

export interface StaffListResponse {
  success: boolean;
  data: {
    data: StaffMember[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export const getStaff = async (page: number = 1, limit: number = 100): Promise<StaffListResponse> => {
  try {
    await waitForAuth();

    const hasSession = await hasValidSession();
    if (!hasSession) {
      console.warn('⚠️ getStaff: No valid session found - user needs to authenticate');
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 100,
            totalPages: 0,
            totalItems: 0
          }
        }
      };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('❌ getStaff: Could not get user ID from session');
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 100,
            totalPages: 0,
            totalItems: 0
          }
        }
      };
    }

    console.log('🔍 Fetching staff for user:', userId);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('first_name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('❌ Error fetching staff:', error);
      throw error;
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    console.log('✅ Fetched', data?.length || 0, 'staff members');

    return {
      success: true,
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          totalPages,
          totalItems
        }
      }
    };
  } catch (error) {
    console.error('❌ Error in getStaff:', error);
    return {
      success: false,
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 100,
          totalPages: 0,
          totalItems: 0
        }
      }
    };
  }
};

export const getAllActiveStaff = async (): Promise<StaffMember[]> => {
  try {
    let user = null;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.session?.user) {
        console.warn('User not authenticated when fetching all active staff');
        return [];
      }

      user = refreshData.session.user;
    } else {
      user = userData.user;
    }

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'active')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching all active staff:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllActiveStaff:', error);
    return [];
  }
};

export const createStaff = async (staffData: CreateStaffRequest): Promise<StaffResponse> => {
  try {
    let user = null;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.warn('Initial auth check failed, attempting to refresh session...');

      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.session?.user) {
        console.error('Session refresh failed:', refreshError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      user = refreshData.session.user;
    } else {
      user = userData.user;
    }

    if (!user) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const { data, error } = await supabase
      .from('staff')
      .insert({
        first_name: staffData.firstName,
        last_name: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        extension: staffData.extension,
        title: staffData.title,
        department: staffData.department,
        image: staffData.image,
        status: 'active',
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating staff:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Staff member created successfully',
      data: data as StaffMember
    };
  } catch (error: any) {
    console.error('Error in createStaff:', error);
    return {
      success: false,
      message: error.message || 'Failed to create staff member',
      data: {} as StaffMember
    };
  }
};

export const updateStaff = async (id: string, staffData: UpdateStaffRequest): Promise<StaffResponse> => {
  try {
    let user = null;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.session?.user) {
        console.error('Session refresh failed:', refreshError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      user = refreshData.session.user;
    } else {
      user = userData.user;
    }

    if (!user) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const { data, error } = await supabase
      .from('staff')
      .update({
        first_name: staffData.firstName,
        last_name: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone,
        extension: staffData.extension,
        title: staffData.title,
        department: staffData.department,
        image: staffData.image,
        status: staffData.status || 'active'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating staff:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Staff member updated successfully',
      data: data as StaffMember
    };
  } catch (error: any) {
    console.error('Error in updateStaff:', error);
    return {
      success: false,
      message: error.message || 'Failed to update staff member',
      data: {} as StaffMember
    };
  }
};

export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    let user = null;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.session?.user) {
        console.error('Session refresh failed:', refreshError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      user = refreshData.session.user;
    } else {
      user = userData.user;
    }

    if (!user) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Staff member deleted successfully'
    };
  } catch (error: any) {
    console.error('Error in deleteStaff:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete staff member'
    };
  }
};

export const getStaffById = async (id: string): Promise<StaffMember | null> => {
  try {
    let user = null;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.session?.user) {
        console.warn('User not authenticated when fetching staff by ID');
        return null;
      }

      user = refreshData.session.user;
    } else {
      user = userData.user;
    }

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching staff by ID:', error);
      throw error;
    }

    return data as StaffMember;
  } catch (error) {
    console.error('Error in getStaffById:', error);
    return null;
  }
};
