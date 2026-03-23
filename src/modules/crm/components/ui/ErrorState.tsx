import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this data. Please try again later.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300">{title}</h3>
      <p className="mt-2 text-sm text-red-700 dark:text-red-400">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-4 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}