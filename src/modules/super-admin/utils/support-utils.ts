import {
  CheckCircle, Clock, XCircle, AlertTriangle, AlertOctagon, Smile, Meh, Frown
} from 'lucide-react';
import { TicketStatus, TicketPriority, RiskLevel, NpsResponse } from '../types/support';

export function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'waiting':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case 'open':
    case 'in_progress':
      return Clock;
    case 'waiting':
      return AlertTriangle;
    case 'resolved':
    case 'closed':
      return CheckCircle;
    default:
      return Clock;
  }
}

export function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case 'low':
      return 'bg-gray-100 text-gray-800';
    case 'medium':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-amber-100 text-amber-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPriorityIcon(priority: TicketPriority) {
  switch (priority) {
    case 'urgent':
      return AlertOctagon;
    case 'high':
      return AlertTriangle;
    default:
      return Clock;
  }
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getRiskIcon(risk: RiskLevel) {
  switch (risk) {
    case 'low':
      return CheckCircle;
    case 'medium':
      return AlertTriangle;
    case 'high':
      return AlertOctagon;
    default:
      return AlertTriangle;
  }
}

export function calculateNPS(responses: NpsResponse[]): number {
  if (responses.length === 0) return 0;

  const promoters = responses.filter(r => r.score >= 9).length;
  const detractors = responses.filter(r => r.score <= 6).length;

  const promoterPercent = (promoters / responses.length) * 100;
  const detractorPercent = (detractors / responses.length) * 100;

  return Math.round(promoterPercent - detractorPercent);
}

export function categorizeNpsScore(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

export function getNpsScoreColor(score: number): string {
  if (score >= 9) return 'bg-green-100 text-green-800';
  if (score >= 7) return 'bg-red-100 text-red-800';
  return 'bg-red-100 text-red-800';
}

export function getNpsIcon(score: number) {
  if (score >= 9) return Smile;
  if (score >= 7) return Meh;
  return Frown;
}

export function formatTicketAge(created_at: string): string {
  const created = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays === 0) {
    if (diffHours === 0) return 'Just now';
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} old`;
  }
  if (diffDays === 1) return '1 day old';
  return `${diffDays} days old`;
}

export function formatResolutionTime(created_at: string, resolved_at?: string | null): string {
  if (!resolved_at) return 'N/A';

  const created = new Date(created_at);
  const resolved = new Date(resolved_at);
  const diffMs = resolved.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return `${diffDays}d ${remainingHours}h`;
  }
  return `${diffHours}h`;
}

export function getHealthScoreColor(score: number): string {
  if (score >= 71) return 'bg-green-500';
  if (score >= 41) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getHealthScoreTextColor(score: number): string {
  if (score >= 71) return 'text-green-600';
  if (score >= 41) return 'text-amber-600';
  return 'text-red-600';
}

export function truncateComment(text: string, length: number = 100): string {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
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
