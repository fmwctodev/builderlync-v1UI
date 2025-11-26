import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SocialPlannerSettings {
  defaultPostingTime: string;
  timezone: string;
  autoPublish: boolean;
  enableNotifications: boolean;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  defaultPlatforms: string[];
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<SocialPlannerSettings>({
    defaultPostingTime: '09:00',
    timezone: 'America/New_York',
    autoPublish: true,
    enableNotifications: true,
    notifyOnSuccess: false,
    notifyOnFailure: true,
    defaultPlatforms: ['facebook', 'instagram'],
  });

  const [isSaving, setIsSaving] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings:', settings);

      setTimeout(() => {
        alert('Settings saved successfully!');
        onClose();
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Social Planner Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Posting Preferences</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Posting Time
                </label>
                <input
                  type="time"
                  value={settings.defaultPostingTime}
                  onChange={(e) => setSettings({ ...settings, defaultPostingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  New posts will default to this time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={settings.autoPublish}
                  onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoPublish" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Auto-publish scheduled posts
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Enable notifications
                </label>
              </div>

              {settings.enableNotifications && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnSuccess"
                      checked={settings.notifyOnSuccess}
                      onChange={(e) => setSettings({ ...settings, notifyOnSuccess: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnSuccess" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Notify on successful posts
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnFailure"
                      checked={settings.notifyOnFailure}
                      onChange={(e) => setSettings({ ...settings, notifyOnFailure: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnFailure" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Notify on failed posts
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Default Platforms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Platforms selected by default when creating a new post
            </p>

            <div className="grid grid-cols-2 gap-3">
              {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                <div key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`default-${platform}`}
                    checked={settings.defaultPlatforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({
                          ...settings,
                          defaultPlatforms: [...settings.defaultPlatforms, platform],
                        });
                      } else {
                        setSettings({
                          ...settings,
                          defaultPlatforms: settings.defaultPlatforms.filter((p) => p !== platform),
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`default-${platform}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-white capitalize"
                  >
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
