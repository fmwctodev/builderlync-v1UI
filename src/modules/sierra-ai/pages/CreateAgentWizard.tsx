import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, User, Briefcase } from 'lucide-react';
import { agentTemplates, industries, personalUseCases, businessUseCases } from '../lib/agentMockData';
import { Industry, UseCase } from '../lib/agentTypes';
import * as LucideIcons from 'lucide-react';

import { createAgent } from '../services/agentsApi';
import { supabase } from '../../../shared/lib/supabase';

type WizardStep = 'template' | 'industry' | 'usecase' | 'details';

interface WizardState {
  template: string;
  industry?: Industry;
  useCase?: UseCase;
  agentName: string;
  website: string;
  mainGoal: string;
  chatOnly: boolean;
}

export function CreateAgentWizard() {
  const navigate = useNavigate();
  const organizationId = localStorage.getItem('currentOrganizationId') || '';
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [isCreating, setIsCreating] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    template: '',
    agentName: '',
    website: '',
    mainGoal: '',
    chatOnly: false,
  });

  const handleBack = () => {
    if (currentStep === 'template') {
      navigate(`/ai-agents`);
    } else if (currentStep === 'industry') {
      setCurrentStep('template');
    } else if (currentStep === 'usecase') {
      if (wizardState.template === 'personal_assistant') {
        setCurrentStep('template');
      } else {
        setCurrentStep('industry');
      }
    } else if (currentStep === 'details') {
      if (wizardState.template === 'blank') {
        setCurrentStep('template');
      } else {
        setCurrentStep('usecase');
      }
    }
  };

  const handleClose = () => {
    navigate(`/ai-agents`);
  };

  const handleTemplateSelect = (templateId: string) => {
    setWizardState({ ...wizardState, template: templateId });
    if (templateId === 'blank') {
      setCurrentStep('details');
    } else if (templateId === 'personal_assistant') {
      setCurrentStep('usecase');
    } else {
      setCurrentStep('industry');
    }
  };

  const handleIndustrySelect = (industry: Industry) => {
    setWizardState({ ...wizardState, industry });
    setCurrentStep('usecase');
  };

  const handleUseCaseSelect = (useCase: UseCase) => {
    setWizardState({ ...wizardState, useCase });
    setCurrentStep('details');
  };

  const handleCreateAgent = async () => {
    if (!organizationId) {
      alert('Organization ID not found');
      return;
    }
    if (!wizardState.agentName || !wizardState.mainGoal) return;

    setIsCreating(true);

    try {
      const { elevenlabsApi } = await import('../services/elevenlabsApi');
      
      const agentType = wizardState.template === 'business_assistant' ? 'voice' : 'voice';

      const response = await elevenlabsApi.createAgent({
        organization_id: organizationId,
        name: wizardState.agentName,
        description: wizardState.mainGoal,
        agent_type: agentType,
        system_prompt: wizardState.mainGoal,
        first_message: 'Hello! How can I help you today?',
        language: 'en',
        temperature: 0.7,
        max_tokens: 500,
        template: wizardState.template,
        industry: wizardState.industry?.id,
        use_case: wizardState.useCase?.id,
        website: wizardState.website,
      });

      navigate(`/ai-agents/agent/${response.data.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
      setIsCreating(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const getProgressDots = () => {
    if (wizardState.template === 'blank') {
      return ['template', 'details'];
    } else if (wizardState.template === 'personal_assistant') {
      return ['template', 'usecase', 'details'];
    } else {
      return ['template', 'industry', 'usecase', 'details'];
    }
  };

  const progressDots = getProgressDots();
  const currentStepIndex = progressDots.indexOf(currentStep);

  return (
    <div className="bg-white dark:bg-gray-900 flex items-center justify-center p-4 min-h-screen">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Wizard Container */}
      <div className="w-full max-w-3xl">
        {/* Step 1: Choose Template */}
        {currentStep === 'template' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">New agent</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                What type of agent would you like to create?
              </p>
            </div>

            <div className="space-y-4">
              {agentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-red-500 dark:hover:border-red-500 transition-all text-left group"
                >
                  {template.type === 'blank' ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        <span className="text-2xl">◯</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          {template.type === 'personal_assistant' ? (
                            <User className="w-6 h-6 text-white" />
                          ) : (
                            <Briefcase className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                        </div>
                      </div>
                      {/* Conversation Preview */}
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                            {template.preview.userMessage}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] whitespace-pre-line">
                            {template.preview.agentResponse}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Industry */}
        {currentStep === 'industry' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What industry is your business in?
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Select the industry that best describes your business
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {industries.map((industry) => {
                const isOther = industry.id === 'other';
                return (
                  <button
                    key={industry.id}
                    onClick={() => handleIndustrySelect(industry.id)}
                    className={`p-6 bg-white dark:bg-gray-800 border-2 ${
                      isOther
                        ? 'border-dashed border-gray-300 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        {getIcon(industry.icon)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {industry.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                More coming soon
              </p>
            </div>

            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 3: Choose Use Case */}
        {currentStep === 'usecase' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Use case</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                What will your agent help with?
              </p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${wizardState.template === 'personal_assistant' ? '' : 'lg:grid-cols-3'} gap-4 mb-4`}>
              {(wizardState.template === 'personal_assistant' ? personalUseCases : businessUseCases).map((useCase) => {
                const isOtherPersonal = useCase.id === 'other_personal';
                return (
                  <button
                    key={useCase.id}
                    onClick={() => handleUseCaseSelect(useCase.id)}
                    className={`p-6 bg-white dark:bg-gray-800 border-2 ${
                      isOtherPersonal
                        ? 'border-dashed border-gray-300 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all group`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        {getIcon(useCase.icon)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {useCase.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                More coming soon
              </p>
            </div>

            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Step 4: Agent Details */}
        {currentStep === 'details' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Complete your agent
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Name your agent, describe its goal, and optionally add your website
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Agent Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={wizardState.agentName}
                  onChange={(e) => setWizardState({ ...wizardState, agentName: e.target.value })}
                  placeholder="Enter agent name..."
                  maxLength={50}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 dark:focus:border-red-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
                />
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {wizardState.agentName.length}/50
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={wizardState.website}
                  onChange={(e) => setWizardState({ ...wizardState, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 dark:focus:border-red-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll only access publicly available information from your website to personalize
                  your agent.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Main Goal <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={wizardState.mainGoal}
                  onChange={(e) => setWizardState({ ...wizardState, mainGoal: e.target.value })}
                  placeholder="Describe what you want your agent to accomplish..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 dark:focus:border-red-500 focus:outline-none text-gray-900 dark:text-white resize-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() =>
                    setWizardState({ ...wizardState, chatOnly: !wizardState.chatOnly })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    wizardState.chatOnly ? 'bg-gray-400' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      wizardState.chatOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Chat only</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Audio will not be processed and only text will be used
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={!wizardState.agentName || !wizardState.mainGoal || isCreating}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {progressDots.map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? 'bg-gray-900 dark:bg-white'
                  : index < currentStepIndex
                  ? 'bg-gray-400 dark:bg-gray-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
