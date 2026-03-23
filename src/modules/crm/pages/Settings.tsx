import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Profile Settings" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Personal Information</span>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </div>
        </Card>

        <Card title="Notifications" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Notification Preferences</span>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </Card>

        <Card title="Security" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Password & Security</span>
            </div>
            <Button variant="outline" size="sm">Manage Security</Button>
          </div>
        </Card>

        <Card title="Data Management" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Import/Export Data</span>
            </div>
            <Button variant="outline" size="sm">Manage Data</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}