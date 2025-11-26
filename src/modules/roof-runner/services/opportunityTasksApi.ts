import { supabase } from '../../../shared/lib/supabase';

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
    try {
      const { data, error } = await supabase
        .from('opportunity_tasks')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunity tasks:', error);
      throw error;
    }
  },

  async createTask(taskData: CreateOpportunityTaskRequest): Promise<OpportunityTask> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('opportunity_tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating opportunity task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: UpdateOpportunityTaskRequest): Promise<OpportunityTask> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('opportunity_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opportunity task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting opportunity task:', error);
      throw error;
    }
  },

  async toggleTaskStatus(taskId: string, currentStatus: string): Promise<OpportunityTask> {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    return this.updateTask(taskId, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  },
};
