import { apiClient } from '@/shared/utils/api';
import { isStagingMode } from '@/shared/utils/stagingAuth';

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

// Staging seed: 12 appointments across the recent 5 days, mix of statuses.
const STAGING_APPOINTMENTS: Appointment[] = [
  { id: '1', appointmentTime: '2026-05-05T10:00:00', calendarName: 'On-Site Inspection', contactName: 'Maria Davis', contactEmail: 'maria.d@example.com', contactPhone: '+1 (555) 010-2031', status: 'showed' },
  { id: '2', appointmentTime: '2026-05-05T13:30:00', calendarName: 'Estimate Walkthrough', contactName: 'Tom Henderson', contactEmail: 'tom.h@example.com', contactPhone: '+1 (555) 010-3199', status: 'showed' },
  { id: '3', appointmentTime: '2026-05-05T15:00:00', calendarName: 'On-Site Inspection', contactName: 'Patel Family', contactEmail: 'patel@example.com', contactPhone: '+1 (555) 010-9912', status: 'no-show' },
  { id: '4', appointmentTime: '2026-05-05T17:00:00', calendarName: 'Final Walk-through', contactName: 'Alex Smith', contactEmail: 'asmith@example.com', contactPhone: '+1 (555) 010-7720', status: 'confirmed' },
  { id: '5', appointmentTime: '2026-05-04T09:30:00', calendarName: 'Estimate Walkthrough', contactName: 'Jess Walker', contactEmail: 'jw@example.com', contactPhone: '+1 (555) 010-4422', status: 'showed' },
  { id: '6', appointmentTime: '2026-05-04T14:00:00', calendarName: 'On-Site Inspection', contactName: 'Carla Ortiz', contactEmail: 'co@example.com', contactPhone: '+1 (555) 010-1184', status: 'cancelled' },
  { id: '7', appointmentTime: '2026-05-03T11:00:00', calendarName: 'On-Site Inspection', contactName: 'Devon Lee', contactEmail: 'dl@example.com', contactPhone: '+1 (555) 010-3422', status: 'showed' },
  { id: '8', appointmentTime: '2026-05-03T16:30:00', calendarName: 'Estimate Walkthrough', contactName: 'Renata Kim', contactEmail: 'rk@example.com', contactPhone: '+1 (555) 010-5567', status: 'rescheduled' },
  { id: '9', appointmentTime: '2026-05-02T10:30:00', calendarName: 'On-Site Inspection', contactName: 'Gabe Ramirez', contactEmail: 'gr@example.com', contactPhone: '+1 (555) 010-7791', status: 'showed' },
  { id: '10', appointmentTime: '2026-05-02T13:00:00', calendarName: 'Final Walk-through', contactName: 'Ashley Brown', contactEmail: 'ab@example.com', contactPhone: '+1 (555) 010-8830', status: 'showed' },
  { id: '11', appointmentTime: '2026-05-01T09:00:00', calendarName: 'Estimate Walkthrough', contactName: 'Mike Park', contactEmail: 'mp@example.com', contactPhone: '+1 (555) 010-9941', status: 'no-show' },
  { id: '12', appointmentTime: '2026-05-01T15:30:00', calendarName: 'On-Site Inspection', contactName: 'Sara Cohen', contactEmail: 'sc@example.com', contactPhone: '+1 (555) 010-2240', status: 'showed' },
];

export async function getAppointments(limit: number = 100): Promise<Appointment[]> {
  // Staging short-circuit
  if (isStagingMode()) {
    return STAGING_APPOINTMENTS.slice(0, limit);
  }

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
