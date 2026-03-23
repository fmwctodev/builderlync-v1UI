export interface NavItem {
  name: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Stat {
  title: string;
  value: string | number;
  change: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: string;
}

export interface ActivityItem {
  id: string;
  type: 'contact' | 'meeting' | 'deal' | 'message';
  title: string;
  description: string;
  time: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'sequence';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  audience: string;
  scheduledDate?: string;
  stats: {
    sent: number;
    delivered: number;
    opened?: number;
    clicked?: number;
    failed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  createdAt: string;
}

export interface Audience {
  id: string;
  name: string;
  type: 'segment' | 'list';
  count: number;
  criteria?: Record<string, any>;
  createdAt: string;
}