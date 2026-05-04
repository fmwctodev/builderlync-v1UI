import { MapPin } from 'lucide-react';
import type { PipelineCard } from '../../../shared/lib/pipeline';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Chip } from '../../../shared/components/ui/Chip';
import { cn } from '../../../shared/components/ui/cn';

export interface ProjectCardProps {
  card: PipelineCard;
  onClick: () => void;
  /** Use a tighter compact layout (kanban). */
  compact?: boolean;
  isDragging?: boolean;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function ProjectCard({ card, onClick, compact = false, isDragging = false }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group block w-full text-left rounded-studio-3 bg-surface-1 dark:bg-surface-d-1',
        'border border-edge-soft dark:border-edge-d-soft',
        'shadow-s1 transition-all duration-fast ease-studio-out',
        'hover:shadow-s2 hover:-translate-y-px',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-canvas',
        compact ? 'p-3' : 'p-4',
        isDragging && 'shadow-s3 ring-1 ring-signal-500 -translate-y-0.5',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="studio-text-body-strong truncate">{card.title}</div>
          <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate mt-0.5">
            {card.contactName}
          </div>
        </div>
        {card.ownerName && (
          <Avatar name={card.ownerName} size={compact ? 'xs' : 'sm'} />
        )}
      </div>

      {card.address && (
        <div className="mt-2 flex items-center gap-1.5 studio-text-caption text-ink-3 dark:text-ink-d-3 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{card.address}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-mono text-num text-ink-1 dark:text-ink-d-1">
          {card.estimatedValue > 0 ? currency.format(card.estimatedValue) : '—'}
        </span>
        <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">
          {card.daysInStage}d
        </span>
      </div>

      {card.stageBadge && (
        <div className="mt-2">
          <Chip tone="neutral">{card.stageBadge}</Chip>
        </div>
      )}
    </button>
  );
}
