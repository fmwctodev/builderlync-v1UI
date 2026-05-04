import type { PipelineCard, PipelineStage } from '../../../shared/lib/pipeline';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../shared/components/ui/Table';
import { StageChip } from '../../../shared/components/ui/StageChip';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { LayoutGrid } from 'lucide-react';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export interface PipelineListProps {
  cards: PipelineCard[];
  visibleStages: PipelineStage[];
  onOpenCard: (cardKey: string) => void;
}

export function PipelineList({ cards, visibleStages, onOpenCard }: PipelineListProps) {
  const filtered = cards.filter((c) => visibleStages.includes(c.currentStage));

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid />}
        title="No projects in view"
        description="Try adjusting your filters or stage selection."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead numeric>Value</TableHead>
          <TableHead numeric>Days</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((card) => (
          <TableRow key={card.cardKey} interactive onClick={() => onOpenCard(card.cardKey)}>
            <TableCell>
              <div className="studio-text-body-strong truncate">{card.title}</div>
              {card.stageBadge && (
                <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 mt-0.5">
                  {card.stageBadge}
                </div>
              )}
            </TableCell>
            <TableCell><StageChip stage={card.currentStage} /></TableCell>
            <TableCell muted>{card.contactName}</TableCell>
            <TableCell muted>{card.address || '—'}</TableCell>
            <TableCell>
              {card.ownerName ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={card.ownerName} size="xs" />
                  <span className="studio-text-body truncate">{card.ownerName}</span>
                </div>
              ) : (
                <span className="text-ink-4 dark:text-ink-d-4">—</span>
              )}
            </TableCell>
            <TableCell numeric>{card.estimatedValue > 0 ? currency.format(card.estimatedValue) : '—'}</TableCell>
            <TableCell numeric>{card.daysInStage}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
