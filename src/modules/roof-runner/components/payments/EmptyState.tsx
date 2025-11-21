import { Search, FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'file' | 'plus';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const Icon = icon === 'file' ? FileText : icon === 'plus' ? Plus : Search;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <Icon className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}
