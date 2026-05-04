import { Activity } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';

export function ProjectActivityTab({ card: _card }: { card: PipelineCard }) {
  return (
    <EmptyState
      icon={<Activity />}
      title="Activity feed"
      description="Stage transitions, notes, and outbound messages will appear here. Activity is sourced from the existing audit endpoints — no new logging."
    />
  );
}
