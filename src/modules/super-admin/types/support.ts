export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  account_id?: string | null;
  contact_email: string;
  contact_name?: string | null;
  subject: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string | null;
  assigned_to?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
  first_response_at?: string | null;
  resolved_at?: string | null;
  sla_breached?: boolean;
  tags: string[];
  enterprise_accounts?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_type: 'customer' | 'internal';
  author_name?: string | null;
  author_email?: string | null;
  body: string;
  created_at: string;
  is_internal_note: boolean;
}

export interface NpsResponse {
  id: string;
  account_id?: string | null;
  contact_email?: string | null;
  score: number;
  comment?: string | null;
  created_at: string;
  source?: string | null;
  sentiment?: string | null;
  enterprise_accounts?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface ProductFeedback {
  id: string;
  account_id?: string | null;
  contact_email?: string | null;
  type?: string | null;
  title: string;
  body: string;
  area?: string | null;
  severity?: string | null;
  created_at: string;
  status: string;
  enterprise_accounts?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AccountHealthSnapshot {
  id: string;
  account_id: string;
  period: string;
  health_score: number;
  risk_level: RiskLevel;
  tickets_open: number;
  nps_latest?: number | null;
  usage_score?: number | null;
  notes?: string | null;
  created_at: string;
  enterprise_accounts?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalNps: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  highRiskAccounts: number;
  averageHealthScore: number;
}
