import React from 'react';
import { User, Plus } from 'lucide-react';

interface CustomerInfoPanelProps {
  customerId: string | null;
}

export function CustomerInfoPanel({ customerId }: CustomerInfoPanelProps) {
  if (!customerId) {
    return (
      <div className="p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <User className="w-5 h-5" />
          <span className="text-sm">No customer linked</span>
        </div>
        <button
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Plus className="w-4 h-4" />
          Link customer
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Customer</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {customerId.slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
}
