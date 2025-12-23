import { UserCircle, Phone, Mail, Calendar, MessageSquare, ClipboardCheck, DollarSign } from 'lucide-react';

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

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart?.(e, opportunity);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div
      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">
          {opportunity.name}
        </h4>
        {opportunity.initials && (
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {opportunity.initials}
          </div>
        )}
      </div>
      
      {opportunity.business && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate">
          {opportunity.business}
        </p>
      )}
      
      {opportunity.source && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {opportunity.source}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-green-600 dark:text-green-400">
          <DollarSign className="h-3 w-3 mr-1" />
          <span className="text-sm font-semibold">
            {opportunity.value.toLocaleString()}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              <Phone className="h-3 w-3 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              <Mail className="h-3 w-3 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              <MessageSquare className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}