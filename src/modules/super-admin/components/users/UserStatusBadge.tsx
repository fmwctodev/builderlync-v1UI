import React from 'react';
import { clsx } from 'clsx';
import { UserStatus } from '../../types';
import { CheckCircle, Mail, Ban } from 'lucide-react';

interface UserStatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md';
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    switch (status) {
      case 'active':
        return <CheckCircle className={iconSize} />;
      case 'invited':
        return <Mail className={iconSize} />;
      case 'disabled':
        return <Ban className={iconSize} />;
      default:
        return null;
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium border rounded-full capitalize',
        getStyles(),
        sizeClasses
      )}
    >
      {getIcon()}
      {status}
    </span>
  );
};
