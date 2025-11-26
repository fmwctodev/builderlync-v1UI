import OpportunityCard from './OpportunityCard';

interface Stage {
  id: string;
  title: string;
  opportunitiesCount: number;
  value: number;
  color: string;
}

interface Opportunity {
  id: string;
  stage: string;
  name: string;
  source?: string;
  business?: string;
  value: number;
  initials: string;
}

interface KanbanColumnProps {
  stage: Stage;
  opportunities: Opportunity[];
  onDragStart?: (e: React.DragEvent, opportunity: Opportunity) => void;
  onCardClick?: (opportunityId: string) => void;
}

export default function KanbanColumn({ stage, opportunities, onDragStart, onCardClick }: KanbanColumnProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{stage.title}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">({stage.opportunitiesCount})</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ${stage.value.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent min-h-[200px]">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onDragStart={onDragStart}
              onClick={onCardClick}
            />
          ))}
          {opportunities.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
              Drop cards here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}