import {
  Shield, ShieldCheck, ShieldAlert, User, Cpu,
  AlertTriangle, AlertOctagon, Info, XCircle, CheckCircle
} from 'lucide-react';
import { AuditActorType, SecurityEventSeverity, UserSecurityProfile } from '../types/security';

export function getActorTypeColor(actorType: AuditActorType): string {
  switch (actorType) {
    case 'super_admin':
      return 'bg-red-100 text-red-800';
    case 'account_admin':
      return 'bg-red-100 text-red-800';
    case 'user':
      return 'bg-gray-100 text-gray-800';
    case 'system':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getActorTypeIcon(actorType: AuditActorType) {
  switch (actorType) {
    case 'super_admin':
      return ShieldAlert;
    case 'account_admin':
      return Shield;
    case 'user':
      return User;
    case 'system':
      return Cpu;
    default:
      return User;
  }
}

export function getSeverityColor(severity: SecurityEventSeverity): string {
  switch (severity) {
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'medium':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getSeverityIcon(severity: SecurityEventSeverity) {
  switch (severity) {
    case 'low':
      return Info;
    case 'medium':
      return AlertTriangle;
    case 'high':
      return AlertOctagon;
    case 'critical':
      return XCircle;
    default:
      return Info;
  }
}

export function formatTimestamp(timestamp?: string | null): string {
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
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

export function formatIPAddress(ip?: string | null): string {
  if (!ip) return 'N/A';
  return ip;
}

export function parseUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown';

  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('curl')) return 'curl';
  if (userAgent.includes('Python')) return 'Python';

  return 'Other';
}

export function getMfaStatusColor(enabled: boolean): string {
  return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

export function getMfaStatusIcon(enabled: boolean) {
  return enabled ? CheckCircle : XCircle;
}

export function getRiskLevel(profile: UserSecurityProfile): 'low' | 'medium' | 'high' {
  if (profile.failed_login_count >= 5) return 'high';

  if (profile.last_password_change_at) {
    const daysSinceChange = Math.floor(
      (Date.now() - new Date(profile.last_password_change_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceChange > 180) return 'high';
    if (daysSinceChange > 90) return 'medium';
  }

  if (!profile.mfa_enabled) return 'medium';

  return 'low';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function isHighRiskUser(profile: UserSecurityProfile): boolean {
  return getRiskLevel(profile) === 'high';
}

export function formatResourceAction(resourceType: string, action: string): string {
  const resourceLabel = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  return `${resourceLabel} / ${actionLabel}`;
}

export function validateIPAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  if (cidrRegex.test(ip)) {
    const [ipPart, cidr] = ip.split('/');
    const cidrNum = parseInt(cidr);
    if (cidrNum < 0 || cidrNum > 32) return false;

    const parts = ipPart.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  return false;
}

export function getDaysSincePasswordChange(lastChange?: string | null): number {
  if (!lastChange) return 999;
  return Math.floor((Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24));
}
