import React, { useState, useEffect } from 'react';
import { Clock, User, FileText } from 'lucide-react';
import { getContactActivities, Activity } from '../../../../shared/store/services/activitiesApi';

interface ActivityTabProps {
  contactId: number;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ contactId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    console.log('Fetching activities for contactId:', contactId);
    setLoading(true);
    try {
      const response = await getContactActivities(contactId);
      console.log('Activities response:', response);
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };



  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_visit': return <FileText size={16} />;
      case 'call': return <Clock size={16} />;
      default: return <User size={16} />;
    }
  };

  useEffect(() => {
    console.log('ActivityTab useEffect triggered with contactId:', contactId);
    if (contactId) {
      fetchActivities();
    }
  }, [contactId]);

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Activity ({activities.length})
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Type: {activity.activityType}</span>
                    <span>By: {activity.createdByName}</span>
                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No activities yet!
          </h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Activities are automatically tracked and will appear here.
          </p>
        </div>
      )}
    </>
  );
};

export default ActivityTab;