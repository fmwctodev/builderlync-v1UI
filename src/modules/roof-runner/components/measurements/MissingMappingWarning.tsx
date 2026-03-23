import { AlertTriangle } from 'lucide-react';

interface MissingMappingWarningProps {
  missingItems: string[];
}

export function MissingMappingWarning({ missingItems }: MissingMappingWarningProps) {
  if (missingItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Credit mapping not configured
          </h4>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            The following items do not have credit costs configured. Please contact support to resolve this issue.
          </p>
          <ul className="mt-2 space-y-1">
            {missingItems.map((item) => (
              <li
                key={item}
                className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
