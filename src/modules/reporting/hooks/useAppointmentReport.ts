import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

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

export interface AppointmentByChannel {
  channel: string;
  count: number;
}

export interface AppointmentBySource {
  source: string;
  count: number;
}

export interface AppointmentOwner {
  ownerId: string;
  ownerName: string;
  count: number;
}

export interface AppointmentByDay {
  day: string;
  count: number;
}

export interface Appointment {
  id: string;
  title: string;
  appointmentTime: string;
  calendarName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  createdBy: string;
  status: string;
}

export interface AppointmentReportData {
  metrics: AppointmentMetrics;
  byChannel: AppointmentByChannel[];
  bySource: AppointmentBySource[];
  topOwners: AppointmentOwner[];
  popularDays: AppointmentByDay[];
  topCancellations: { calendarId: string; calendarName: string; count: number }[];
  topReschedules: { calendarId: string; calendarName: string; count: number }[];
  appointments: Appointment[];
}

export function useAppointmentReport(startDate: Date, endDate: Date, calendarId?: string) {
  const { currentOrganization } = useCurrentOrganization();
  const [data, setData] = useState<AppointmentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query
        let query = supabase
          .from('appointments')
          .select(`
            id,
            title,
            appointment_time,
            status,
            calendar_id,
            owner_id,
            contact_id,
            created_at,
            calendars(id, name),
            contacts(full_name, email, phone)
          `)
          .eq('organization_id', currentOrganization.id)
          .gte('appointment_time', startDate.toISOString())
          .lte('appointment_time', endDate.toISOString());

        if (calendarId) {
          query = query.eq('calendar_id', calendarId);
        }

        const { data: appointments, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Calculate metrics
        const metrics: AppointmentMetrics = {
          booked: appointments?.filter(a => a.status !== 'cancelled').length || 0,
          confirmed: appointments?.filter(a => a.status === 'confirmed').length || 0,
          cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
          new: appointments?.filter(a => a.status === 'upcoming').length || 0,
          showed: appointments?.filter(a => a.status === 'completed').length || 0,
          noShow: appointments?.filter(a => a.status === 'no_show').length || 0,
          invalid: 0,
          rescheduled: appointments?.filter(a => a.status === 'rescheduled').length || 0,
        };

        // Transform appointments data
        const appointmentsList: Appointment[] = (appointments || []).map(apt => ({
          id: apt.id,
          title: apt.title || '',
          appointmentTime: apt.appointment_time || '',
          calendarName: (apt.calendars as any)?.name || 'Unknown',
          contactName: (apt.contacts as any)?.full_name || 'Unknown',
          contactEmail: (apt.contacts as any)?.email || '',
          contactPhone: (apt.contacts as any)?.phone || '',
          ownerName: 'Staff Member',
          createdBy: 'User',
          status: apt.status || 'upcoming',
        }));

        setData({
          metrics,
          byChannel: [],
          bySource: [],
          topOwners: [],
          popularDays: [],
          topCancellations: [],
          topReschedules: [],
          appointments: appointmentsList,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization, startDate, endDate, calendarId]);

  return { data, loading, error };
}
