import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, Loader } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  setupUrl?: string;
  isOptional: boolean;
}

const availableIntegrations: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and payments with your accounting software',
    category: 'Accounting',
    isOptional: false,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments and schedule with your Google Calendar',
    category: 'Calendar',
    isOptional: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account for email communication',
    category: 'Email',
    isOptional: true,
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Connect your Outlook account for email and calendar',
    category: 'Email & Calendar',
    isOptional: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments and manage subscriptions',
    category: 'Payments',
    isOptional: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync contacts for email marketing campaigns',
    category: 'Marketing',
    isOptional: true,
  },
];

export const Integrations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.integrations_config?.selected) {
        setSelectedIntegrations(settings.integrations_config.selected);
      }
    } catch (err) {
      console.error('Error loading integrations config:', err);
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integrationId)
        ? prev.filter((id) => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updateIntegrationsConfig(currentOrganization.id, {
        selected: selectedIntegrations,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 2);
      navigate('/onboarding/team');
    } catch (err) {
      console.error('Error saving integrations:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 2);
      navigate('/onboarding/team');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  const groupedIntegrations = availableIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <OnboardingLayout
      currentStep={2}
      title="Connect Your Tools"
      description="Select the integrations you want to set up. You can always add more later."
    >
      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(([category, integrations]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => toggleIntegration(integration.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedIntegrations.includes(integration.id)
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {integration.id === 'quickbooks' && '📊'}
                          {integration.id === 'google-calendar' && '📅'}
                          {integration.id === 'gmail' && '📧'}
                          {integration.id === 'outlook' && '📮'}
                          {integration.id === 'stripe' && '💳'}
                          {integration.id === 'mailchimp' && '🐵'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h4>
                        {integration.isOptional && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedIntegrations.includes(integration.id) && (
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {integration.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Don't worry if you're not ready to connect everything now. You can set up these
            integrations later from your settings page.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/welcome')}
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
            disabled={saving || selectedIntegrations.length === 0}
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
