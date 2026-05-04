import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import type { PipelineCard, PipelineStage } from '../../../shared/lib/pipeline';
import { STAGE_LABELS, STAGE_ORDER, STAGE_CHIP_CLASS } from '../../../shared/tokens';
import { ProjectCard } from './ProjectCard';
import { useToast } from '../../../shared/components/ui/Toast';
import { cn } from '../../../shared/components/ui/cn';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export interface PipelineKanbanProps {
  cards: PipelineCard[];
  visibleStages: PipelineStage[];
  onOpenCard: (cardKey: string) => void;
}

export function PipelineKanban({ cards, visibleStages, onOpenCard }: PipelineKanbanProps) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState<Record<PipelineStage, boolean>>({
    lead: false,
    booked_estimate: false,
    measurement: false,
    proposal: false,
    job: false,
    production: false,
    invoice: true,
    closed: true,
  });

  const cardsByStage = useMemo(() => {
    const map: Record<PipelineStage, PipelineCard[]> = {
      lead: [],
      booked_estimate: [],
      measurement: [],
      proposal: [],
      job: [],
      production: [],
      invoice: [],
      closed: [],
    };
    for (const c of cards) {
      if (visibleStages.includes(c.currentStage)) {
        map[c.currentStage].push(c);
      }
    }
    return map;
  }, [cards, visibleStages]);

  const totalsByStage = useMemo(() => {
    const map: Record<PipelineStage, number> = {
      lead: 0, booked_estimate: 0, measurement: 0, proposal: 0,
      job: 0, production: 0, invoice: 0, closed: 0,
    };
    for (const c of cards) {
      if (visibleStages.includes(c.currentStage)) {
        map[c.currentStage] += c.estimatedValue;
      }
    }
    return map;
  }, [cards, visibleStages]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const fromStage = result.source.droppableId as PipelineStage;
    const toStage = result.destination.droppableId as PipelineStage;
    if (fromStage === toStage) return;

    // Per the plan: surface intent, don't silently mutate. The actual
    // stage advance dispatches existing slice actions — those happen in the
    // confirmation flow, which we open here. For now, we toast the intent
    // so the user gets visible feedback before the existing-action wiring
    // is built per drawer tab.
    const cardKey = result.draggableId;
    const card = cards.find((c) => c.cardKey === cardKey);

    toast.push({
      tone: 'info',
      title: `Move to ${STAGE_LABELS[toStage]}`,
      description: card
        ? `Open ${card.title} in the project drawer to confirm.`
        : 'Open the project drawer to confirm the change.',
      action: card ? { label: 'Open project', onClick: () => onOpenCard(card.cardKey) } : undefined,
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto scrollbar-studio pb-4 -mx-studio-page px-studio-page">
        {STAGE_ORDER.filter((s) => visibleStages.includes(s)).map((stage) => {
          const list = cardsByStage[stage];
          const total = totalsByStage[stage];
          const isCollapsed = collapsed[stage];

          return (
            <div
              key={stage}
              className={cn(
                'shrink-0 flex flex-col rounded-studio-3 bg-surface-2/60 dark:bg-surface-d-2/60 border border-edge-soft dark:border-edge-d-soft',
                isCollapsed ? 'w-14' : 'w-[280px]',
                'transition-[width] duration-base ease-studio-out',
              )}
            >
              {/* Column header */}
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [stage]: !c[stage] }))
                }
                className={cn(
                  'px-3 pt-3 pb-2 flex items-center text-left transition-colors duration-fast hover:bg-surface-3 dark:hover:bg-surface-d-3 rounded-t-studio-3',
                  isCollapsed && 'flex-col gap-2 h-full justify-center pb-3',
                )}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? (
                  <>
                    <span
                      className={cn('inline-block w-2 h-2 rounded-full', STAGE_DOT_BG[stage])}
                    />
                    <span
                      className="studio-text-label vertical-text"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      {STAGE_LABELS[stage]} · {list.length}
                    </span>
                  </>
                ) : (
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 h-6 rounded-studio-1 border text-caption font-medium',
                        STAGE_CHIP_CLASS[stage],
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="studio-num text-ink-3 dark:text-ink-d-3">{list.length}</span>
                    <span className="ml-auto studio-num text-ink-3 dark:text-ink-d-3">
                      {total > 0 ? currency.format(total) : ''}
                    </span>
                  </div>
                )}
              </button>

              {!isCollapsed && (
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 min-h-[120px] px-2 pb-2 flex flex-col gap-2',
                        snapshot.isDraggingOver && 'bg-signal-50/40 dark:bg-signal-500/5 rounded-b-studio-3',
                      )}
                    >
                      {list.length === 0 && (
                        <div className="studio-text-caption text-ink-4 dark:text-ink-d-4 text-center py-6">
                          No projects
                        </div>
                      )}
                      {list.map((card, index) => (
                        <Draggable key={card.cardKey} draggableId={card.cardKey} index={index}>
                          {(p, s) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                            >
                              <ProjectCard
                                card={card}
                                compact
                                isDragging={s.isDragging}
                                onClick={() => onOpenCard(card.cardKey)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      <button
                        type="button"
                        className="mt-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-studio-2 text-caption text-ink-3 dark:text-ink-d-3 hover:bg-surface-3 dark:hover:bg-surface-d-3 transition-colors duration-fast border border-dashed border-edge-base dark:border-edge-d-base"
                      >
                        <Plus className="w-3 h-3" />
                        Add to {STAGE_LABELS[stage].toLowerCase()}
                      </button>
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

/**
 * Static class lookup so Tailwind JIT can see every literal it needs to emit.
 * Do NOT replace with `bg-stage-${...}` interpolation — JIT will purge them.
 */
const STAGE_DOT_BG: Record<PipelineStage, string> = {
  lead:            'bg-stage-lead',
  booked_estimate: 'bg-stage-booked',
  measurement:     'bg-stage-measurement',
  proposal:        'bg-stage-proposal',
  job:             'bg-stage-job',
  production:      'bg-stage-production',
  invoice:         'bg-stage-invoice',
  closed:          'bg-stage-closed',
};
