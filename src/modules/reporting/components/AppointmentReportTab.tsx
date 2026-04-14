import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Mail, Phone, ChevronDown, Filter, Download, MoreVertical, Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getAppointments, getAppointmentMetrics, Appointment, AppointmentMetrics } from '../services/appointments';

export function AppointmentReportTab() {
  const { currentOrganization } = useCurrentOrganization();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AppointmentMetrics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedApts, fetchedMetrics] = await Promise.all([
        getAppointments(100),
        getAppointmentMetrics()
      ]);
      setAppointments(fetchedApts);
      setMetrics(fetchedMetrics);
    } catch (error) {
      console.error('Failed to load appointment data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700">
            <span className="text-sm">{format(startDate, 'yyyy-MM-dd')}</span>
            <span className="text-gray-400">→</span>
            <span className="text-sm">{format(endDate, 'yyyy-MM-dd')}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
            <option>All Calendars</option>
            <option>Sales Demo</option>
            <option>Consultation</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Booked', value: metrics.booked, color: 'text-blue-600' },
            { label: 'Confirmed', value: metrics.confirmed, color: 'text-indigo-600' },
            { label: 'Showed', value: metrics.showed, color: 'text-emerald-600' },
            { label: 'New', value: metrics.new, color: 'text-cyan-600' },
            { label: 'Cancelled', value: metrics.cancelled, color: 'text-rose-600' },
            { label: 'No Show', value: metrics.noShow, color: 'text-amber-600' },
            { label: 'Rescheduled', value: metrics.rescheduled, color: 'text-purple-600' },
            { label: 'Rescheduled %', value: ((metrics.rescheduled / metrics.booked) * 100).toFixed(1) + '%', color: 'text-gray-600' },
          ].map((m, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-1">{m.label}</p>
              <p className={`text-4xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors">All Status</button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors">Columns</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appt ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calendar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{apt.id.split('_')[1]}</td>
                  <td className="px-4 py-3 text-sm">{format(new Date(apt.appointmentTime), 'MMM dd, HH:mm')}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{apt.calendarName}</td>
                  <td className="px-4 py-3 text-sm font-medium">{apt.contactName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{apt.contactEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      apt.status === 'confirmed' || apt.status === 'showed' ? 'bg-green-100 text-green-700' : 
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
