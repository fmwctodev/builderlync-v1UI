import React, { useState } from 'react';
import { useAppointmentReport } from '../hooks/useAppointmentReport';
import { format } from 'date-fns';

export function AppointmentReportTab() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCalendar, setSelectedCalendar] = useState<string>();

  const { data, loading, error } = useAppointmentReport(startDate, endDate, selectedCalendar);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading appointment data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading data: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
            <span className="text-gray-900 dark:text-white">{format(startDate, 'yyyy-MM-dd')}</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-900 dark:text-white">{format(endDate, 'yyyy-MM-dd')}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={selectedCalendar || ''}
            onChange={(e) => setSelectedCalendar(e.target.value || undefined)}
          >
            <option value="">All Calendars</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Booked</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.booked}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirmed</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.confirmed}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cancelled</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.cancelled}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.new}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Showed</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.showed}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">No Show</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.noShow}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Invalid</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.invalid}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Rescheduled</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data.metrics.rescheduled}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              All Status
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              Columns
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Appointment Id</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Requested Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Calendar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-gray-400 dark:text-gray-500 text-2xl">📅</span>
                      </div>
                      <span>No appointments found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.id.substring(0, 8)}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{format(new Date(apt.appointmentTime), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.calendarName}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.contactName}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.contactEmail}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{apt.contactPhone}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
