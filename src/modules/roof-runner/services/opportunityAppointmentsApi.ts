import { apiClient } from '../../../shared/utils/api';

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
    return apiClient.get(`/opportunities/${opportunityId}/appointments`);
  },

  async createAppointment(appointmentData: CreateOpportunityAppointmentRequest): Promise<OpportunityAppointment> {
    return apiClient.post('/opportunities/appointments', appointmentData);
  },

  async updateAppointment(appointmentId: string, updates: UpdateOpportunityAppointmentRequest): Promise<OpportunityAppointment> {
    return apiClient.put(`/opportunities/appointments/${appointmentId}`, updates);
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    return apiClient.delete(`/opportunities/appointments/${appointmentId}`);
  },

  async getUpcomingAppointments(opportunityId: string): Promise<OpportunityAppointment[]> {
    const appointments = await this.getAppointments(opportunityId);
    const now = new Date().toISOString();
    return appointments.filter(a => a.status === 'scheduled' && a.appointment_date >= now);
  },
};
