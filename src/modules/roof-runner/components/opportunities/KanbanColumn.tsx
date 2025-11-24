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
    <div className={`flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border-t-4 ${stage.color} h-full`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{stage.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {stage.opportunitiesCount} opportunities • ${stage.value.toFixed(2)}
        </p>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onDragStart={onDragStart}
            onClick={onCardClick}
          />
        ))}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Drop opportunities here</p>
          </div>
        )}
      </div>
    </div>
  );
}