import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';

const CalendarSettingsSection: React.FC = () => {
  const [timezone, setTimezone] = useState('America/New_York');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Calendar settings saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calendar Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Appointments In
            </label>
            <div className="text-sm text-gray-600 mb-3">
              Timezone
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600"
            >
              <option value="America/New_York">GMT-05:00 America/New_York (EST)</option>
              <option value="America/Chicago">GMT-06:00 America/Chicago (CST)</option>
              <option value="America/Denver">GMT-07:00 America/Denver (MST)</option>
              <option value="America/Los_Angeles">GMT-08:00 America/Los_Angeles (PST)</option>
              <option value="Europe/London">GMT+00:00 Europe/London</option>
              <option value="Europe/Paris">GMT+01:00 Europe/Paris</option>
            </select>
            <p className="text-xs text-gray-600 mt-2">
              We'll use this timezone to display appointment times throughout the app and in your
              appointment-related emails.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Calendar Integration</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect your calendar to sync appointments and meetings.
            </p>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              Connect Calendar
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettingsSection;
