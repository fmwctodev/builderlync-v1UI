import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';

interface OnboardingLayoutProps {
  currentStep: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const steps = [
  { number: 1, title: 'Welcome', path: '/onboarding/welcome' },
  { number: 2, title: 'Integrations', path: '/onboarding/integrations' },
  { number: 3, title: 'Team', path: '/onboarding/team' },
  { number: 4, title: 'Phone Setup', path: '/onboarding/phone-setup' },
  { number: 5, title: 'Lead Sources', path: '/onboarding/lead-sources' },
  { number: 6, title: 'Pipeline', path: '/onboarding/pipeline' },
  { number: 7, title: 'Branding', path: '/onboarding/branding' },
  { number: 8, title: 'Billing', path: '/onboarding/billing' },
  { number: 9, title: 'AI Agent', path: '/onboarding/ai-agent' },
  { number: 10, title: 'Review', path: '/onboarding/review' },
];

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  title,
  description,
  children,
}) => {
  const navigate = useNavigate();
  const totalSteps = steps.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo/icon.png" alt="BuilderLync" className="w-10 h-10 object-contain mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Account Setup</h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be saved and you can continue later.')) {
                  navigate('/');
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Save & Exit
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Step Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Setup Steps</h3>
              <div className="space-y-3">
                {steps.map((step) => {
                  const status = getStepStatus(step.number);
                  return (
                    <div
                      key={step.number}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        status === 'current'
                          ? 'bg-red-50'
                          : status === 'completed'
                          ? 'cursor-pointer hover:bg-gray-50'
                          : ''
                      }`}
                      onClick={() => {
                        if (status === 'completed') {
                          navigate(step.path);
                        }
                      }}
                    >
                      {status === 'completed' ? (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : status === 'current' ? (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">{step.number}</span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-400 font-semibold">{step.number}</span>
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          status === 'current'
                            ? 'text-gray-900 font-semibold'
                            : status === 'completed'
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600">{description}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
