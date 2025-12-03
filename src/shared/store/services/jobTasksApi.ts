import { supabase } from '../../lib/supabase';

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
  const { data, error } = await supabase
    .from('job_stage_tasks')
    .select('*')
    .eq('stage_name', stageName)
    .order('task_order', { ascending: true });

  if (error) throw error;
  return data as JobStageTask[];
};

export const getAutoCreatedTasksForStage = async (stageName: string) => {
  const { data, error } = await supabase
    .from('job_stage_tasks')
    .select('*')
    .eq('stage_name', stageName)
    .eq('is_auto_created', true)
    .order('task_order', { ascending: true });

  if (error) throw error;
  return data as JobStageTask[];
};

export const getOptionalTasksForStage = async (stageName: string) => {
  const { data, error } = await supabase
    .from('job_stage_tasks')
    .select('*')
    .eq('stage_name', stageName)
    .eq('is_auto_created', false)
    .order('task_category', { ascending: true })
    .order('task_order', { ascending: true });

  if (error) throw error;
  return data as JobStageTask[];
};

export const getJobTasks = async (jobId: number) => {
  const { data, error } = await supabase
    .from('job_tasks')
    .select(`
      *,
      staff:assigned_to (
        id,
        first_name,
        last_name,
        email,
        image
      )
    `)
    .eq('job_id', jobId)
    .order('task_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as JobTask[];
};

export const createJobTask = async (taskData: CreateJobTaskRequest) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('job_tasks')
    .insert({
      ...taskData,
      created_by: user?.id,
      task_order: taskData.task_order ?? 0
    })
    .select(`
      *,
      staff:assigned_to (
        id,
        first_name,
        last_name,
        email,
        image
      )
    `)
    .single();

  if (error) throw error;
  return data as JobTask;
};

export const updateJobTask = async (taskId: string, updates: UpdateJobTaskRequest) => {
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  if (updates.status !== 'completed' && updates.completed_at) {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from('job_tasks')
    .update(updates)
    .eq('id', taskId)
    .select(`
      *,
      staff:assigned_to (
        id,
        first_name,
        last_name,
        email,
        image
      )
    `)
    .single();

  if (error) throw error;
  return data as JobTask;
};

export const deleteJobTask = async (taskId: string) => {
  const { error } = await supabase
    .from('job_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
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
  const templates = await getAutoCreatedTasksForStage(stageName);

  const existingTasks = await supabase
    .from('job_tasks')
    .select('stage_task_id')
    .eq('job_id', jobId);

  const existingTemplateIds = new Set(
    existingTasks.data?.map(t => t.stage_task_id).filter(Boolean) || []
  );

  const tasksToCreate = templates.filter(
    template => !existingTemplateIds.has(template.id)
  );

  if (tasksToCreate.length === 0) {
    return [];
  }

  const { data: { user } } = await supabase.auth.getUser();

  const newTasks = tasksToCreate.map((template, index) => ({
    job_id: jobId,
    stage_task_id: template.id,
    task_name: template.task_name,
    task_description: template.task_description,
    status: 'pending' as const,
    task_order: template.task_order,
    created_by: user?.id
  }));

  const { data, error } = await supabase
    .from('job_tasks')
    .insert(newTasks)
    .select(`
      *,
      staff:assigned_to (
        id,
        first_name,
        last_name,
        email,
        image
      )
    `);

  if (error) throw error;
  return data as JobTask[];
};

export const reorderTasks = async (jobId: number, taskIds: string[]) => {
  const updates = taskIds.map((taskId, index) =>
    supabase
      .from('job_tasks')
      .update({ task_order: index })
      .eq('id', taskId)
      .eq('job_id', jobId)
  );

  await Promise.all(updates);
  return true;
};
