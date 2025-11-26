import { UserCircle, Phone, Mail, Calendar, MessageSquare, ClipboardCheck } from 'lucide-react';

interface Opportunity {
  id: string;
  stage: string;
  name: string;
  source?: string;
  business?: string;
  value: number;
  initials: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onDragStart?: (e: React.DragEvent, opportunity: Opportunity) => void;
  onClick?: (opportunityId: string) => void;
}

export default function OpportunityCard({ opportunity, onDragStart, onClick }: OpportunityCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(opportunity.id);
  };

  return (
    <div
      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
      draggable
      onDragStart={(e) => onDragStart?.(e, opportunity)}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{opportunity.name}</h4>
        {opportunity.initials && (
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
            {opportunity.initials}
          </div>
        )}
      </div>
      {opportunity.business && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{opportunity.business}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          ${opportunity.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}