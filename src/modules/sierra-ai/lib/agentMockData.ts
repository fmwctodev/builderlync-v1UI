import { Agent, AgentTemplate, IndustryOption, UseCaseOption, PersonalUseCaseOption, BusinessUseCaseOption } from './agentTypes';

export const mockAgents: Agent[] = [];

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'blank',
    type: 'blank',
    name: 'Blank Agent',
    description: 'Start from scratch and build a completely custom agent',
    preview: {
      userMessage: '',
      agentResponse: '',
    },
  },
  {
    id: 'personal_assistant',
    type: 'personal_assistant',
    name: 'Personal Assistant',
    description: 'Helpful agent for managing tasks and queries',
    preview: {
      userMessage: 'Could you see whether I have any urgent outstanding emails?',
      agentResponse: "Sure, let me check.\n\nYou've got one urgent email from your manager about tomorrow's meeting. Want a quick summary, or should I help you pick the best fit?",
    },
  },
  {
    id: 'business_agent',
    type: 'business_agent',
    name: 'Business Agent',
    description: 'Professional agent for business communications',
    preview: {
      userMessage: 'Can you tell me more about pricing?',
      agentResponse: "Absolutely! We offer three plans: Starter, Pro, and Enterprise. Want a quick breakdown, or should I help you pick the best fit?",
    },
  },
];

export const industries: IndustryOption[] = [
  { id: 'roofing', label: 'Roofing', icon: 'Home' },
  { id: 'solar', label: 'Solar', icon: 'Sun' },
  { id: 'siding', label: 'Siding', icon: 'Layers' },
  { id: 'gutters', label: 'Gutters', icon: 'Droplets' },
  { id: 'other', label: 'Other', icon: 'HelpCircle' },
];

export const personalUseCases: PersonalUseCaseOption[] = [
  { id: 'personal_assistant', label: 'Personal Assistant', icon: 'UserCheck' },
  { id: 'task_management', label: 'Task Management', icon: 'ListChecks' },
  { id: 'research_assistant', label: 'Research Assistant', icon: 'Search' },
  { id: 'other_personal', label: 'Other', icon: 'Plus' },
];

export const businessUseCases: BusinessUseCaseOption[] = [
  { id: 'customer_support', label: 'Customer Support', icon: 'Headphones' },
  { id: 'outbound_sales', label: 'Outbound Sales', icon: 'TrendingUp' },
  { id: 'learning_development', label: 'Learning and Development', icon: 'BookOpen' },
  { id: 'scheduling', label: 'Scheduling', icon: 'Calendar' },
  { id: 'lead_qualification', label: 'Lead Qualification', icon: 'Users' },
  { id: 'answering_service', label: 'Answering Service', icon: 'Phone' },
  { id: 'appointment_scheduling', label: 'Appointment Scheduling', icon: 'CalendarCheck' },
  { id: 'product_recommendations', label: 'Product Recommendations', icon: 'ShoppingCart' },
  { id: 'order_tracking', label: 'Order Tracking', icon: 'Package' },
  { id: 'technical_support', label: 'Technical Support', icon: 'Wrench' },
  { id: 'reservation_management', label: 'Reservation Management', icon: 'CalendarClock' },
  { id: 'account_inquiries', label: 'Account Inquiries', icon: 'CreditCard' },
  { id: 'other', label: 'Other', icon: 'HelpCircle' },
];

export const useCases: UseCaseOption[] = [...personalUseCases, ...businessUseCases];
