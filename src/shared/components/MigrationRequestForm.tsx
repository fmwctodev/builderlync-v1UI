import React, { useState, useEffect } from 'react';
import { Database, Upload, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { onboardingApi, CRMType, DataVolumeEstimate, MigrationRequest } from '../services/onboardingApi';
import { useSupabaseUser } from '../hooks/useSupabaseUser';

interface MigrationRequestFormProps {
  organizationId: string;
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

export const MigrationRequestForm: React.FC<MigrationRequestFormProps> = ({
  organizationId,
  onSuccess,
  onCancel,
}) => {
  const { user } = useSupabaseUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [crmTypes, setCrmTypes] = useState<CRMType[]>([]);
  const [dataVolumeEstimates, setDataVolumeEstimates] = useState<DataVolumeEstimate[]>([]);

  const [formData, setFormData] = useState<Partial<MigrationRequest>>({
    organization_id: organizationId,
    user_id: user?.id || '',
    has_custom_fields: false,
    has_integrations: false,
    urgency_level: 'medium',
    has_historical_data: true,
    preferred_contact_method: 'email',
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [crms, volumes] = await Promise.all([
        onboardingApi.getCRMTypes(),
        onboardingApi.getDataVolumeEstimates(),
      ]);
      setCrmTypes(crms);
      setDataVolumeEstimates(volumes);
    } catch (err) {
      console.error('Error loading options:', err);
      setError('Failed to load form options');
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.crm_type_id) {
          setError('Please select your current CRM');
          return false;
        }
        return true;
      case 2:
        if (!formData.data_volume_estimate_id) {
          setError('Please select your data volume');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.preferred_contact_method) {
          setError('Please select a contact method');
          return false;
        }
        if (formData.preferred_contact_method === 'email' && !formData.contact_email) {
          setError('Please provide your email address');
          return false;
        }
        if (formData.preferred_contact_method === 'phone' && !formData.contact_phone) {
          setError('Please provide your phone number');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    setError(null);

    try {
      const request = await onboardingApi.createMigrationRequest(formData as MigrationRequest);
      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(request.id!);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting migration request:', err);
      setError(err.message || 'Failed to submit migration request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Request Submitted Successfully
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our migration experts will review your request and contact you within 1 business day.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            You can track the status of your migration request from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const selectedCRM = crmTypes.find((crm) => crm.id === formData.crm_type_id);
  const selectedVolume = dataVolumeEstimates.find((vol) => vol.id === formData.data_volume_estimate_id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Request CRM Migration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get expert help migrating your data from your existing CRM
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s === step
                    ? 'bg-red-600 text-white'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Current CRM</span>
          <span>Data Volume</span>
          <span>Details</span>
          <span>Contact</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Your Current CRM
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crmTypes.map((crm) => (
                  <button
                    key={crm.id}
                    onClick={() => updateField('crm_type_id', crm.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.crm_type_id === crm.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{crm.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {crm.description}
                        </p>
                      </div>
                      {formData.crm_type_id === crm.id && (
                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {crm.migration_complexity}
                      </span>
                      <span>{crm.estimated_days} days</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {formData.crm_type_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes About Your Current CRM
                </label>
                <textarea
                  value={formData.current_crm_notes || ''}
                  onChange={(e) => updateField('current_crm_notes', e.target.value)}
                  rows={3}
                  placeholder="Any specific details about your setup, custom configurations, or concerns..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Estimated Data Volume
              </label>
              <div className="space-y-3">
                {dataVolumeEstimates.map((volume) => (
                  <button
                    key={volume.id}
                    onClick={() => updateField('data_volume_estimate_id', volume.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.data_volume_estimate_id === volume.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {volume.range_label}
                        </span>
                      </div>
                      {formData.data_volume_estimate_id === volume.id && (
                        <CheckCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contacts
                </label>
                <input
                  type="number"
                  value={formData.estimated_contacts || ''}
                  onChange={(e) => updateField('estimated_contacts', parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jobs/Projects
                </label>
                <input
                  type="number"
                  value={formData.estimated_jobs || ''}
                  onChange={(e) => updateField('estimated_jobs', parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opportunities
                </label>
                <input
                  type="number"
                  value={formData.estimated_opportunities || ''}
                  onChange={(e) => updateField('estimated_opportunities', parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_historical_data}
                  onChange={(e) => updateField('has_historical_data', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Include historical data
                </span>
              </label>
              {formData.has_historical_data && (
                <div className="mt-3 ml-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of data to migrate
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_data || ''}
                    onChange={(e) => updateField('years_of_data', parseInt(e.target.value))}
                    placeholder="e.g., 3"
                    min="1"
                    max="20"
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_custom_fields}
                      onChange={(e) => updateField('has_custom_fields', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I have custom fields
                    </span>
                  </label>
                  {formData.has_custom_fields && (
                    <textarea
                      value={formData.custom_fields_description || ''}
                      onChange={(e) => updateField('custom_fields_description', e.target.value)}
                      rows={3}
                      placeholder="Describe your custom fields..."
                      className="mt-3 ml-6 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_integrations}
                      onChange={(e) => updateField('has_integrations', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I have integrations to migrate
                    </span>
                  </label>
                  {formData.has_integrations && (
                    <textarea
                      value={formData.integrations_description || ''}
                      onChange={(e) => updateField('integrations_description', e.target.value)}
                      rows={3}
                      placeholder="List your integrations (e.g., QuickBooks, Mailchimp, Zapier)..."
                      className="mt-3 ml-6 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.can_export_data}
                      onChange={(e) => updateField('can_export_data', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I can export my data
                    </span>
                  </label>
                  {formData.can_export_data && (
                    <div className="mt-3 ml-6">
                      <input
                        type="text"
                        value={formData.export_format || ''}
                        onChange={(e) => updateField('export_format', e.target.value)}
                        placeholder="Export format (e.g., CSV, Excel, JSON)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency_level}
                onChange={(e) => updateField('urgency_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low - Flexible timeline</option>
                <option value="medium">Medium - Within a month</option>
                <option value="high">High - Within 2 weeks</option>
                <option value="critical">Critical - ASAP</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.preferred_start_date || ''}
                    onChange={(e) => updateField('preferred_start_date', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Must Complete By
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.must_complete_by_date || ''}
                    onChange={(e) => updateField('must_complete_by_date', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Contact Preferences
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Method
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone Call' },
                    { value: 'video_call', label: 'Video Call' },
                  ].map((method) => (
                    <label key={method.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="contact_method"
                        value={method.value}
                        checked={formData.preferred_contact_method === method.value}
                        onChange={(e) => updateField('preferred_contact_method', e.target.value)}
                        className="border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.contact_email || user?.email || ''}
                onChange={(e) => updateField('contact_email', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {(formData.preferred_contact_method === 'phone' ||
              formData.preferred_contact_method === 'video_call') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone || ''}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Contact Time
              </label>
              <input
                type="text"
                value={formData.preferred_contact_time || ''}
                onChange={(e) => updateField('preferred_contact_time', e.target.value)}
                placeholder="e.g., Weekdays 9am-5pm EST"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                <li>1. Our migration team will review your request</li>
                <li>2. You'll receive a detailed migration plan within 1 business day</li>
                <li>3. We'll schedule a kickoff call to discuss the timeline</li>
                <li>4. Our experts will handle the entire migration process</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            {onCancel && step === 1 && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
