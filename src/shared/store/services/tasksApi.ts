import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Task {
  id?: number;
  text: string;
  assignee: string;
  dueDate: string;
  blocking: boolean;
  completed: boolean;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  text: string;
  assignee: string;
  dueDate: string;
  blocking: boolean;
  completed: boolean;
  createdBy: number;
  createdByName: string;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export const getJobTasks = async (jobId: number, page: number = 1, limit: number = 10): Promise<TasksResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<TasksResponse>(
    `${API_BASE_URL}/jobs/${jobId}/tasks?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createJobTask = async (jobId: number, taskData: CreateTaskRequest): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/jobs/${jobId}/tasks`,
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

export const updateJobTask = async (jobId: number, taskId: number, taskData: CreateTaskRequest): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.put(
    `${API_BASE_URL}/jobs/${jobId}/tasks/${taskId}`,
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

export const deleteJobTask = async (jobId: number, taskId: number): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/jobs/${jobId}/tasks/${taskId}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};