import React, { useState } from 'react';
import { Calendar, Check, Trash2, Settings, Plus, Loader2 } from 'lucide-react';

interface CalendarConnection {
  id: string;
  provider: 'google';
  email: string;
  status: 'connected';
}

type TabId = 'calendars' | 'video';

const CalendarSettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('calendars');
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);

  const [linkedCalendar] = useState<{
    email: string;
    calendarEmail: string;
  } | null>(null);

  const [conflictCalendars] = useState<string[]>([]);

  const [hideEventDetails, setHideEventDetails] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const [saving, setSaving] = useState(false);

  const handleDeleteCalendar = (id: string) => {
    if (confirm('Are you sure you want to disconnect this calendar?')) {
      setCalendars(calendars.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    setSaving(true);
    // TODO: Implement save logic
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('calendars')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendars'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Calendars
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'video'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Video Conferencing
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'calendars' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Connected Calendars
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {calendars.length === 0 ? (
                    <div className="p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                      No calendars connected yet.
                    </div>
                  ) : (
                    calendars.map((calendar) => (
                      <div
                        key={calendar.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-sm">
                            <Calendar className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Google Calendar
                              </span>
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {calendar.email}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCalendar(calendar.id)}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Calendar Configuration (removed for now) */}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Video conferencing settings will be available here
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Additional Calendar Settings
        </h3>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Private Mode for Synced Events
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When turned on, only you can see your third-party calendar details, and others won't be able to.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideEventDetails}
                  onChange={(e) => setHideEventDetails(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Hide event details
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Appointments In
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Timezone
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="America/New_York">GMT-05:00 America/New_York (EST)</option>
                <option value="America/Chicago">GMT-06:00 America/Chicago (CST)</option>
                <option value="America/Denver">GMT-07:00 America/Denver (MST)</option>
                <option value="America/Los_Angeles">GMT-08:00 America/Los_Angeles (PST)</option>
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                We'll use this timezone to display appointment times throughout the app and in your
                appointment-related emails — just for you. It won't affect your availability or how others book
                with you.
              </p>
            </div>
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
