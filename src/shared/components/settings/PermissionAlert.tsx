import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PermissionAlertProps {
  message: string;
  type?: 'warning' | 'error' | 'info';
}

const PermissionAlert: React.FC<PermissionAlertProps> = ({
  message,
  type = 'warning'
}) => {
  const typeClasses = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    info: 'bg-primary-50 border-blue-200 text-blue-800 dark:bg-primary-900/20 dark:border-blue-800 dark:text-blue-200'
  };

  const iconColors = {
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-primary-600 dark:text-primary-400'
  };

  return (
    <div className={`border rounded-lg p-4 ${typeClasses[type]}`}>
      <div className="flex items-center">
        <AlertTriangle className={`w-5 h-5 mr-2 ${iconColors[type]}`} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default PermissionAlert;