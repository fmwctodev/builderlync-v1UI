import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Phone, Search, Sun, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../../modules/roof-runner/store/hooks';
import { clearAllAuth } from '../../utils/authSync';
import DialerModalEnhanced from '../DialerModalEnhanced';
import { IconButton } from '../ui/IconButton';
import { Avatar } from '../ui/Avatar';
import { KBDSequence } from '../ui/KBD';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../ui/cn';

export interface StudioTopBarProps {
  onOpenCommandPalette: () => void;
  /** Optional breadcrumb / page title content rendered on the left. */
  leftSlot?: ReactNode;
  /** Optional right-aligned actions specific to the page. */
  rightSlot?: ReactNode;
  notificationCount?: number;
}

/**
 * 40px top bar that sits above the page content area.
 * Compared to the legacy 64px TopBar, it's quieter, mono-numeric, and uses
 * IconButton primitives — no per-page custom chrome.
 */
export function StudioTopBar({
  onOpenCommandPalette,
  leftSlot,
  rightSlot,
  notificationCount = 0,
}: StudioTopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [dialerOpen, setDialerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const meta = user?.user_metadata;
  const fullName = meta?.full_name
    ?? `${meta?.firstName ?? ''} ${meta?.lastName ?? ''}`.trim();

  return (
    <header
      className={cn(
        'h-10 shrink-0 flex items-center justify-between gap-3 px-4',
        'bg-surface-1 dark:bg-surface-d-1 border-b border-edge-soft dark:border-edge-d-soft',
      )}
    >
      {/* Left — breadcrumb / page chrome */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {leftSlot}
      </div>

      {/* Right — global actions */}
      <div className="flex items-center gap-1 shrink-0">
        {rightSlot}

        {/* Search trigger (compact) */}
        <Tooltip content="Search · ⌘K">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:inline-flex items-center gap-2 h-7 px-2 rounded-studio-1 bg-surface-2 dark:bg-surface-d-2 hover:bg-surface-3 dark:hover:bg-surface-d-3 transition-colors duration-fast text-ink-3 dark:text-ink-d-3"
            aria-label="Search · Cmd K"
          >
            <Search className="w-3.5 h-3.5" />
            <KBDSequence keys={['⌘', 'K']} size="sm" />
          </button>
        </Tooltip>

        <IconButton
          label="Open dialer"
          variant="ghost"
          size="sm"
          onClick={() => setDialerOpen(true)}
        >
          <Phone />
        </IconButton>

        <IconButton
          label="Notifications"
          variant="ghost"
          size="sm"
          className="relative"
        >
          <Bell />
          {notificationCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal-500 ring-2 ring-surface-1 dark:ring-surface-d-1"
              aria-label={`${notificationCount} unread`}
            />
          )}
        </IconButton>

        <IconButton
          label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </IconButton>

        {/* Profile menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 h-8 pl-1 pr-1.5 rounded-studio-2 hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-label="Account menu"
          >
            <Avatar name={fullName || 'User'} size="sm" />
            <ChevronDown
              className={cn(
                'w-3 h-3 text-ink-3 dark:text-ink-d-3 transition-transform duration-fast',
                profileOpen && 'rotate-180',
              )}
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                className="absolute right-0 mt-1 w-64 z-50 rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 overflow-hidden"
              >
                <div className="px-3 py-3 border-b border-edge-soft dark:border-edge-d-soft flex items-center gap-3">
                  <Avatar name={fullName || 'User'} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="studio-text-body-strong truncate">{fullName || 'User'}</div>
                    <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
                      {user?.email ?? ''}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    setProfileOpen(false);
                    await clearAllAuth();
                    navigate('/auth/login');
                  }}
                  className="flex items-center gap-2 w-full px-3 h-10 text-left studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
                >
                  <LogOut className="w-4 h-4 text-ink-3 dark:text-ink-d-3" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <DialerModalEnhanced isOpen={dialerOpen} onClose={() => setDialerOpen(false)} />
    </header>
  );
}
