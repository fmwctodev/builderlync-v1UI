import React from 'react';

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton';
  rows?: number;
}

export function LoadingState({
  message = 'Loading...',
  type = 'spinner',
  rows = 3
}: LoadingStateProps) {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {Array(rows)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}