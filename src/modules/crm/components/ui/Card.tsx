import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  footer,
  hoverable = false,
  bordered = true,
}: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg overflow-hidden
        ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-md' : 'shadow-sm'}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-4">{children}</div>
      
      {footer && (
        <div className="px-6 py-4 bg-paper dark:bg-canvas border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}