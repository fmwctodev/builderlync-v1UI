import { supabase } from '../../lib/supabase';

export interface CalendarGroup {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  calendar_count?: number;
}

export interface Calendar {
  id: string;
  name: string;
  group_id?: string;
  duration: number;
  type: 'personal' | 'round-robin' | 'event';
  status: 'active' | 'inactive';
  owner_id: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  contact_id?: string;
  status: 'upcoming' | 'cancelled' | 'completed';
  appointment_time: string;
  end_time: string;
  calendar_id: string;
  owner_id: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  contacts?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  calendars?: {
    name: string;
    color: string;
  };
  staff?: {
    first_name: string;
    last_name: string;
  };
}

export interface ServiceMenuItem {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  calendar_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

// Calendar Groups API
export const getCalendarGroups = async (): Promise<CalendarGroup[]> => {
  const { data: groups, error: groupsError } = await supabase
    .from('calendar_groups')
    .select('*')
    .order('name');

  if (groupsError) throw groupsError;

  // Get calendar counts for each group
  const groupsWithCounts = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from('calendars')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      return { ...group, calendar_count: count || 0 };
    })
  );

  return groupsWithCounts;
};

export const createCalendarGroup = async (group: Omit<CalendarGroup, 'id' | 'created_at' | 'updated_at' | 'calendar_count'>): Promise<CalendarGroup> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendar_groups')
    .insert([{ ...group, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCalendarGroup = async (id: string, updates: Partial<CalendarGroup>): Promise<CalendarGroup> => {
  const { data, error } = await supabase
    .from('calendar_groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCalendarGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Calendars API
export const getCalendars = async (filters?: {
  status?: string;
  type?: string;
  owner_id?: string;
  group_id?: string;
}): Promise<Calendar[]> => {
  let query = supabase
    .from('calendars')
    .select('*, calendar_groups(name)');

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }
  if (filters?.group_id) {
    query = query.eq('group_id', filters.group_id);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createCalendar = async (calendar: Omit<Calendar, 'id' | 'created_at' | 'updated_at'>): Promise<Calendar> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendars')
    .insert([{ ...calendar, owner_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCalendar = async (id: string, updates: Partial<Calendar>): Promise<Calendar> => {
  const { data, error } = await supabase
    .from('calendars')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCalendar = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendars')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Appointments API
export const getAppointments = async (filters?: {
  status?: string;
  calendar_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Appointment[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      calendars(name, color),
      contacts(id, first_name, last_name, email)
    `);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.calendar_id) {
    query = query.eq('calendar_id', filters.calendar_id);
  }
  if (filters?.start_date) {
    query = query.gte('appointment_time', filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte('appointment_time', filters.end_date);
  }

  const { data: appointments, error } = await query.order('appointment_time', { ascending: true });

  if (error) throw error;

  if (!appointments || appointments.length === 0) return [];

  const ownerIds = [...new Set(appointments.map(apt => apt.owner_id))];

  const { data: staffMembers } = await supabase
    .from('staff')
    .select('user_id, first_name, last_name')
    .in('user_id', ownerIds);

  const staffMap = new Map(
    (staffMembers || []).map(staff => [staff.user_id, staff])
  );

  const enrichedAppointments = appointments.map(appointment => ({
    ...appointment,
    staff: staffMap.get(appointment.owner_id) || undefined
  }));

  return enrichedAppointments;
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...appointment, owner_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Service Menu API
export const getServiceMenuItems = async (): Promise<ServiceMenuItem[]> => {
  const { data, error } = await supabase
    .from('service_menu_items')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createServiceMenuItem = async (item: Omit<ServiceMenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceMenuItem> => {
  const { data, error } = await supabase
    .from('service_menu_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateServiceMenuItem = async (id: string, updates: Partial<ServiceMenuItem>): Promise<ServiceMenuItem> => {
  const { data, error } = await supabase
    .from('service_menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteServiceMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Rooms API
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Equipment API
export const getEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createEquipment = async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .insert([equipment])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
