import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Activity,
  Flag,
  Plug,
  Shield,
  MessageSquare,
  LayoutTemplate,
  Server,
  Wrench,
  Settings,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Overview', to: '/super-admin', icon: LayoutDashboard, end: true },
  { name: 'Accounts', to: '/super-admin/accounts', icon: Building2 },
  { name: 'Users & Roles', to: '/super-admin/users', icon: Users },
  { name: 'Billing & Plans', to: '/super-admin/billing', icon: CreditCard },
  { name: 'Usage & Limits', to: '/super-admin/usage', icon: Activity },
  { name: 'Features & Flags', to: '/super-admin/features', icon: Flag },
  { name: 'Integrations & API', to: '/super-admin/integrations', icon: Plug },
  { name: 'Security & Audit', to: '/super-admin/security', icon: Shield },
  { name: 'Support & Feedback', to: '/super-admin/support', icon: MessageSquare },
  { name: 'Templates', to: '/super-admin/templates', icon: LayoutTemplate },
  { name: 'System Health', to: '/super-admin/system', icon: Server },
  { name: 'Maintenance', to: '/super-admin/maintenance', icon: Wrench },
];

export const SuperAdminSidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <img src="/logo/icon.png" alt="BuilderLync" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-white font-bold text-lg">BuilderLync</h1>
          <p className="text-slate-400 text-xs">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3 space-y-1">
        <NavLink
          to="/super-admin/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-red-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
        <NavLink
          to="/super-admin/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </NavLink>
      </div>
    </div>
  );
};
