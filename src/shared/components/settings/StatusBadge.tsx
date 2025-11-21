import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'info'
}) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-primary-100 text-blue-800 dark:bg-primary-900 dark:text-blue-200',
    primary: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variantClasses[variant]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;