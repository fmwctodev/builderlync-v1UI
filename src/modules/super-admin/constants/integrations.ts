export interface SuperAdminIntegrationConfig {
  id: string;
  name: string;
  description: string;
  category: 'Communication' | 'Productivity' | 'Support' | 'Payment';
  icon?: string;
  learnMoreUrl?: string;
  setupInstructionsUrl?: string;
  connectedTo?: string;
}

export const SUPER_ADMIN_INTEGRATIONS: SuperAdminIntegrationConfig[] = [
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send software end users SMS notifications about their account, 2FA, and system alerts',
    category: 'Communication',
    learnMoreUrl: 'https://www.twilio.com/docs',
    setupInstructionsUrl: '#',
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Send software end users email notifications and sync profile information',
    category: 'Productivity',
    learnMoreUrl: 'https://workspace.google.com/',
    setupInstructionsUrl: '#',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage support tickets and bug reports for end users and DevOps teams',
    category: 'Support',
    learnMoreUrl: 'https://www.atlassian.com/software/jira',
    setupInstructionsUrl: '#',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Manage account billing, subscriptions, and payment processing for new accounts',
    category: 'Payment',
    learnMoreUrl: 'https://stripe.com/docs',
    setupInstructionsUrl: '#',
  },
];

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Communication': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'Productivity': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'Support': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'Payment': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export const getIntegrationById = (id: string): SuperAdminIntegrationConfig | undefined => {
  return SUPER_ADMIN_INTEGRATIONS.find(integration => integration.id === id);
};
