import { X, AlertTriangle, Clock } from 'lucide-react';
import type { StormToast } from '../../hooks/useStormAlertToast';
import { formatAlertExpiry, getAlertFillColor } from '../../services/nwsApiService';

export interface StormAlertToastBannerProps {
  toasts: StormToast[];
  onDismiss: (id: string) => void;
}

export function StormAlertToastBanner({ toasts, onDismiss }: StormAlertToastBannerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-orange-200 dark:border-orange-800 overflow-hidden animate-slide-in"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className="flex items-start gap-3 p-3">
            <div
              className="w-2 self-stretch rounded-full flex-shrink-0"
              style={{ backgroundColor: getAlertFillColor(toast.alert) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {toast.alert.event}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                {toast.alert.areaDesc}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                    toast.alert.severity === 'Extreme'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : toast.alert.severity === 'Severe'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {toast.alert.severity}
                </span>
                {toast.alert.maxHailInches && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {toast.alert.maxHailInches}" hail
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-xs text-gray-400 ml-auto">
                  <Clock className="w-3 h-3" />
                  {formatAlertExpiry(toast.alert.expires)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
