import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Clock, Voicemail, Loader } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

const businessHoursOptions = [
  { day: 'Monday', enabled: true, open: '09:00', close: '17:00' },
  { day: 'Tuesday', enabled: true, open: '09:00', close: '17:00' },
  { day: 'Wednesday', enabled: true, open: '09:00', close: '17:00' },
  { day: 'Thursday', enabled: true, open: '09:00', close: '17:00' },
  { day: 'Friday', enabled: true, open: '09:00', close: '17:00' },
  { day: 'Saturday', enabled: false, open: '09:00', close: '17:00' },
  { day: 'Sunday', enabled: false, open: '09:00', close: '17:00' },
];

export const PhoneSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [businessHours, setBusinessHours] = useState(businessHoursOptions);
  const [forwardingNumber, setForwardingNumber] = useState('');
  const [afterHoursBehavior, setAfterHoursBehavior] = useState('voicemail');
  const [callRecordingEnabled, setCallRecordingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.phone_config) {
        const config = settings.phone_config;
        if (config.business_hours) setBusinessHours(config.business_hours);
        if (config.forwarding_number) setForwardingNumber(config.forwarding_number);
        if (config.after_hours_behavior) setAfterHoursBehavior(config.after_hours_behavior);
        if (config.call_recording_enabled !== undefined)
          setCallRecordingEnabled(config.call_recording_enabled);
      }
    } catch (err) {
      console.error('Error loading phone config:', err);
    }
  };

  const toggleDay = (index: number) => {
    const newHours = [...businessHours];
    newHours[index].enabled = !newHours[index].enabled;
    setBusinessHours(newHours);
  };

  const updateTime = (index: number, field: 'open' | 'close', value: string) => {
    const newHours = [...businessHours];
    newHours[index][field] = value;
    setBusinessHours(newHours);
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updatePhoneConfig(currentOrganization.id, {
        business_hours: businessHours,
        forwarding_number: forwardingNumber,
        after_hours_behavior: afterHoursBehavior,
        call_recording_enabled: callRecordingEnabled,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 4);
      navigate('/onboarding/lead-sources');
    } catch (err) {
      console.error('Error saving phone config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 4);
      navigate('/onboarding/lead-sources');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      title="Configure Your Phone System"
      description="Set up your business phone number, hours, and call handling preferences."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Phone className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Call Forwarding
            </h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forward calls to this number
            </label>
            <input
              type="tel"
              value={forwardingNumber}
              onChange={(e) => setForwardingNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Incoming calls will be forwarded to this number during business hours.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Hours
            </h3>
          </div>
          <div className="space-y-3">
            {businessHours.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 w-32">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => toggleDay(index)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {day.day}
                  </span>
                </label>
                {day.enabled ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => updateTime(index, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) => updateTime(index, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Voicemail className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              After Hours Behavior
            </h3>
          </div>
          <div className="space-y-3">
            {[
              {
                value: 'voicemail',
                label: 'Send to Voicemail',
                description: 'Callers can leave a message',
              },
              {
                value: 'ai_agent',
                label: 'AI Agent',
                description: 'AI assistant handles calls',
              },
              {
                value: 'forward_mobile',
                label: 'Forward to Mobile',
                description: 'Forward to your personal phone',
              },
              {
                value: 'disconnect',
                label: 'Disconnect',
                description: 'Play a message and disconnect',
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  afterHoursBehavior === option.value
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="after_hours"
                  value={option.value}
                  checked={afterHoursBehavior === option.value}
                  onChange={(e) => setAfterHoursBehavior(e.target.value)}
                  className="mt-1 border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={callRecordingEnabled}
              onChange={(e) => setCallRecordingEnabled(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Enable Call Recording
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                All calls will be recorded for quality assurance and training purposes.
              </div>
            </div>
          </label>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            You can customize these settings further from your Communications settings page after
            onboarding.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/team')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            <span>Continue</span>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
