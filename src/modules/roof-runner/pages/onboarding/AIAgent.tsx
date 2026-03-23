import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Loader, Sparkles } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

export const AIAgent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [agentName, setAgentName] = useState('');
  const [personality, setPersonality] = useState('professional');
  const [servicesOffered, setServicesOffered] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.ai_agent_config) {
        const config = settings.ai_agent_config;
        if (config.agent_name) setAgentName(config.agent_name);
        if (config.personality) setPersonality(config.personality);
        if (config.services_offered) setServicesOffered(config.services_offered);
        if (config.service_area) setServiceArea(config.service_area);
        if (config.business_hours) setBusinessHours(config.business_hours);
        if (config.special_instructions) setSpecialInstructions(config.special_instructions);
      }
    } catch (err) {
      console.error('Error loading AI agent config:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updateAIAgentConfig(currentOrganization.id, {
        agent_name: agentName,
        personality,
        services_offered: servicesOffered,
        service_area: serviceArea,
        business_hours: businessHours,
        special_instructions: specialInstructions,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 9);
      navigate('/onboarding/review');
    } catch (err) {
      console.error('Error saving AI agent config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 9);
      navigate('/onboarding/review');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  const personalityOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-focused' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'direct', label: 'Direct', description: 'Concise and to-the-point' },
  ];

  return (
    <OnboardingLayout
      currentStep={9}
      title="Configure Your AI Assistant"
      description="Train your AI agent to handle customer inquiries and qualify leads automatically."
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your AI-Powered Assistant
            </h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your AI agent can answer customer questions, qualify leads, and even schedule appointments
            24/7 via phone, SMS, and web chat.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Sarah or Customer Service Bot"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The name your AI assistant will use when talking to customers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personality
              </label>
              <div className="space-y-2">
                {personalityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      personality === option.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="personality"
                      value={option.value}
                      checked={personality === option.value}
                      onChange={(e) => setPersonality(e.target.value)}
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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Business Knowledge
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Services You Offer
              </label>
              <textarea
                value={servicesOffered}
                onChange={(e) => setServicesOffered(e.target.value)}
                rows={3}
                placeholder="e.g., Residential roofing, commercial roofing, roof repairs, gutter installation..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Area
              </label>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g., Austin, TX and surrounding areas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typical Business Hours
              </label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="e.g., Monday-Friday 8am-6pm, Saturday 9am-3pm"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                placeholder="Any specific information or instructions for your AI assistant..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
            What Your AI Agent Can Do:
          </h4>
          <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
            <li>• Answer common questions about your services and pricing</li>
            <li>• Qualify leads by asking relevant questions</li>
            <li>• Schedule appointments with your team</li>
            <li>• Follow up with leads automatically</li>
            <li>• Provide 24/7 customer support</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/billing')}
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
