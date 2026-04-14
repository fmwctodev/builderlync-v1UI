import { apiClient } from '@/shared/utils/api';

export interface Appointment {
  id: string;
  appointmentTime: string;
  calendarName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'booked' | 'confirmed' | 'cancelled' | 'showed' | 'no-show' | 'rescheduled';
}

export interface AppointmentMetrics {
  booked: number;
  confirmed: number;
  cancelled: number;
  new: number;
  showed: number;
  noShow: number;
  invalid: number;
  rescheduled: number;
}

export async function getAppointments(limit: number = 100): Promise<Appointment[]> {
  try {
    const response = await apiClient.get<any>(`/events?limit=${limit}`);
    const data = response.data || [];
    
    return data.map((event: any) => {
      // Basic status mapping logic
      let status: Appointment['status'] = 'booked';
      if (event.status === 'confirmed') status = 'confirmed';
      if (event.status === 'cancelled') status = 'cancelled';
      
      return {
        id: event.id.toString(),
        appointmentTime: `${event.start_date}T${event.start_time || '00:00:00'}`,
        calendarName: event.title || 'General Appointment',
        contactName: event.contactName || 'Unknown Contact',
        contactEmail: event.contactEmail || '',
        contactPhone: event.contactPhone || '',
        status
      };
    });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}

export async function getAppointmentMetrics(): Promise<AppointmentMetrics> {
  const appointments = await getAppointments();
  
  return {
    booked: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    new: appointments.filter(a => new Date(a.appointmentTime) > new Date(Date.now() - 86400000)).length,
    showed: appointments.filter(a => a.status === 'showed').length,
    noShow: appointments.filter(a => a.status === 'no-show').length,
    invalid: 0,
    rescheduled: appointments.filter(a => a.status === 'rescheduled').length,
  };
}
