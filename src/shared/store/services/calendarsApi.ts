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

// ============================================================================
// Service Menu / Rooms / Equipment — sophisticated localStorage-backed CRUD
//
// The real backend endpoints don't exist yet. Until they do, we persist
// these settings to localStorage so the UI works end-to-end on a
// per-device basis. When real endpoints land, swap each function back to
// an axios call — the UI bindings won't change.
//
// Storage keys are namespaced so multiple orgs don't collide on the same
// device (key = `<base>::<orgIdOrAnonymous>`).
// ============================================================================

const SERVICE_MENU_KEY = 'builderlync.calendars.serviceMenu';
const ROOMS_KEY = 'builderlync.calendars.rooms';
const EQUIPMENT_KEY = 'builderlync.calendars.equipment';

const orgScope = (): string => {
  if (typeof window === 'undefined') return 'anonymous';
  return window.localStorage.getItem('currentOrganizationId') || 'anonymous';
};

const storageKey = (base: string) => `${base}::${orgScope()}`;

const readStorage = <T>(base: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(base));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
};

const writeStorage = <T>(base: string, items: T[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(base), JSON.stringify(items));
};

// Generate a sortable id (timestamp-prefix + random suffix) so rows
// returned to React lists have stable keys and visual order matches
// insertion order.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

// ---- Service Menu ----------------------------------------------------------

export const getServiceMenuItems = async (): Promise<ServiceMenuItem[]> =>
  readStorage<ServiceMenuItem>(SERVICE_MENU_KEY);

export const createServiceMenuItem = async (
  item: Omit<ServiceMenuItem, 'id' | 'created_at' | 'updated_at'>
): Promise<ServiceMenuItem> => {
  const created: ServiceMenuItem = {
    ...item,
    id: newId(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const items = readStorage<ServiceMenuItem>(SERVICE_MENU_KEY);
  items.push(created);
  writeStorage(SERVICE_MENU_KEY, items);
  return created;
};

export const updateServiceMenuItem = async (
  id: string,
  updates: Partial<ServiceMenuItem>
): Promise<ServiceMenuItem> => {
  const items = readStorage<ServiceMenuItem>(SERVICE_MENU_KEY);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Service menu item not found');
  const merged: ServiceMenuItem = {
    ...items[idx],
    ...updates,
    id: items[idx].id, // never overwrite id
    created_at: items[idx].created_at, // preserve creation timestamp
    updated_at: nowIso(),
  };
  items[idx] = merged;
  writeStorage(SERVICE_MENU_KEY, items);
  return merged;
};

export const deleteServiceMenuItem = async (id: string): Promise<void> => {
  const items = readStorage<ServiceMenuItem>(SERVICE_MENU_KEY);
  writeStorage(SERVICE_MENU_KEY, items.filter((i) => i.id !== id));
};

// ---- Rooms -----------------------------------------------------------------

export const getRooms = async (): Promise<Room[]> => readStorage<Room>(ROOMS_KEY);

export const createRoom = async (
  room: Omit<Room, 'id' | 'created_at' | 'updated_at'>
): Promise<Room> => {
  const created: Room = {
    ...room,
    id: newId(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const items = readStorage<Room>(ROOMS_KEY);
  items.push(created);
  writeStorage(ROOMS_KEY, items);
  return created;
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  const items = readStorage<Room>(ROOMS_KEY);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Room not found');
  const merged: Room = {
    ...items[idx],
    ...updates,
    id: items[idx].id,
    created_at: items[idx].created_at,
    updated_at: nowIso(),
  };
  items[idx] = merged;
  writeStorage(ROOMS_KEY, items);
  return merged;
};

export const deleteRoom = async (id: string): Promise<void> => {
  const items = readStorage<Room>(ROOMS_KEY);
  writeStorage(ROOMS_KEY, items.filter((i) => i.id !== id));
};

// ---- Equipment -------------------------------------------------------------

export const getEquipment = async (): Promise<Equipment[]> =>
  readStorage<Equipment>(EQUIPMENT_KEY);

export const createEquipment = async (
  equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>
): Promise<Equipment> => {
  const created: Equipment = {
    ...equipment,
    id: newId(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const items = readStorage<Equipment>(EQUIPMENT_KEY);
  items.push(created);
  writeStorage(EQUIPMENT_KEY, items);
  return created;
};

export const updateEquipment = async (
  id: string,
  updates: Partial<Equipment>
): Promise<Equipment> => {
  const items = readStorage<Equipment>(EQUIPMENT_KEY);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Equipment not found');
  const merged: Equipment = {
    ...items[idx],
    ...updates,
    id: items[idx].id,
    created_at: items[idx].created_at,
    updated_at: nowIso(),
  };
  items[idx] = merged;
  writeStorage(EQUIPMENT_KEY, items);
  return merged;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const items = readStorage<Equipment>(EQUIPMENT_KEY);
  writeStorage(EQUIPMENT_KEY, items.filter((i) => i.id !== id));
};
