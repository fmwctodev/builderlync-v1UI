import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEnvironment } from '../../hooks/useEnvironment';

const STORAGE_KEY = 'test_address_notice_dismissed';

interface TestAddressNoticeProps {
  className?: string;
  variant?: 'inline' | 'card';
}

const TestAddressNotice: React.FC<TestAddressNoticeProps> = ({
  className = '',
  variant = 'inline'
}) => {
  const { isNonProduction } = useEnvironment();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  if (!isNonProduction || isDismissed) {
    return null;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Test Environment Notice
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This environment only supports a limited set of test addresses. Use the Postman collection to seed additional test properties.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-sm ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <Info className="w-4 h-4" />
        <span>Test addresses only</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This environment only supports a limited set of test addresses. Use the Postman collection to seed additional test properties.
            </p>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded transition-colors"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAddressNotice;
