import { apiClient } from '../../../shared/utils/api';

export interface OpportunityTask {
  id: string;
  opportunity_id: string;
  user_id: string;
  organization_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityTaskRequest {
  opportunity_id: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
}

export interface UpdateOpportunityTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
}

export const opportunityTasksApi = {
  async getTasks(opportunityId: string): Promise<OpportunityTask[]> {
    return apiClient.get(`/opportunities/${opportunityId}/tasks`);
  },

  async createTask(taskData: CreateOpportunityTaskRequest): Promise<OpportunityTask> {
    return apiClient.post('/opportunities/tasks', taskData);
  },

  async updateTask(taskId: string, updates: UpdateOpportunityTaskRequest): Promise<OpportunityTask> {
    return apiClient.put(`/opportunities/tasks/${taskId}`, updates);
  },

  async deleteTask(taskId: string): Promise<void> {
    return apiClient.delete(`/opportunities/tasks/${taskId}`);
  },

  async toggleTaskStatus(taskId: string, currentStatus: string): Promise<OpportunityTask> {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    return this.updateTask(taskId, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  },
};
