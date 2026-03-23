import { CheckCircle, ExternalLink } from 'lucide-react';

export function EagleViewModeNotice() {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
            Using your EagleView account
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Credits are not required when ordering through your EagleView account.
            Charges will be applied directly to your EagleView billing.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>EagleView</span>
        </div>
      </div>
    </div>
  );
}
