import axios from 'axios';

const API_BASE_URL = 'https://builderlyncapi.testenvapp.com/api';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  isRecurring: boolean;
  assignedTo?: string;
  contactId: number;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    due_date: string;
    due_time: string;
    is_recurring: boolean;
    assigned_to: string;
    contact_id: number;
    created_at: string;
    updated_at: string;
    created_by: null;
  };
}

export const createTask = async (taskData: CreateTaskRequest): Promise<TaskResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.post<TaskResponse>(
    `${API_BASE_URL}/tasks`,
    taskData,
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

export const getTasks = async (contactId?: number, page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('token');

  const params = new URLSearchParams();
  if (contactId) params.append('contactId', contactId.toString());
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await axios.get(
    `${API_BASE_URL}/tasks?${params.toString()}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getTaskById = async (id: number): Promise<TaskResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<TaskResponse>(
    `${API_BASE_URL}/tasks/${id}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateTask = async (id: number, taskData: CreateTaskRequest): Promise<TaskResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.put<TaskResponse>(
    `${API_BASE_URL}/tasks/${id}`,
    taskData,
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

export const deleteTask = async (taskId: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/tasks/${taskId}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};