import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  TrendingUp, 
  FolderKanban, 
  Eye, 
  Zap,
  ArrowRight 
} from 'lucide-react';

const modules = [
  {
    name: 'ABC Supply',
    description: 'Supply chain management and contractor portal',
    href: '/abc-supply',
    icon: Package,
    color: 'bg-blue-500',
  },
  {
    name: 'CRM',
    description: 'Customer relationship management system',
    href: '/crm',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    name: 'Marketing',
    description: 'Marketing automation and campaign management',
    href: '/marketing',
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    name: 'Project Management',
    description: 'Project tracking and task management',
    href: '/project-management',
    icon: FolderKanban,
    color: 'bg-orange-500',
  },
  {
    name: 'Edge View',
    description: 'Advanced analytics and reporting dashboard',
    href: '/edge-view',
    icon: Eye,
    color: 'bg-indigo-500',
  },
  {
    name: 'Roof Runner',
    description: 'Roofing project management and tracking',
    href: '/roof-runner',
    icon: Zap,
    color: 'bg-red-500',
  },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">BuilderLynk Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your unified construction management platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.name}
              to={module.href}
              className="group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${module.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {module.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {module.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}