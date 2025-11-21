import { CheckCircle, Circle } from 'lucide-react';

export default function GetStarted() {
  const steps = [
    {
      id: 1,
      title: 'Connect Payment Gateway',
      description: 'Link your Stripe or QuickBooks account to accept payments',
      completed: false,
    },
    {
      id: 2,
      title: 'Create Your First Invoice',
      description: 'Set up an invoice template and send it to customers',
      completed: false,
    },
    {
      id: 3,
      title: 'Configure Payment Settings',
      description: 'Set your default payment methods and fee structures',
      completed: false,
    },
    {
      id: 4,
      title: 'Set Up Documents & Contracts',
      description: 'Create proposal and contract templates',
      completed: false,
    },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get started with our step-by-step guide to set up your payment system
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Step {step.id}: {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    {step.completed ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? <button className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</button>
          </p>
        </div>
      </div>
    </div>
  );
}
