import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'invoice' | 'estimate' | 'document' | 'transaction' | 'coupon' | 'payment' | 'funding';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'invoice' }) => {
  const getStatusStyles = () => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

    if (type === 'invoice') {
      switch (normalizedStatus) {
        case 'draft':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        case 'due':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        case 'received':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'overdue':
          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    if (type === 'estimate') {
      switch (normalizedStatus) {
        case 'draft':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        case 'sent':
          return 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-blue-300';
        case 'accepted':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'rejected':
          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        case 'expired':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    if (type === 'document') {
      switch (normalizedStatus) {
        case 'draft':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        case 'waiting':
        case 'waiting_for_others':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        case 'completed':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'payments':
          return 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-blue-300';
        case 'archived':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    if (type === 'transaction' || type === 'payment') {
      switch (normalizedStatus) {
        case 'approved':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'pending':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        case 'failed':
          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        case 'declined':
          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    if (type === 'funding') {
      switch (normalizedStatus) {
        case 'funded':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'in_transit':
          return 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-blue-300';
        case 'not_funded':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        case 'error':
          return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        case 'ach_return':
          return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    if (type === 'coupon') {
      switch (normalizedStatus) {
        case 'active':
          return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        case 'scheduled':
          return 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-blue-300';
        case 'expired':
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      }
    }

    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
