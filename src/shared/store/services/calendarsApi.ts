import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

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
  cal_url?: string | null;
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
    full_name?: string;
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

export const getCalendarGroups = async (): Promise<CalendarGroup[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/profile/calendar-groups`, {
    headers: getAuthHeaders(),
  });
  return data?.data || [];
};

export const createCalendarGroup = async (
  group: Omit<CalendarGroup, 'id' | 'created_at' | 'updated_at' | 'calendar_count' | 'user_id'>
): Promise<CalendarGroup> => {
  const { data } = await axios.post(`${API_BASE_URL}/profile/calendar-groups`, group, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const updateCalendarGroup = async (id: string, updates: Partial<CalendarGroup>): Promise<CalendarGroup> => {
  const { data } = await axios.put(`${API_BASE_URL}/profile/calendar-groups/${id}`, updates, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const deleteCalendarGroup = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/profile/calendar-groups/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const getCalendars = async (filters?: {
  status?: string;
  type?: string;
  owner_id?: string;
  group_id?: string;
}): Promise<Calendar[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.owner_id) params.set('owner_id', filters.owner_id);
  if (filters?.group_id) params.set('group_id', filters.group_id);

  const { data } = await axios.get(`${API_BASE_URL}/profile/calendars?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return data?.data || [];
};

export const createCalendar = async (calendar: Omit<Calendar, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<Calendar> => {
  const { data } = await axios.post(`${API_BASE_URL}/profile/calendars`, calendar, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const updateCalendar = async (id: string, updates: Partial<Calendar>): Promise<Calendar> => {
  const { data } = await axios.put(`${API_BASE_URL}/profile/calendars/${id}`, updates, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const deleteCalendar = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/profile/calendars/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const getAppointments = async (filters?: {
  status?: string;
  calendar_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Appointment[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.calendar_id) params.set('calendar_id', filters.calendar_id);
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);

  const { data } = await axios.get(`${API_BASE_URL}/profile/appointments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return data?.data || [];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<Appointment> => {
  const { data } = await axios.post(`${API_BASE_URL}/profile/appointments`, appointment, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const { data } = await axios.put(`${API_BASE_URL}/profile/appointments/${id}`, updates, {
    headers: getAuthHeaders(),
  });
  return data?.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/profile/appointments/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const getServiceMenuItems = async (): Promise<ServiceMenuItem[]> => [];
export const createServiceMenuItem = async (_item: Omit<ServiceMenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceMenuItem> => {
  throw new Error('Service menu API is not implemented');
};
export const updateServiceMenuItem = async (_id: string, _updates: Partial<ServiceMenuItem>): Promise<ServiceMenuItem> => {
  throw new Error('Service menu API is not implemented');
};
export const deleteServiceMenuItem = async (_id: string): Promise<void> => {
  throw new Error('Service menu API is not implemented');
};

export const getRooms = async (): Promise<Room[]> => [];
export const createRoom = async (_room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> => {
  throw new Error('Rooms API is not implemented');
};
export const updateRoom = async (_id: string, _updates: Partial<Room>): Promise<Room> => {
  throw new Error('Rooms API is not implemented');
};
export const deleteRoom = async (_id: string): Promise<void> => {
  throw new Error('Rooms API is not implemented');
};

export const getEquipment = async (): Promise<Equipment[]> => [];
export const createEquipment = async (_equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> => {
  throw new Error('Equipment API is not implemented');
};
export const updateEquipment = async (_id: string, _updates: Partial<Equipment>): Promise<Equipment> => {
  throw new Error('Equipment API is not implemented');
};
export const deleteEquipment = async (_id: string): Promise<void> => {
  throw new Error('Equipment API is not implemented');
};
