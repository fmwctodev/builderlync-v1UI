import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface EventContact {
  id: number | string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
}

export interface Event {
  googleEventId: any;
  id?: number;
  type: string;
  title: string;
  contactId?: number;
  contactName?: string;
  contact?: EventContact | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCompany?: string | null;
  contactAddress?: string | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  invitees: string[];
  description: string;
  createdBy: number;
  createdByName: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  timeZone?: string;
}

export interface CreateEventRequest {
  type: string;
  title: string;
  contactId?: number;
  contactName?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  invitees: string[];
  description: string;
  createdBy?: number;
  createdByName?: string;
  assignedTo?: number;
  jobId?: number;
  timeZone?: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
}

export const getJobEvents = async (jobId: number, page: number = 1, limit: number = 10): Promise<EventsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<EventsResponse>(
    `${API_BASE_URL}/jobs/${jobId}/events?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createJobEvent = async (jobId: number | undefined, eventData: CreateEventRequest): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const url = jobId
    ? `${API_BASE_URL}/jobs/${jobId}/events`
    : `${API_BASE_URL}/events`;

  const response = await axios.post(
    url,
    eventData,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateJobEvent = async (jobId: number | undefined, eventId: number, eventData: any): Promise<{ success: boolean; data?: Event; message?: string }> => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('google_refresh_token');
  const googleEmail = localStorage.getItem('google_email');

  const url = jobId
    ? `${API_BASE_URL}/jobs/${jobId}/events/${eventId}`
    : `${API_BASE_URL}/events/${eventId}`;

  const response = await axios.put(
    url,
    {
      ...eventData,
      refreshToken,
      googleEmail
    },
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteJobEvent = async (jobId: number | undefined, eventId: number, googleEventId?: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('google_refresh_token');

  const url = jobId
    ? `${API_BASE_URL}/jobs/${jobId}/events/${eventId}`
    : `${API_BASE_URL}/events/${eventId}`;

  const response = await axios.delete(
    url,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        refreshToken
      }
    }
  );

  return response.data;
};

export const getAllEvents = async (page: number = 1, limit: number = 100): Promise<EventsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<EventsResponse>(
    `${API_BASE_URL}/events?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const checkAvailability = async (startDate: string, startTime: string, endDate: string, endTime: string): Promise<{ success: boolean; available: boolean }> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE_URL}/jobs/check-availability?startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const bookAppointment = async (contactId: number, appointmentData: any): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/contacts/${contactId}/book-appointment`,
    appointmentData,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getJobs = async (): Promise<{ success: boolean; data: { data: any[] } }> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE_URL}/jobs?limit=100`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};
