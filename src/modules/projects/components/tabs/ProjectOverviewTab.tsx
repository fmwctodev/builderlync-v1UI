import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Phone, User, Sparkles, Ruler, FileCheck, HardHat, ArrowRight } from 'lucide-react';
import type { PipelineCard, PipelineStage } from '../../../../shared/lib/pipeline';
import { STAGE_LABELS, STAGE_ORDER } from '../../../../shared/tokens';
import { Card, CardHeader, CardBody } from '../../../../shared/components/ui/Card';
import { Button } from '../../../../shared/components/ui/Button';
import { Chip } from '../../../../shared/components/ui/Chip';
import { cn } from '../../../../shared/components/ui/cn';
import type { ProjectTabId } from '../ProjectDrawer';

interface OverviewProps {
  card: PipelineCard;
  onSwitchTab: (tab: ProjectTabId) => void;
}

export function ProjectOverviewTab({ card, onSwitchTab }: OverviewProps) {
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';

  const nextActions = nextActionsForStage(card.currentStage);

  return (
    <div className="space-y-5">
      {/* Next action callout */}
      {nextActions.length > 0 && (
        <Card>
          <div className="studio-text-label mb-3">Next action</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nextActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.tab) {
                    onSwitchTab(action.tab);
                  } else if (action.to) {
                    navigate(`/org/${orgSlug}/${action.to}`);
                  }
                }}
                className="flex items-center justify-between gap-3 p-3 rounded-studio-2 bg-surface-2 dark:bg-surface-d-2 hover:bg-surface-3 dark:hover:bg-surface-d-3 transition-colors duration-fast text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-studio-1 bg-signal-100 text-signal-ink dark:bg-signal-500/15 dark:text-signal-100 inline-flex items-center justify-center shrink-0">
                    <action.icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="studio-text-body-strong truncate">{action.label}</div>
                    {action.description && (
                      <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-3 dark:text-ink-d-3 shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Contact + property */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Contact" />
          <CardBody>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-ink-3 dark:text-ink-d-3" />
                <span className="studio-text-body">{card.contactName}</span>
              </div>
              {card.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ink-3 dark:text-ink-d-3" />
                  <span className="studio-text-body">{card.address}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<Phone />}
                onClick={() => {
                  if (card.contactId) {
                    navigate(`/org/${orgSlug}/contacts/${card.contactId}`);
                  }
                }}
                disabled={!card.contactId}
              >
                Open contact profile
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Project" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-y-2 studio-text-body">
              <dt className="studio-text-label text-ink-3 dark:text-ink-d-3">Source</dt>
              <dd>{card.source ?? '—'}</dd>
              <dt className="studio-text-label text-ink-3 dark:text-ink-d-3">Type</dt>
              <dd>{card.jobType ?? '—'}</dd>
              <dt className="studio-text-label text-ink-3 dark:text-ink-d-3">Days in stage</dt>
              <dd className="font-mono tabular-nums">{card.daysInStage}</dd>
            </dl>
            {card.tags && card.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {card.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Stage timeline */}
      <Card>
        <CardHeader title="Stage" description={`Currently in ${STAGE_LABELS[card.currentStage]}`} />
        <StageTimeline current={card.currentStage} />
      </Card>
    </div>
  );
}

function StageTimeline({ current }: { current: PipelineStage }) {
  const idx = STAGE_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-studio">
      {STAGE_ORDER.map((stage, i) => {
        const done = i < idx;
        const isCurrent = i === idx;
        return (
          <div key={stage} className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 h-7 rounded-studio-1 border text-caption font-medium',
                done && 'bg-surface-2 dark:bg-surface-d-2 border-edge-soft dark:border-edge-d-soft text-ink-3 dark:text-ink-d-3',
                isCurrent && 'bg-signal-500 border-signal-500 text-white',
                !done && !isCurrent && 'border-edge-soft dark:border-edge-d-soft text-ink-4 dark:text-ink-d-4',
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isCurrent ? 'bg-white' : 'bg-current',
                )}
              />
              {STAGE_LABELS[stage]}
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <span className="w-3 h-px bg-edge-soft dark:bg-edge-d-soft" />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface NextAction {
  label: string;
  description?: string;
  icon: typeof Calendar;
  tab?: ProjectTabId;
  to?: string;
}

function nextActionsForStage(stage: PipelineStage): NextAction[] {
  switch (stage) {
    case 'lead':
      return [
        { label: 'Schedule estimate', description: 'Book a site visit on the calendar', icon: Calendar, to: 'calendars' },
        { label: 'Order measurement', description: 'EagleView or DIY', icon: Ruler, tab: 'measurement' },
      ];
    case 'booked_estimate':
      return [
        { label: 'Order measurement', description: 'Run EagleView for the property', icon: Ruler, tab: 'measurement' },
        { label: 'Generate proposal with AI', description: 'Sierra drafts from measurements', icon: Sparkles, to: 'proposals/ai-generate' },
      ];
    case 'measurement':
      return [
        { label: 'Generate proposal with AI', description: 'Sierra drafts from measurements', icon: Sparkles, to: 'proposals/ai-generate' },
        { label: 'New blank proposal', description: 'Build manually', icon: FileCheck, to: 'proposals' },
      ];
    case 'proposal':
      return [
        { label: 'Convert to job', description: 'Create a Job once signed', icon: HardHat, tab: 'job' },
      ];
    case 'job':
      return [
        { label: 'Schedule production', description: 'Assign crew and start date', icon: Calendar, tab: 'production' },
      ];
    case 'production':
      return [
        { label: 'Send invoice', description: 'Bill against the contracted value', icon: FileCheck, tab: 'invoice' },
      ];
    case 'invoice':
    case 'closed':
      return [];
  }
}
