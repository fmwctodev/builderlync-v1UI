import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  TrendingUp, 
  FolderKanban, 
  Eye, 
  Zap 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'ABC Supply', href: '/abc-supply', icon: Package },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'Marketing', href: '/marketing', icon: TrendingUp },
  { name: 'Project Management', href: '/project-management', icon: FolderKanban },
  { name: 'Edge View', href: '/edge-view', icon: Eye },
  { name: 'Roof Runner', href: '/roof-runner', icon: Zap },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">BuilderLynk</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}