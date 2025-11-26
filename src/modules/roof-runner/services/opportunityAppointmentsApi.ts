import { supabase } from '../../../shared/lib/supabase';

export interface OpportunityAppointment {
  id: string;
  opportunity_id: string;
  user_id: string;
  organization_id?: string;
  appointment_type: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  assigned_to?: string;
  location?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityAppointmentRequest {
  opportunity_id: string;
  appointment_type: string;
  appointment_date: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  assigned_to?: string;
  location?: string;
  notes?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export interface UpdateOpportunityAppointmentRequest {
  appointment_type?: string;
  appointment_date?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  assigned_to?: string;
  location?: string;
  notes?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export const opportunityAppointmentsApi = {
  async getAppointments(opportunityId: string): Promise<OpportunityAppointment[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_appointments')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunity appointments:', error);
      throw error;
    }
  },

  async createAppointment(appointmentData: CreateOpportunityAppointmentRequest): Promise<OpportunityAppointment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('opportunity_appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating opportunity appointment:', error);
      throw error;
    }
  },

  async updateAppointment(appointmentId: string, updates: UpdateOpportunityAppointmentRequest): Promise<OpportunityAppointment> {
    try {
      const { data, error } = await supabase
        .from('opportunity_appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opportunity appointment:', error);
      throw error;
    }
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting opportunity appointment:', error);
      throw error;
    }
  },

  async getUpcomingAppointments(opportunityId: string): Promise<OpportunityAppointment[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('opportunity_appointments')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .eq('status', 'scheduled')
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },
};
