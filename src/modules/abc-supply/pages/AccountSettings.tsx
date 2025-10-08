import React from 'react';
import { User } from 'lucide-react';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Account Settings</h3>
        <p className="text-gray-400">Manage your account preferences and information</p>
      </div>
    </div>
  );
};

export default AccountSettings;