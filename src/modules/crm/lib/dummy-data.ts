import { UserProfile, Notification } from '../types';

export const currentUser: UserProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '',
  role: 'Admin'
};

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'New Contact Added',
    message: 'Sarah Johnson was added to your contacts',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Meeting Reminder',
    message: 'You have a meeting with Acme Corp in 30 minutes',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'warning'
  }
];

export const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];