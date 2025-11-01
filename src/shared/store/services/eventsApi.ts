import axios from 'axios';

const API_BASE_URL = 'https://builderlyncapi.testenvapp.com/api';

export interface Event {
  id?: number;
  type: string;
  title: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  type: string;
  title: string;
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

export const createJobEvent = async (jobId: number, eventData: CreateEventRequest): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/jobs/${jobId}/events`,
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

export const updateJobEvent = async (jobId: number, eventId: number, eventData: CreateEventRequest): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.put(
    `${API_BASE_URL}/jobs/${jobId}/events/${eventId}`,
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

export const deleteJobEvent = async (jobId: number, eventId: number): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/jobs/${jobId}/events/${eventId}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getAllEvents = async (page: number = 1, limit: number = 100): Promise<EventsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<EventsResponse>(
    `${API_BASE_URL}/jobs/1/events?page=${page}&limit=${limit}`,
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