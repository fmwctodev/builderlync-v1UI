import {
  PhoneCall, Receipt, Map, Package, CreditCard, Globe, Mail, Brain,
  CheckCircle, AlertTriangle, XCircle, HelpCircle, Server
} from 'lucide-react';
import { ProviderStatus, ProviderCategory } from '../types/integrations';

export function getProviderIcon(key: string) {
  const iconMap: Record<string, any> = {
    twilio: PhoneCall,
    quickbooks: Receipt,
    eagleview: Map,
    abc_supply: Package,
    srs: Package,
    beacon: Package,
    stripe: CreditCard,
    google: Globe,
    microsoft: Globe,
    openai: Brain,
    sendgrid: Mail,
    mailgun: Mail,
  };
  return iconMap[key] || Server;
}

export function getCategoryIcon(category: ProviderCategory) {
  const iconMap: Record<ProviderCategory, any> = {
    telephony: PhoneCall,
    accounting: Receipt,
    roofing: Map,
    supplier: Package,
    payments: CreditCard,
    auth: Globe,
    email: Mail,
    ai: Brain,
  };
  return iconMap[category] || Server;
}

export function getStatusColor(status: ProviderStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'unknown':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusIcon(status: ProviderStatus) {
  switch (status) {
    case 'healthy':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return XCircle;
    case 'unknown':
      return HelpCircle;
    default:
      return HelpCircle;
  }
}

export function getCategoryColor(category: ProviderCategory): string {
  const colors: Record<ProviderCategory, string> = {
    telephony: 'bg-red-100 text-red-800',
    accounting: 'bg-green-100 text-green-800',
    roofing: 'bg-red-100 text-red-800',
    supplier: 'bg-orange-100 text-orange-800',
    payments: 'bg-red-100 text-red-800',
    auth: 'bg-cyan-100 text-cyan-800',
    email: 'bg-pink-100 text-pink-800',
    ai: 'bg-red-100 text-red-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

export function formatLastCheck(timestamp?: string | null): string {
  if (!timestamp) return 'Never';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function maskApiKey(key: string): string {
  if (key.length <= 12) return key;
  const prefix = key.substring(0, 8);
  const suffix = key.substring(key.length - 4);
  return `${prefix}****${suffix}`;
}

export function generateRandomKey(prefix: string = 'blk_live_'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatScopes(scopes: string[]): string {
  if (scopes.length === 0) return 'No scopes';
  if (scopes.length <= 3) return scopes.join(', ');
  return `${scopes.slice(0, 3).join(', ')} +${scopes.length - 3} more`;
}
