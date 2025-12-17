import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  HardHat,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { NavItem } from '../../types';
import Logo from '../../../../shared/components/Logo';

interface SidebarProps {
  className?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/crm',
    icon: 'LayoutDashboard'
  },
  {
    title: 'Contacts',
    href: '/crm/contacts',
    icon: 'Users'
  },
  {
    title: 'Calendar',
    href: '/crm/calendar',
    icon: 'Calendar'
  },
  {
    title: 'Conversations',
    href: '/crm/conversations',
    icon: 'MessageSquare'
  },
  {
    title: 'Jobs',
    href: '/crm/jobs',
    icon: 'HardHat'
  },
  {
    title: 'Snippets',
    href: '/crm/snippets',
    icon: 'FileText'
  },
  {
    title: 'Settings',
    href: '/crm/settings',
    icon: 'Settings'
  }
];

const iconComponents: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  HardHat,
  FileText,
  Settings
};

export function Sidebar({ className = '' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`
        ${collapsed ? 'w-20' : 'w-64'}
bg-dark dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <div className={`h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center">
          {collapsed ? (
            <Logo type="icon" size="md" />
          ) : (
            <>
              <Logo type="light" className="h-20 w-auto dark:hidden" />
              <div className="hidden dark:block bg-white rounded-lg p-2">
                <Logo type="dark" className="h-16 w-auto" />
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleCollapsed}
          className="mx-2 rounded-full w-6 h-6 bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = iconComponents[item.icon];
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
                    ${collapsed ? 'justify-center' : ''}
                    transition-colors duration-150
                  `}
                >
                  <div>
                  <Icon size={20} className={collapsed ? '' : 'mr-3'} />
                  </div>
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className={`
          text-xs text-gray-500 dark:text-gray-400
          ${collapsed ? 'text-center' : ''}
        `}>
          {!collapsed && <span>© 2025 Contractor CRM</span>}
          {collapsed && <span>© 2025</span>}
        </div>
      </div>
    </div>
  );
}