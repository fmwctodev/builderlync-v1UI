import React from 'react';
import { Bell } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
        <p className="text-gray-400">You're all caught up!</p>
      </div>
    </div>
  );
};

export default Notifications;