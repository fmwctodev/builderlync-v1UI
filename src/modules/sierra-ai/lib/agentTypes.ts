export type AgentStatus = 'active' | 'paused' | 'draft';
export type AgentChannel = 'voice' | 'sms' | 'webchat';
export type Industry =
  | 'roofing'
  | 'solar'
  | 'siding'
  | 'gutters'
  | 'other';

export type PersonalUseCase =
  | 'personal_assistant'
  | 'task_management'
  | 'research_assistant'
  | 'other_personal';

export type BusinessUseCase =
  | 'customer_support'
  | 'outbound_sales'
  | 'learning_development'
  | 'scheduling'
  | 'lead_qualification'
  | 'answering_service'
  | 'appointment_scheduling'
  | 'product_recommendations'
  | 'order_tracking'
  | 'technical_support'
  | 'reservation_management'
  | 'account_inquiries'
  | 'other';

export type UseCase = PersonalUseCase | BusinessUseCase;

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  status: AgentStatus;
  channels: {
    voice: { enabled: boolean; configured: boolean };
    sms: { enabled: boolean; configured: boolean };
    webchat: { enabled: boolean; configured: boolean };
  };
  industry?: Industry;
  useCase?: UseCase;
  website?: string;
  mainGoal?: string;
  chatOnly: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    callsHandled: number;
    messagesHandled: number;
    appointmentsBooked: number;
  };
}

export interface AgentTemplate {
  id: string;
  type: 'blank' | 'personal_assistant' | 'business_agent';
  name: string;
  description: string;
  preview: {
    userMessage: string;
    agentResponse: string;
  };
  avatar?: string;
}

export interface IndustryOption {
  id: Industry;
  label: string;
  icon: string;
}

export interface UseCaseOption {
  id: UseCase;
  label: string;
  icon: string;
}

export interface PersonalUseCaseOption {
  id: PersonalUseCase;
  label: string;
  icon: string;
}

export interface BusinessUseCaseOption {
  id: BusinessUseCase;
  label: string;
  icon: string;
}
