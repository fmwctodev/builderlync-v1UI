import React from 'react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { mockAppointmentTypes, mockBookingRules, mockCalendarConnections } from '../lib/mockData';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export function BookingCalendarsPage() {
  return (
    <div className="space-y-6">
      {/* Calendar Connection */}
      <Card title="Calendar Connection">
        <div className="space-y-4">
          {mockCalendarConnections.map((cal) => (
            <div
              key={cal.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">{cal.provider} Calendar</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{cal.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cal.connected ? (
                  <>
                    <StatusChip label="Connected" status="success" />
                    {cal.lastSync && (
                      <span className="text-xs text-gray-500">
                        Last sync: {new Date(cal.lastSync).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
            + Connect Another Calendar
          </button>
        </div>
      </Card>

      {/* Appointment Types */}
      <Card title="Appointment Types" subtitle="Configure the types of appointments Sierra can book">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                  Enabled
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAppointmentTypes.map((type) => (
                <tr key={type.id}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{type.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{type.duration} min</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type.locationType.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-4">
                    {type.enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Rules */}
      <Card title="Booking Rules" subtitle="Set constraints for appointment scheduling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Notice (hours)
            </label>
            <input
              type="number"
              defaultValue={mockBookingRules.minNoticeHours}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Days Out
            </label>
            <input
              type="number"
              defaultValue={mockBookingRules.maxDaysOut}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Appointments Per Day
            </label>
            <input
              type="number"
              defaultValue={mockBookingRules.maxPerDay}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={mockBookingRules.businessHoursOnly} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Business Hours Only</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={mockBookingRules.sameDayBooking} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Allow Same-Day Booking</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Booking Preview */}
      <Card title="Booking Preview" subtitle="Example of available time slots">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(
            (time) => (
              <button
                key={time}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-600 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium text-gray-900 dark:text-white"
              >
                {time}
              </button>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
