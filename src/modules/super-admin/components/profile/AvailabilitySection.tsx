import React, { useState } from 'react';
import { Plus, Copy, Trash2, Loader2 } from 'lucide-react';

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
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day: i,
      enabled: i >= 1 && i <= 5,
      slots: [{ start: '09:00', end: '17:00' }],
    }))
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleDay = (day: number) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? { ...s, enabled: !s.enabled, slots: s.slots.length === 0 ? [{ start: '09:00', end: '17:00' }] : s.slots }
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
        slots: s.slots.length === 0 ? [{ start: '09:00', end: '17:00' }] : s.slots,
      }))
    );
  };

  const addTimeSlot = (day: number) => {
    setSchedule(prev =>
      prev.map(s =>
        s.day === day
          ? { ...s, slots: [...s.slots, { start: '09:00', end: '17:00' }] }
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
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Availability settings saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set your available hours for meetings and appointments.
        </p>

        <h4 className="text-base font-semibold text-gray-900 mb-4">Available Hours</h4>

        <div className="flex flex-wrap gap-3 mb-6">
          <label className="inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={schedule.every(s => s.enabled)}
              onChange={toggleAllDays}
              className="sr-only"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All
            </span>
          </label>

          {DAY_SHORT.map((day, index) => (
            <label
              key={index}
              className={`inline-flex items-center px-4 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
                schedule[index]?.enabled
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={schedule[index]?.enabled || false}
                onChange={() => toggleDay(index)}
                className="w-4 h-4 mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium">{day}</span>
            </label>
          ))}
        </div>

        <div className="space-y-6">
          {schedule.filter(s => s.enabled).map((day) => (
            <div key={day.day} className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{DAYS[day.day]}</h4>
                <button
                  type="button"
                  onClick={() => copyToAllDays(day.day)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
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
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(day.day, slotIndex, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600"
                    />
                    {day.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(day.day, slotIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addTimeSlot(day.day)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add time</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default AvailabilitySection;
