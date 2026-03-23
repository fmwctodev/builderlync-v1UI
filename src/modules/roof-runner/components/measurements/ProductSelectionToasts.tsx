import { X, Info } from 'lucide-react';
import type { ToastMessage } from '../../hooks/useProductSelectionToast';

interface ProductSelectionToastsProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ProductSelectionToasts({ toasts, onDismiss }: ProductSelectionToastsProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 animate-in slide-in-from-right-2 duration-300"
        >
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-auto text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
