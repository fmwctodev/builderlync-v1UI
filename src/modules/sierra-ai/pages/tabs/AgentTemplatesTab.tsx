import React from 'react';
import { Layers, Headset, Target, Calendar, HelpCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const templates: Template[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'A friendly AI agent trained to handle common customer support inquiries with empathy and efficiency',
    category: 'Support',
    icon: Headset,
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Agent',
    description: 'Engages with potential customers to qualify leads and book appointments with your sales team',
    category: 'Sales',
    icon: Target,
  },
  {
    id: 'appointment-scheduler',
    name: 'Appointment Scheduler',
    description: 'Manages calendar bookings and reschedules appointments while maintaining a professional demeanor',
    category: 'Scheduling',
    icon: Calendar,
  },
  {
    id: 'faq-assistant',
    name: 'FAQ Assistant',
    description: 'Answers frequently asked questions about your products or services with accurate information',
    category: 'Support',
    icon: HelpCircle,
  },
];

export function AgentTemplatesTab() {
  return (
    <div className="relative p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agent Templates</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Get started quickly with pre-configured agent templates designed for common use cases.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Category Badge */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mb-3">
                {template.category}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {template.description}
              </p>

              {/* Use Button */}
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Use Template
              </button>
            </div>
          );
        })}
      </div>

      {/* COMING SOON Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-12 max-w-md mx-4 text-center">
          <Layers className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide">
            COMING SOON
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Agent Templates feature is currently under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
