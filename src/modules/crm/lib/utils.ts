/**
 * Utility functions for the CRM application
 */

/**
 * Format a date string into a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

/**
 * Get a friendly time difference (e.g., "2 hours ago")
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a month
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as regular date for older dates
  return formatDate(dateString);
}

/**
 * Get appropriate icon color based on notification type
 */
export function getNotificationColor(type: 'info' | 'success' | 'warning' | 'error'): string {
  switch (type) {
    case 'info':
      return 'text-primary-500 bg-primary-100 dark:bg-primary-900 dark:text-primary-300';
    case 'success':
      return 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
    case 'warning':
      return 'text-amber-500 bg-amber-100 dark:bg-amber-900 dark:text-amber-300';
    case 'error':
      return 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
  }
}