import React from 'react';

interface Props {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const EmptyStateActionCard: React.FC<Props> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">{description}</p>
    <button
      onClick={onAction}
      className="px-5 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
    >
      {actionLabel}
    </button>
  </div>
);

export default EmptyStateActionCard;
