import { SystemMetric, ApiService } from '../types/system';

export function getMetricStatus(
  value: number,
  thresholdWarning: number | null,
  thresholdCritical: number | null
): 'good' | 'warning' | 'critical' {
  if (thresholdCritical !== null && value >= thresholdCritical) {
    return 'critical';
  }
  if (thresholdWarning !== null && value >= thresholdWarning) {
    return 'warning';
  }
  return 'good';
}

export function formatMetricValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'connections') {
    return value.toLocaleString();
  }
  if (unit === 'req/min') {
    return value.toLocaleString();
  }
  return `${value} ${unit}`;
}

export function formatDuration(milliseconds: number | null): string {
  if (milliseconds === null) return 'N/A';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null) return 'N/A';
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getServiceStatusColor(status: ApiService['status']): string {
  switch (status) {
    case 'operational':
      return 'text-green-600 bg-green-100';
    case 'degraded':
      return 'text-yellow-600 bg-yellow-100';
    case 'down':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getJobStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'running':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-gray-600 bg-gray-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getReleaseTypeColor(type: string): string {
  switch (type) {
    case 'major':
      return 'text-red-600 bg-red-100';
    case 'minor':
      return 'text-red-600 bg-red-100';
    case 'patch':
      return 'text-green-600 bg-green-100';
    case 'hotfix':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function calculateUptime(service: ApiService): number {
  return service.uptime_percentage;
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
