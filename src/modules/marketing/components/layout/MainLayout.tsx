import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { User, Notification } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Mock data
  const user: User = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: ''
  };
  
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Lead',
      message: 'You have a new lead from website contact form',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      title: 'Campaign Complete',
      message: 'Spring promotion campaign has finished',
      time: '1 hour ago',
      read: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <TopBar user={user} notifications={notifications} />
      <main className="pl-64 pt-16">
        <div className="container px-6 py-6 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};