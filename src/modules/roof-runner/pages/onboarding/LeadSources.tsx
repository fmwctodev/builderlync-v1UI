import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Facebook, Search, Zap, Loader, Plus, X } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

interface LeadSource {
  id: string;
  type: string;
  name: string;
  webhookUrl?: string;
}

const sourceTypes = [
  { value: 'web_form', label: 'Website Form', icon: Globe, description: 'Contact forms on your website' },
  { value: 'facebook_ads', label: 'Facebook Ads', icon: Facebook, description: 'Facebook lead generation ads' },
  { value: 'google_ads', label: 'Google Ads', icon: Search, description: 'Google Ads campaigns' },
  { value: 'zapier', label: 'Zapier', icon: Zap, description: 'Connect via Zapier' },
];

export const LeadSources: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.lead_sources_config?.sources) {
        setLeadSources(settings.lead_sources_config.sources);
      }
    } catch (err) {
      console.error('Error loading lead sources config:', err);
    }
  };

  const addSource = () => {
    if (!selectedType || !sourceName) return;

    const newSource: LeadSource = {
      id: Date.now().toString(),
      type: selectedType,
      name: sourceName,
    };

    setLeadSources([...leadSources, newSource]);
    setSelectedType('');
    setSourceName('');
  };

  const removeSource = (id: string) => {
    setLeadSources(leadSources.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updateLeadSourcesConfig(currentOrganization.id, {
        sources: leadSources,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 5);
      navigate('/onboarding/pipeline');
    } catch (err) {
      console.error('Error saving lead sources:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 5);
      navigate('/onboarding/pipeline');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={5}
      title="Configure Lead Sources"
      description="Set up how leads enter your system from various marketing channels."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Lead Source
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sourceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedType === type.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g., Homepage Contact Form"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addSource}
                    disabled={!sourceName}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {leadSources.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configured Sources ({leadSources.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leadSources.map((source) => {
                const sourceType = sourceTypes.find((t) => t.value === source.type);
                const Icon = sourceType?.icon || Globe;
                return (
                  <div key={source.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{source.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sourceType?.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSource(source.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            You'll receive webhook URLs and setup instructions for each source after completing onboarding.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/phone-setup')}
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
