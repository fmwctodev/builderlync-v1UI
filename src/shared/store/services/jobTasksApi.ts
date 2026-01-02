import { apiClient } from '../../utils/api';

export interface JobStageTask {
  id: string;
  stage_name: string;
  task_name: string;
  task_description: string | null;
  is_auto_created: boolean;
  task_order: number;
  task_category: string;
  created_at: string;
  updated_at: string;
}

export interface JobTask {
  id: string;
  job_id: number;
  stage_task_id: string | null;
  task_name: string;
  task_description: string | null;
  assigned_to: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  task_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  text?: string; // Alias for task_name from backend
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
  };
}

export interface CreateJobTaskRequest {
  job_id: number;
  stage_task_id?: string;
  task_name: string;
  task_description?: string;
  assigned_to?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  notes?: string;
  task_order?: number;
}

export interface UpdateJobTaskRequest {
  task_name?: string;
  task_description?: string;
  assigned_to?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string | null;
  completed_at?: string | null;
  notes?: string;
  task_order?: number;
}

export const getStageTaskTemplates = async (stageName: string) => {
  const response = await apiClient.get<{ data: JobStageTask[] }>(`/job-stage-tasks?stage_name=${stageName}`);
  return response.data;
};

export const getAutoCreatedTasksForStage = async (stageName: string) => {
  const response = await apiClient.get<{ data: JobStageTask[] }>(`/job-stage-tasks?stage_name=${stageName}&is_auto_created=true`);
  return response.data;
};

export const getOptionalTasksForStage = async (stageName: string) => {
  const response = await apiClient.get<{ data: JobStageTask[] }>(`/job-stage-tasks?stage_name=${stageName}&is_auto_created=false`);
  return response.data;
};

export const getJobTasks = async (jobId: number) => {
  const response = await apiClient.get<{ success: boolean; data: any[] }>(`/jobs/${jobId}/tasks`);
  // Transform backend response to match frontend interface
  return response.data.map(task => ({
    ...task,
    id: task.id?.toString(),
    task_name: task.text || task.task_name,
    task_description: task.description || task.task_description,
    assigned_to: task.assignee || task.assigned_to,
    status: task.completed ? 'completed' : (task.status || 'pending')
  }));
};

export const createJobTask = async (taskData: CreateJobTaskRequest) => {
  const response = await apiClient.post<{ success: boolean; data: JobTask }>(`/jobs/${taskData.job_id}/tasks`, taskData);
  return response.data;
};

export const updateJobTask = async (taskId: string, updates: UpdateJobTaskRequest) => {
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  if (updates.status !== 'completed' && updates.completed_at) {
    updates.completed_at = null;
  }

  const response = await apiClient.put<{ success: boolean; data: JobTask }>(`/jobs/tasks/${taskId}`, updates);
  return response.data;
};

export const deleteJobTask = async (taskId: string) => {
  await apiClient.delete(`/jobs/tasks/${taskId}`);
  return true;
};

export const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

  return updateJobTask(taskId, {
    status: newStatus as 'pending' | 'completed',
    completed_at: completedAt
  });
};

export const assignTaskToStaff = async (taskId: string, staffId: string | null) => {
  return updateJobTask(taskId, { assigned_to: staffId });
};

export const autoCreateTasksForStage = async (jobId: number, stageName: string) => {
  const response = await apiClient.post<{ data: JobTask[] }>(`/jobs/${jobId}/tasks/auto-create`, { stageName });
  return response.data;
};

export const reorderTasks = async (jobId: number, taskIds: string[]) => {
  await apiClient.put(`/jobs/${jobId}/tasks/reorder`, { taskIds });
  return true;
};
