import React, { useState } from 'react';
import { Sparkles, RotateCcw, X } from 'lucide-react';
import { isStagingMode } from '../utils/stagingAuth';
import { resetDemoData } from '../utils/demoBackend';

/**
 * Demo-mode banner shown across the iframe-able demo environment.
 *
 * Replaces the previous amber "STAGING MODE / auth bypassed" warning with
 * a customer-facing pitch: clear "Live Demo" badge, an explanation that
 * the data is sample data, and a Reset Demo button so visitors can wipe
 * their session and start over with fresh fixtures.
 *
 * Dismissible per page-load (sessionStorage); reappears on next refresh.
 */
export const StagingBanner: React.FC = () => {
  const isStaging = isStagingMode();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('staging-banner-dismissed') === '1';
  });
  const [resetting, setResetting] = useState(false);

  if (!isStaging || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('staging-banner-dismissed', '1');
    }
  };

  const handleReset = () => {
    if (resetting) return;
    if (!window.confirm('Reset the demo? Any contacts, jobs, or proposals you\'ve created in this session will be wiped and replaced with fresh sample data.')) {
      return;
    }
    setResetting(true);
    resetDemoData();
    // Hard reload so the freshly-seeded fixtures are picked up everywhere.
    window.location.reload();
  };

  return (
    <div className="bg-gradient-to-r from-signal-700 via-signal-600 to-signal-500 text-white text-sm shadow-s2">
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Live Demo
          </span>
          <span className="hidden sm:inline text-white/95 truncate">
            You're test-driving BuilderLync with sample data — every action is fully interactive. Edits persist in your browser only.
          </span>
          <span className="sm:hidden text-white/95 truncate">
            BuilderLync Demo — sample data
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting…' : 'Reset Demo'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss demo banner"
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
