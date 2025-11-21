import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Loader2 } from 'lucide-react';
import { workingHoursService, preferencesService } from '../../../../shared/services/profileService';
import { WorkingHours, DAY_NAMES, UserPreferences } from '../../../../shared/types/profile';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilitySection: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [meetingLocation, setMeetingLocation] = useState('google_meet');
  const [customLocation, setCustomLocation] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hours, prefs] = await Promise.all([
        workingHoursService.getWorkingHours(),
        preferencesService.getUserPreferences(),
      ]);

      if (prefs) {
        setPreferences(prefs);
        setMeetingLocation(prefs.meeting_location);
        setCustomLocation(prefs.custom_location);
      }

      const scheduleMap = new Map<number, TimeSlot[]>();
      hours.forEach(h => {
        if (!scheduleMap.has(h.day_of_week)) {
          scheduleMap.set(h.day_of_week, []);
        }
        scheduleMap.get(h.day_of_week)!.push({
          start: h.start_time,
          end: h.end_time,
        });
      });

      const newSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
        day: i,
        enabled: scheduleMap.has(i),
        slots: scheduleMap.get(i) || [{ start: '10:00', end: '19:00' }],
      }));

      setSchedule(newSchedule);
    } catch (err) {
      setError('Failed to load availability settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? { ...s, enabled: !s.enabled, slots: s.slots.length === 0 ? [{ start: '10:00', end: '19:00' }] : s.slots }
          : s
      )
    );
  };

  const toggleAllDays = () => {
    const allEnabled = schedule.every(s => s.enabled);
    setSchedule(prev =>
      prev.map(s => ({
        ...s,
        enabled: !allEnabled,
        slots: s.slots.length === 0 ? [{ start: '10:00', end: '19:00' }] : s.slots,
      }))
    );
  };

  const addTimeSlot = (day: number) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? { ...s, slots: [...s.slots, { start: '10:00', end: '19:00' }] }
          : s
      )
    );
  };

  const removeTimeSlot = (day: number, slotIndex: number) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? { ...s, slots: s.slots.filter((_, i) => i !== slotIndex) }
          : s
      )
    );
  };

  const updateTimeSlot = (day: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? {
              ...s,
              slots: s.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : s
      )
    );
  };

  const copyToAllDays = (day: number) => {
    const sourceSlots = schedule.find(s => s.day === day)?.slots || [];
    setSchedule(prev =>
      prev.map(s =>
        s.enabled ? { ...s, slots: [...sourceSlots] } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);

      const workingHours: Partial<WorkingHours>[] = [];
      schedule.forEach(day => {
        if (day.enabled) {
          day.slots.forEach(slot => {
            workingHours.push({
              day_of_week: day.day,
              start_time: slot.start,
              end_time: slot.end,
              is_enabled: true,
            });
          });
        }
      });

      await workingHoursService.saveWorkingHours(workingHours);

      await preferencesService.updateUserPreferences({
        meeting_location: meetingLocation,
        custom_location: customLocation,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save availability settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Availability</h2>
        <p className="text-gray-600 dark:text-gray-400">Set your working hours and meeting preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Availability settings saved successfully!</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meeting Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="google_meet">Google Meet</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="phone">Phone Call</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {meetingLocation === 'custom' && (
            <div>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Meeting Location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Zone</h3>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="America/New_York">GMT-05:00 America/New_York (EST)</option>
          <option value="America/Chicago">GMT-06:00 America/Chicago (CST)</option>
          <option value="America/Denver">GMT-07:00 America/Denver (MST)</option>
          <option value="America/Los_Angeles">GMT-08:00 America/Los_Angeles (PST)</option>
          <option value="Europe/London">GMT+00:00 Europe/London</option>
          <option value="Europe/Paris">GMT+01:00 Europe/Paris</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Hours</h3>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={toggleAllDays}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select All
          </button>

          {DAY_SHORT.map((day, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleDay(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                schedule[index]?.enabled
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {schedule.filter(s => s.enabled).map((day) => (
            <div key={day.day} className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{DAYS[day.day]}</h4>
                <button
                  type="button"
                  onClick={() => copyToAllDays(day.day)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy to all days</span>
                </button>
              </div>

              <div className="space-y-3">
                {day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(day.day, slotIndex, 'start', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(day.day, slotIndex, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {day.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(day.day, slotIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {slotIndex === day.slots.length - 1 && (
                      <button
                        type="button"
                        onClick={() => copyToAllDays(day.day)}
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addTimeSlot(day.day)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add time</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save</span>
        </button>
      </div>
    </form>
  );
};

export default AvailabilitySection;
