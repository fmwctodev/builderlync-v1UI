import React from 'react';
import { ActivityItem } from '../../types';
import { MessageSquare, Calendar, Award, Mail } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    const props = { size: 16, className: 'text-white' };
    switch (type) {
      case 'contact': return <Mail {...props} />;
      case 'meeting': return <Calendar {...props} />;
      case 'deal': return <Award {...props} />;
      case 'message': return <MessageSquare {...props} />;
      default: return <Mail {...props} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'contact': return 'bg-primary-500';
      case 'meeting': return 'bg-green-500';
      case 'deal': return 'bg-primary-500';
      case 'message': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getIconBg(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};