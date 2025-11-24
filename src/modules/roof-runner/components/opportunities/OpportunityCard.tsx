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
      className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 relative hover:shadow-md transition-shadow cursor-pointer"
      draggable
      onDragStart={(e) => onDragStart?.(e, opportunity)}
      onClick={handleClick}
    >
      {/* Avatar/Initials */}
      <div className="absolute top-3 right-3">
        {opportunity.initials ? (
          <span className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-sm font-semibold text-red-800 dark:text-red-200">
            {opportunity.initials}
          </span>
        ) : (
          <UserCircle className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        )}
      </div>

      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 pr-10">
        {opportunity.name}
      </h5>
      {opportunity.business && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{opportunity.business}</p>
      )}
      {opportunity.source && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span className="font-medium">Opportunity Source:</span> {opportunity.source}
        </p>
      )}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">Opportunity Value:</span> ${opportunity.value.toFixed(2)}
      </p>

      {/* Action Icons */}
      <div className="flex space-x-2 text-gray-400 dark:text-gray-500 mt-3">
        <button className="p-1 hover:text-[#dc2626] dark:hover:text-red-400">
          <Phone className="h-4 w-4" />
        </button>
        <button className="p-1 hover:text-[#dc2626] dark:hover:text-red-400">
          <Mail className="h-4 w-4" />
        </button>
        <button className="p-1 hover:text-[#dc2626] dark:hover:text-red-400">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="p-1 hover:text-[#dc2626] dark:hover:text-red-400">
          <ClipboardCheck className="h-4 w-4" />
        </button>
        <button className="p-1 hover:text-[#dc2626] dark:hover:text-red-400">
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}