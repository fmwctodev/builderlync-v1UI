import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  Wrench,
  Bot,
  Camera,
  Calculator,
  Ruler,
  FileText,
  Package,
  ClipboardList,
  TrendingUp,
  Zap,
  Award,
  Megaphone,
  FolderOpen,
  Star,
  BarChart,
  Globe,
  HelpCircle,
  Settings
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Conversations', href: '/conversations', icon: 'MessageSquare' },
    { name: 'Calendars', href: '/calendars', icon: 'Calendar' },
    { name: 'Contacts', href: '/contacts', icon: 'Users' },
    { name: 'Jobs', href: '/jobs', icon: 'Briefcase' },
    { name: 'Payments', href: '/payments', icon: 'CreditCard' },
    { name: 'AI Agents', href: '/ai-agents', icon: 'Bot' },
    { name: 'Job Cam', href: '/job-cam', icon: 'Camera' },
    { name: 'Instant Estimator', href: '/instant-estimator', icon: 'Calculator' },
    { name: 'Measurements', href: '/measurements', icon: 'Ruler' },
    { name: 'Proposals', href: '/proposals', icon: 'FileText' },
    { name: 'Material Orders', href: '/material-orders', icon: 'Package' },
    { name: 'Work Orders', href: '/work-orders', icon: 'ClipboardList' },
    { name: 'Automation', href: '/automation', icon: 'Zap' },
    { name: 'Opportunities', href: '/opportunities', icon: 'Award' },
    { name: 'Marketing', href: '/marketing', icon: 'Megaphone' },
    { name: 'File Manager', href: '/file-manager', icon: 'FolderOpen' },
    { name: 'Reputation', href: '/reputation', icon: 'Star' },
    { name: 'Reporting', href: '/reporting', icon: 'BarChart' },
    { name: 'Sites', href: '/sites', icon: 'Globe' },
    { name: 'Support', href: '/support', icon: 'HelpCircle' },
    { name: 'Settings', href: '/settings', icon: 'Settings' }
  ];

  const getIcon = (iconName: string, active: boolean = false) => {
    const props = { 
      size: 16, 
      className: active 
        ? 'text-blue-500 dark:text-blue-400' 
        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
    };

    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      case 'Bot': return <Bot {...props} />;
      case 'Camera': return <Camera {...props} />;
      case 'Calculator': return <Calculator {...props} />;
      case 'Ruler': return <Ruler {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Package': return <Package {...props} />;
      case 'ClipboardList': return <ClipboardList {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Megaphone': return <Megaphone {...props} />;
      case 'FolderOpen': return <FolderOpen {...props} />;
      case 'Star': return <Star {...props} />;
      case 'BarChart': return <BarChart {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'HelpCircle': return <HelpCircle {...props} />;
      case 'Settings': return <Settings {...props} />;
      default: return <LayoutDashboard {...props} />;
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200">
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            BuilderLynk
          </span>
        </div>
      </div>
      <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Manage
        </div>
        {navItems.slice(0, 6).map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-1.5 rounded-md group transition-colors text-sm ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="ml-2 font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4">
          Tools
        </div>
        {navItems.slice(6, 13).map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-1.5 rounded-md group transition-colors text-sm ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="ml-2 font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4">
          Marketing
        </div>
        {navItems.slice(13, 20).map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-1.5 rounded-md group transition-colors text-sm ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="ml-2 font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        {navItems.slice(20).map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-1.5 rounded-md group transition-colors text-sm ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="ml-2 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};