import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutGrid, MessageSquare, Calendar, Users, HardHat, CreditCard,
  Camera, Ruler, FileCheck, DollarSign, Package, Clipboard,
  Zap, BarChart, Megaphone, CloudLightning, FolderOpen, Star, BarChart2,
  Bell, LifeBuoy, Settings, ChevronsLeft, ChevronsRight, Sparkles, Search,
  type LucideIcon,
} from 'lucide-react';
import Logo from '../Logo';
import { Tooltip } from '../ui/Tooltip';
import { KBDSequence } from '../ui/KBD';
import { cn } from '../ui/cn';

interface RailItem {
  name: string;
  icon: LucideIcon;
  to: string;
  /** End on exact match — used for the dashboard root. */
  end?: boolean;
}

interface RailSection {
  label: string;
  items: RailItem[];
}

const sections: RailSection[] = [
  {
    label: 'Workspace',
    items: [
      { name: 'Pipeline',      icon: LayoutGrid,    to: 'pipeline' },
      { name: 'Conversations', icon: MessageSquare, to: 'conversations' },
      { name: 'Calendar',      icon: Calendar,      to: 'calendars' },
      { name: 'Contacts',      icon: Users,         to: 'contacts' },
      { name: 'Jobs',          icon: HardHat,       to: 'jobs' },
      { name: 'Payments',      icon: CreditCard,    to: 'payments' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Job Cam',          icon: Camera,    to: 'job-cam' },
      { name: 'Measurements',     icon: Ruler,     to: 'measurements' },
      { name: 'Proposals',        icon: FileCheck, to: 'proposals' },
      { name: 'Instant Estimator', icon: DollarSign, to: 'instant-estimator' },
      { name: 'Material Orders',  icon: Package,   to: 'material-orders' },
      { name: 'Work Orders',      icon: Clipboard, to: 'work-orders' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Automation',     icon: Zap,             to: 'automation' },
      { name: 'Opportunities',  icon: BarChart,        to: 'opportunities' },
      { name: 'Marketing',      icon: Megaphone,       to: 'marketing' },
      { name: 'Storm',          icon: CloudLightning,  to: 'storm-canvassing' },
      { name: 'Files',          icon: FolderOpen,      to: 'file-manager' },
      { name: 'Reputation',     icon: Star,            to: 'reputation' },
      { name: 'Reporting',      icon: BarChart2,       to: 'reporting' },
    ],
  },
];

const systemItems: RailItem[] = [
  { name: 'Support',  icon: LifeBuoy, to: 'support' },
  { name: 'Settings', icon: Settings, to: 'settings' },
];

interface StudioRailProps {
  /** Open the command palette. */
  onOpenCommandPalette: () => void;
  /** Open Sierra assistant panel. */
  onOpenSierra: () => void;
  /** Notification count (0 hides the dot). */
  notificationCount?: number;
  /** Override the orgSlug — defaults to `useParams()` value. */
  orgSlug?: string;
}

export function StudioRail({
  onOpenCommandPalette,
  onOpenSierra,
  notificationCount = 0,
  orgSlug: orgSlugProp,
}: StudioRailProps) {
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = orgSlugProp ?? params.orgSlug ?? 'dev-org';
  const [expanded, setExpanded] = useState(false);

  const base = `/org/${orgSlug}`;
  const railWidth = expanded ? 'w-rail-expanded' : 'w-rail';

  return (
    <aside
      className={cn(
        'shrink-0 h-screen flex flex-col',
        'bg-surface-1 dark:bg-surface-d-1 border-r border-edge-soft dark:border-edge-d-soft',
        'transition-[width] duration-base ease-studio-out',
        railWidth,
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      aria-label="Primary navigation"
    >
      {/* Header — workspace logo + cmd-k */}
      <div className="px-3 py-3 flex items-center gap-2 border-b border-edge-soft dark:border-edge-d-soft">
        <NavLink
          to={`${base}/pipeline`}
          className="flex items-center justify-center w-10 h-10 rounded-studio-2 hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast"
          aria-label="BuilderLync"
        >
          <Logo type="icon" size="md" />
        </NavLink>
        {expanded && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex-1 inline-flex items-center justify-between gap-2 h-9 px-2.5 rounded-studio-2 bg-surface-2 dark:bg-surface-d-2 hover:bg-surface-3 dark:hover:bg-surface-d-3 transition-colors duration-fast text-ink-3 dark:text-ink-d-3 text-body min-w-0"
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 shrink-0" />
              <span className="truncate">Search</span>
            </span>
            <KBDSequence keys={['⌘', 'K']} size="sm" />
          </button>
        )}
      </div>

      {/* Nav body */}
      <nav className="flex-1 overflow-y-auto scrollbar-studio py-2">
        {sections.map((section, idx) => (
          <div key={section.label} className={cn('px-2', idx > 0 && 'mt-2')}>
            {expanded && (
              <div className="px-2 pt-2 pb-1 studio-text-label text-ink-4 dark:text-ink-d-4">
                {section.label}
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.name}>
                  <RailLink item={item} base={base} expanded={expanded} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Sierra, notifications, system */}
      <div className="px-2 py-2 border-t border-edge-soft dark:border-edge-d-soft flex flex-col gap-0.5">
        <Tooltip content="Sierra AI · ⌘⇧K" side="right">
          <button
            type="button"
            onClick={onOpenSierra}
            className={cn('studio-rail-link', expanded && 'w-full justify-start gap-3 px-2')}
            aria-label="Sierra AI Assistant"
          >
            <Sparkles className="w-[18px] h-[18px] shrink-0" />
            {expanded && <span className="studio-text-body">Sierra AI</span>}
          </button>
        </Tooltip>

        <Tooltip content={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`} side="right">
          <button
            type="button"
            className={cn('studio-rail-link relative', expanded && 'w-full justify-start gap-3 px-2')}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px] shrink-0" />
            {expanded && <span className="studio-text-body">Notifications</span>}
            {notificationCount > 0 && (
              <span
                className={cn(
                  'absolute w-2 h-2 rounded-full bg-signal-500 ring-2 ring-surface-1 dark:ring-surface-d-1',
                  expanded ? 'top-2 left-7' : 'top-2 right-2',
                )}
                aria-hidden="true"
              />
            )}
          </button>
        </Tooltip>

        {systemItems.map((item) => (
          <RailLink key={item.name} item={item} base={base} expanded={expanded} />
        ))}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'mt-2 studio-rail-link',
            expanded && 'w-full justify-start gap-3 px-2',
          )}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <>
              <ChevronsLeft className="w-[18px] h-[18px] shrink-0" />
              <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">Collapse</span>
            </>
          ) : (
            <ChevronsRight className="w-[18px] h-[18px] shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}

function RailLink({ item, base, expanded }: { item: RailItem; base: string; expanded: boolean }) {
  const Icon = item.icon;

  if (expanded) {
    return (
      <NavLink
        to={`${base}/${item.to}`}
        end={item.end}
        className={({ isActive }) =>
          cn('studio-rail-link w-full justify-start gap-3 px-2', isActive && 'active')
        }
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="studio-text-body whitespace-nowrap">{item.name}</span>
      </NavLink>
    );
  }

  return (
    <Tooltip content={item.name} side="right">
      <NavLink
        to={`${base}/${item.to}`}
        end={item.end}
        className={({ isActive }) =>
          cn('studio-rail-link', isActive && 'active')
        }
        aria-label={item.name}
      >
        <Icon className="w-[18px] h-[18px]" />
      </NavLink>
    </Tooltip>
  );
}
