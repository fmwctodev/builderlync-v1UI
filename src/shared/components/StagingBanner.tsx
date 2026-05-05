import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isStagingMode, STAGING_MOCK_USER, STAGING_MOCK_ORG } from '../utils/stagingAuth';

/**
 * Visible banner shown only on staging. Makes it obvious the user is in a
 * test environment so design-review screenshots aren't mistaken for prod.
 *
 * Dismissible per page-load (sessionStorage); reappears on next refresh.
 */
export const StagingBanner: React.FC = () => {
  const isStaging = isStagingMode();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('staging-banner-dismissed') === '1';
  });

  if (!isStaging || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('staging-banner-dismissed', '1');
    }
  };

  return (
    <div className="bg-amber-500 text-amber-950 border-b border-amber-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">STAGING MODE</span>
          <span className="hidden sm:inline opacity-90">
            Auth bypassed · Logged in as{' '}
            <code className="font-mono text-xs bg-amber-600/20 px-1 rounded">
              {STAGING_MOCK_USER.email}
            </code>{' '}
            in{' '}
            <code className="font-mono text-xs bg-amber-600/20 px-1 rounded">
              {STAGING_MOCK_ORG.slug}
            </code>
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss staging banner"
          className="shrink-0 p-1 rounded hover:bg-amber-600/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
