import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, ArrowRight, LayoutGrid, MessageSquare, Calendar, Users,
  HardHat, CreditCard, Camera, Ruler, FileCheck, DollarSign, Package,
  Clipboard, Zap, BarChart, Megaphone, CloudLightning, FolderOpen, Star,
  BarChart2, Settings, Sparkles, Plus, FileText,
  type LucideIcon,
} from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';
import { KBDSequence } from '../ui/KBD';
import { cn } from '../ui/cn';

interface CommandItem {
  id: string;
  group: 'Navigate' | 'Create' | 'Actions' | 'AI';
  label: string;
  description?: string;
  icon: LucideIcon;
  /** Path to navigate to (org-scoped, e.g. "pipeline" or "proposals/ai-generate"). */
  to?: string;
  /** Custom run handler — takes precedence over `to`. */
  run?: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';
  const sierra = useSierraAssistant();
  const [query, setQuery] = useState('');

  const items: CommandItem[] = useMemo(() => {
    const navItem = (
      label: string,
      icon: LucideIcon,
      to: string,
      description?: string,
      keywords?: string[],
    ): CommandItem => ({
      id: `nav:${to}`,
      group: 'Navigate',
      label,
      description,
      icon,
      to,
      keywords,
    });

    return [
      // Navigate
      navItem('Pipeline',         LayoutGrid,    'pipeline',         'Lead → Closed at a glance', ['home', 'kanban', 'projects']),
      navItem('Conversations',    MessageSquare, 'conversations',     'Inbox across SMS, email, calls'),
      navItem('Calendar',         Calendar,      'calendars',         'Appointments and team schedule'),
      navItem('Contacts',         Users,         'contacts',          'All people and accounts'),
      navItem('Jobs',             HardHat,       'jobs',              'Active contracted work'),
      navItem('Payments',         CreditCard,    'payments',          'Invoices, transactions'),
      navItem('Job Cam',          Camera,        'job-cam',           'Site photos and reports'),
      navItem('Measurements',     Ruler,         'measurements',      'EagleView orders and DIY measurements'),
      navItem('Proposals',        FileCheck,     'proposals',         'Drafts, sent, signed'),
      navItem('Instant Estimator', DollarSign,   'instant-estimator', 'Templated estimates'),
      navItem('Material Orders',  Package,       'material-orders',   'Supply ordering'),
      navItem('Work Orders',      Clipboard,     'work-orders',       'Production POs'),
      navItem('Automations',      Zap,           'automation',        'Workflow builder and rules'),
      navItem('Opportunities',    BarChart,      'opportunities',     'Sales pipeline view'),
      navItem('Marketing',        Megaphone,     'marketing',         'Campaigns and forms'),
      navItem('Storm Intelligence', CloudLightning, 'storm-canvassing', 'Map, turfs, doors'),
      navItem('File Manager',     FolderOpen,    'file-manager',      'Documents and uploads'),
      navItem('Reputation',       Star,          'reputation',        'Reviews and replies'),
      navItem('Reporting',        BarChart2,     'reporting',         'Dashboards and exports'),
      navItem('Settings',         Settings,      'settings',          'Org, users, integrations'),

      // Create
      {
        id: 'create:opportunity',
        group: 'Create',
        label: 'Create opportunity',
        description: 'New lead in the pipeline',
        icon: Plus,
        to: 'opportunities',
        keywords: ['lead', 'new'],
      },
      {
        id: 'create:proposal-ai',
        group: 'Create',
        label: 'Generate proposal with AI',
        description: 'Sierra drafts a proposal from a contact',
        icon: Sparkles,
        to: 'proposals/ai-generate',
        keywords: ['ai', 'proposal', 'sierra'],
      },
      {
        id: 'create:proposal',
        group: 'Create',
        label: 'New proposal',
        description: 'Build manually with the proposal editor',
        icon: FileText,
        to: 'proposals',
        keywords: ['proposal', 'quote'],
      },
      {
        id: 'create:measurement',
        group: 'Create',
        label: 'Order measurement',
        description: 'EagleView or DIY measurement order',
        icon: Ruler,
        to: 'measurements',
        keywords: ['eagleview', 'measurement', 'order'],
      },
      {
        id: 'create:job',
        group: 'Create',
        label: 'New job',
        description: 'Convert a proposal or opportunity to a job',
        icon: HardHat,
        to: 'jobs',
        keywords: ['job', 'project'],
      },

      // AI
      {
        id: 'ai:sierra',
        group: 'AI',
        label: 'Ask Sierra…',
        description: 'Open the assistant panel',
        icon: Sparkles,
        run: () => {
          sierra.setPanelOpen(true);
          onClose();
        },
        keywords: ['ai', 'assistant', 'sierra', 'help'],
      },
    ];
  }, [sierra, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => {
      if (it.label.toLowerCase().includes(q)) return true;
      if (it.description?.toLowerCase().includes(q)) return true;
      if (it.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<CommandItem['group'], CommandItem[]> = {
      Navigate: [],
      Create: [],
      Actions: [],
      AI: [],
    };
    for (const it of filtered) groups[it.group].push(it);
    return (Object.entries(groups) as [CommandItem['group'], CommandItem[]][])
      .filter(([, list]) => list.length > 0);
  }, [filtered]);

  function runItem(item: CommandItem) {
    if (item.run) {
      item.run();
      return;
    }
    if (item.to) {
      navigate(`/org/${orgSlug}/${item.to}`);
      onClose();
      setQuery('');
    }
  }

  return (
    <Transition show={open} as={Fragment} afterLeave={() => setQuery('')}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Scrim */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-base ease-studio-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-fast ease-studio-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-canvas/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <Transition.Child
            as={Fragment}
            enter="transition-all duration-base ease-studio-out"
            enterFrom="opacity-0 -translate-y-1 scale-[0.98]"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition-all duration-fast ease-studio-out"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-1 scale-[0.98]"
          >
            <Dialog.Panel className="mx-auto max-w-2xl rounded-studio-4 studio-glass border border-edge-soft dark:border-edge-d-soft shadow-s3 overflow-hidden">
              <Combobox<CommandItem | null>
                value={null}
                onChange={(item) => item && runItem(item)}
              >
                <div className="flex items-center gap-3 px-4 h-12 border-b border-edge-soft dark:border-edge-d-soft">
                  <Search className="w-4 h-4 text-ink-3 dark:text-ink-d-3 shrink-0" />
                  <Combobox.Input
                    autoFocus
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects, pages, actions…"
                    className="flex-1 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-ink-4 dark:placeholder:text-ink-d-4 studio-text-body"
                  />
                  <span className="hidden sm:inline-flex">
                    <KBDSequence keys={['Esc']} size="sm" />
                  </span>
                </div>

                <Combobox.Options static className="max-h-[60vh] overflow-y-auto scrollbar-studio py-2">
                  {grouped.length === 0 && (
                    <div className="px-4 py-12 text-center studio-text-muted">
                      No matches for &ldquo;{query}&rdquo;
                    </div>
                  )}
                  {grouped.map(([group, list]) => (
                    <PaletteGroup key={group} title={group}>
                      {list.map((item) => (
                        <Combobox.Option key={item.id} value={item} as={Fragment}>
                          {({ active }) => <PaletteRow item={item} active={active} />}
                        </Combobox.Option>
                      ))}
                    </PaletteGroup>
                  ))}
                </Combobox.Options>

                <div className="flex items-center justify-between gap-2 h-9 px-3 border-t border-edge-soft dark:border-edge-d-soft bg-surface-2/50 dark:bg-surface-d-2/40">
                  <div className="flex items-center gap-3 studio-text-caption text-ink-3 dark:text-ink-d-3">
                    <span className="inline-flex items-center gap-1">
                      <KBDSequence keys={['↑', '↓']} size="sm" /> Navigate
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <KBDSequence keys={['↵']} size="sm" /> Open
                    </span>
                  </div>
                  <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">
                    BuilderLync
                  </span>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function PaletteGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-2 py-1.5">
      <div className="px-2 pt-1 pb-1 studio-text-label text-ink-4 dark:text-ink-d-4">
        {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function PaletteRow({ item, active }: { item: CommandItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2 h-10 rounded-studio-2 cursor-pointer select-none',
        active && 'bg-surface-2 dark:bg-surface-d-2',
      )}
    >
      <span className="w-7 h-7 rounded-studio-1 inline-flex items-center justify-center bg-surface-2 dark:bg-surface-d-2 text-ink-2 dark:text-ink-d-2 shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="studio-text-body text-ink-1 dark:text-ink-d-1 truncate">{item.label}</div>
        {item.description && (
          <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
            {item.description}
          </div>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-ink-3 dark:text-ink-d-3 shrink-0" />
    </div>
  );
}
