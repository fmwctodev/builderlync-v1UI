import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, Loader, ArrowRight, Database } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi, OnboardingSettings } from '../../../../shared/services/onboardingApi';
import { MigrationRequestForm } from '../../../../shared/components/MigrationRequestForm';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

export const Review: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [settings, setSettings] = useState<OnboardingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showMigrationForm, setShowMigrationForm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [currentOrganization?.id]);

  const loadSettings = async () => {
    if (!currentOrganization?.id) return;

    try {
      const data = await onboardingApi.getSettings(currentOrganization.id);
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !currentOrganization?.id) return;

    setCompleting(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 10);
      await onboardingApi.markOnboardingComplete(currentOrganization.id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleMigrationSuccess = async (requestId: string) => {
    if (!user || !currentOrganization?.id) return;

    try {
      await onboardingApi.updateProgress(user.id, currentOrganization.id, {
        migration_requested: true,
        migration_request_id: requestId,
      });
      setShowMigrationForm(false);
      setTimeout(() => handleComplete(), 1500);
    } catch (err) {
      console.error('Error updating migration request:', err);
    }
  };

  if (loading) {
    return (
      <OnboardingLayout currentStep={10} title="Review Your Setup" description="">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </OnboardingLayout>
    );
  }

  if (showMigrationForm) {
    return (
      <div className="min-h-screen bg-paper dark:bg-canvas py-8">
        <div className="max-w-4xl mx-auto px-4">
          <MigrationRequestForm
            organizationId={currentOrganization?.id || ''}
            onSuccess={handleMigrationSuccess}
            onCancel={() => setShowMigrationForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      currentStep={10}
      title="Review Your Setup"
      description="Everything looks great! Review your configuration and complete onboarding."
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Setup Complete!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You've configured all the essentials to get started
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigCard
            title="Integrations"
            configured={!!settings?.integrations_config?.configured_at}
            items={settings?.integrations_config?.selected?.length || 0}
            onEdit={() => navigate('/onboarding/integrations')}
          />
          <ConfigCard
            title="Team Members"
            configured={!!settings?.team_config?.configured_at}
            items={settings?.team_config?.members?.length || 0}
            onEdit={() => navigate('/onboarding/team')}
          />
          <ConfigCard
            title="Phone System"
            configured={!!settings?.phone_config?.configured_at}
            items={settings?.phone_config?.forwarding_number ? 1 : 0}
            onEdit={() => navigate('/onboarding/phone-setup')}
          />
          <ConfigCard
            title="Lead Sources"
            configured={!!settings?.lead_sources_config?.configured_at}
            items={settings?.lead_sources_config?.sources?.length || 0}
            onEdit={() => navigate('/onboarding/lead-sources')}
          />
          <ConfigCard
            title="Sales Pipeline"
            configured={!!settings?.pipeline_config?.configured_at}
            items={settings?.pipeline_config?.stages?.length || 0}
            onEdit={() => navigate('/onboarding/pipeline')}
          />
          <ConfigCard
            title="Brand Identity"
            configured={!!settings?.branding_config?.configured_at}
            items={settings?.branding_config?.company_name ? 1 : 0}
            onEdit={() => navigate('/onboarding/branding')}
          />
          <ConfigCard
            title="Billing"
            configured={!!settings?.billing_config?.confirmed_at}
            items={settings?.billing_config?.plan ? 1 : 0}
            onEdit={() => navigate('/onboarding/billing')}
          />
          <ConfigCard
            title="AI Assistant"
            configured={!!settings?.ai_agent_config?.configured_at}
            items={settings?.ai_agent_config?.agent_name ? 1 : 0}
            onEdit={() => navigate('/onboarding/ai-agent')}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Need to Migrate Data From Your Old CRM?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our migration experts can help you seamlessly transfer your contacts, jobs, and history
                from your existing CRM to BuilderLync.
              </p>
              <button
                onClick={() => setShowMigrationForm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <span>Request Migration Assistance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
            What happens next?
          </h4>
          <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
            <li>• You'll be taken to your dashboard</li>
            <li>• Your team members will receive invitation emails</li>
            <li>• Integration setup instructions will be sent to your email</li>
            <li>• Your AI agent will be activated and ready to handle inquiries</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/ai-agent')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
        >
          {completing && <Loader className="w-5 h-5 animate-spin" />}
          <span className="font-semibold">Complete Onboarding</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
};

interface ConfigCardProps {
  title: string;
  configured: boolean;
  items: number;
  onEdit: () => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ title, configured, items, onEdit }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <button
          onClick={onEdit}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        {configured ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {items} item{items !== 1 ? 's' : ''} configured
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">Not configured</span>
        )}
      </div>
    </div>
  );
};
