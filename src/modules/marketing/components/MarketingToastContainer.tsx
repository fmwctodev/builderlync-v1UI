import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../hooks/useMarketingToast';

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle size={14} className="text-green-500 shrink-0" />,
  error: <XCircle size={14} className="text-red-500 shrink-0" />,
  info: <Info size={14} className="text-blue-500 shrink-0" />,
};

const bgMap = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

export const MarketingToastContainer: React.FC<Props> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium text-gray-800 dark:text-gray-100 ${bgMap[t.type]} animate-slide-up`}
        >
          {iconMap[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="text-gray-400 hover:text-gray-600 ml-2">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};
