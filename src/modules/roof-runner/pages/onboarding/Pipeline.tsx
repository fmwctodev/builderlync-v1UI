import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

const pipelineTemplates = [
  {
    id: 'roofing_residential',
    name: 'Residential Roofing',
    description: 'Optimized for residential roofing projects',
    stages: ['New Lead', 'Inspection Scheduled', 'Estimate Sent', 'Contract Signed', 'Job Completed', 'Follow-up'],
  },
  {
    id: 'roofing_commercial',
    name: 'Commercial Roofing',
    description: 'Designed for commercial roofing projects',
    stages: ['Inquiry', 'Site Visit', 'Proposal', 'Negotiation', 'Contract', 'In Progress', 'Complete'],
  },
  {
    id: 'insurance_claims',
    name: 'Insurance Claims',
    description: 'Track insurance claim projects',
    stages: ['Claim Filed', 'Adjuster Scheduled', 'Approval Pending', 'Approved', 'Work Scheduled', 'Completed'],
  },
  {
    id: 'general_contractor',
    name: 'General Contractor',
    description: 'All-purpose contractor pipeline',
    stages: ['Lead', 'Quoted', 'Approved', 'Scheduled', 'In Progress', 'Completed', 'Closed'],
  },
];

export const Pipeline: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [selectedPipeline, setSelectedPipeline] = useState('roofing_residential');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.pipeline_config?.template) {
        setSelectedPipeline(settings.pipeline_config.template);
      }
    } catch (err) {
      console.error('Error loading pipeline config:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      const template = pipelineTemplates.find((t) => t.id === selectedPipeline);

      await onboardingApi.updatePipelineConfig(currentOrganization.id, {
        template: selectedPipeline,
        stages: template?.stages || [],
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 6);
      navigate('/onboarding/branding');
    } catch (err) {
      console.error('Error saving pipeline config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      title="Choose Your Pipeline"
      description="Select a sales pipeline template that matches your business workflow."
    >
      <div className="space-y-4">
        {pipelineTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedPipeline(template.id)}
            className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
              selectedPipeline === template.id
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
              </div>
              {selectedPipeline === template.id && (
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {template.stages.map((stage, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            You can customize pipeline stages and add multiple pipelines after onboarding.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/lead-sources')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
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
    </OnboardingLayout>
  );
};
