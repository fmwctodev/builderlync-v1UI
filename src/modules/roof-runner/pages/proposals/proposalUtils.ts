import type { ProposalStatus } from '../../types/proposalIntegration';

export function getStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    case 'waiting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'expired': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'archived': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
}

export function getStatusDot(status: ProposalStatus): string {
  switch (status) {
    case 'draft': return 'bg-gray-400';
    case 'waiting': return 'bg-blue-500';
    case 'accepted': return 'bg-green-500';
    case 'declined': return 'bg-red-500';
    case 'expired': return 'bg-orange-500';
    case 'archived': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

export function getStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'waiting': return 'Sent';
    case 'accepted': return 'Accepted';
    case 'declined': return 'Declined';
    case 'expired': return 'Expired';
    case 'archived': return 'Archived';
    default: return status;
  }
}

export function formatCurrency(value: number | undefined | null): string {
  if (!value && value !== 0) return '--';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatRelativeDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
