export type NavItem = {
  title: string;
  href: string;
  icon: string;
};

export type ModuleState = 'loading' | 'empty' | 'error' | 'data';

export type UserProfile = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
};