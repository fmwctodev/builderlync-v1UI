import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PipelineCard } from '../../../shared/lib/pipeline';
import { Drawer } from '../../../shared/components/ui/Drawer';
import { Tabs } from '../../../shared/components/ui/Tabs';
import { StageChip } from '../../../shared/components/ui/StageChip';
import { Button } from '../../../shared/components/ui/Button';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectEstimateTab } from './tabs/ProjectEstimateTab';
import { ProjectMeasurementTab } from './tabs/ProjectMeasurementTab';
import { ProjectProposalTab } from './tabs/ProjectProposalTab';
import { ProjectJobTab } from './tabs/ProjectJobTab';
import { ProjectInvoiceTab } from './tabs/ProjectInvoiceTab';
import { ProjectProductionTab } from './tabs/ProjectProductionTab';
import { ProjectActivityTab } from './tabs/ProjectActivityTab';

export type ProjectTabId =
  | 'overview' | 'estimate' | 'measurement' | 'proposal'
  | 'job' | 'invoice' | 'production' | 'activity';

const TAB_ITEMS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'estimate',    label: 'Estimate' },
  { id: 'measurement', label: 'Measurement' },
  { id: 'proposal',    label: 'Proposal' },
  { id: 'job',         label: 'Job' },
  { id: 'invoice',     label: 'Invoice' },
  { id: 'production',  label: 'Production' },
  { id: 'activity',    label: 'Activity' },
] satisfies { id: ProjectTabId; label: string }[];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  /** The card whose origin records this drawer presents. */
  card: PipelineCard | null;
  /** Force-open a specific tab by default. */
  defaultTab?: ProjectTabId;
}

export function ProjectDrawer({ open, onClose, card, defaultTab = 'overview' }: ProjectDrawerProps) {
  const [tab, setTab] = useState<ProjectTabId>(defaultTab);
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';

  const tabItems = useMemo(
    () =>
      TAB_ITEMS.map((t) => ({
        ...t,
        disabled: card ? !tabAvailable(t.id, card) : true,
      })),
    [card],
  );

  if (!card) {
    return null;
  }

  const handleExpand = () => {
    onClose();
    navigate(`/org/${orgSlug}/projects/${encodeURIComponent(card.cardKey)}`);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      onExpand={handleExpand}
      header={<DrawerHeader card={card} />}
    >
      <div className="px-6 pt-3">
        <Tabs<ProjectTabId> items={tabItems} value={tab} onChange={setTab} />
      </div>

      <div className="px-6 py-5">
        {tab === 'overview' && <ProjectOverviewTab card={card} onSwitchTab={setTab} />}
        {tab === 'estimate' && <ProjectEstimateTab card={card} />}
        {tab === 'measurement' && <ProjectMeasurementTab card={card} />}
        {tab === 'proposal' && <ProjectProposalTab card={card} />}
        {tab === 'job' && <ProjectJobTab card={card} />}
        {tab === 'invoice' && <ProjectInvoiceTab card={card} />}
        {tab === 'production' && <ProjectProductionTab card={card} />}
        {tab === 'activity' && <ProjectActivityTab card={card} />}
      </div>
    </Drawer>
  );
}

function DrawerHeader({ card }: { card: PipelineCard }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="studio-text-caption text-ink-3 dark:text-ink-d-3 font-mono">
            {card.cardKey}
          </span>
          <StageChip stage={card.currentStage} />
        </div>
        <div className="studio-text-title-1 truncate">{card.title}</div>
        <div className="studio-text-muted truncate mt-0.5">{card.contactName}</div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="studio-num-display">
          {card.estimatedValue > 0 ? currency.format(card.estimatedValue) : '—'}
        </span>
        {card.ownerName && (
          <div className="flex items-center gap-1.5">
            <Avatar name={card.ownerName} size="xs" />
            <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">
              {card.ownerName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function tabAvailable(tab: ProjectTabId, card: PipelineCard): boolean {
  switch (tab) {
    case 'overview':    return true;
    case 'estimate':    return true; // user can always create one
    case 'measurement': return true;
    case 'proposal':    return Boolean(card.origin.proposalId) || card.currentStage !== 'lead';
    case 'job':         return Boolean(card.origin.jobId);
    case 'invoice':     return Boolean(card.origin.invoiceId) || ['production', 'invoice', 'closed'].includes(card.currentStage);
    case 'production':  return Boolean(card.origin.jobId);
    case 'activity':    return true;
  }
}

/** Reusable open-in-legacy CTA used inside each tab. */
export function OpenLegacyButton({
  to, label = 'Open in legacy view', onNavigate,
}: { to: string; label?: string; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';

  return (
    <Button
      variant="secondary"
      trailingIcon={<ArrowRight />}
      onClick={() => {
        onNavigate?.();
        navigate(`/org/${orgSlug}/${to}`);
      }}
    >
      {label}
    </Button>
  );
}
