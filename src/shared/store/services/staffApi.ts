import { supabase } from '../../lib/supabase';

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
  data: StaffMember[];
  total: number;
}

export const getStaff = async (page: number = 1, limit: number = 100): Promise<StaffListResponse> => {
  try {
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      throw new Error('Not authenticated');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('first_name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getStaff:', error);
    return {
      success: false,
      data: [],
      total: 0
    };
  }
};

export const getAllActiveStaff = async (): Promise<StaffMember[]> => {
  try {
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
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      throw new Error('Not authenticated');
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
        created_by: session.session.user.id
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
    return {
      success: false,
      message: error.message || 'Failed to create staff member',
      data: {} as StaffMember
    };
  }
};

export const updateStaff = async (id: string, staffData: UpdateStaffRequest): Promise<StaffResponse> => {
  try {
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      throw new Error('Not authenticated');
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
    return {
      success: false,
      message: error.message || 'Failed to update staff member',
      data: {} as StaffMember
    };
  }
};

export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      throw new Error('Not authenticated');
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
    return {
      success: false,
      message: error.message || 'Failed to delete staff member'
    };
  }
};

export const getStaffById = async (id: string): Promise<StaffMember | null> => {
  try {
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
