import { 
  Home, 
  Package, 
  Users, 
  TrendingUp, 
  FolderKanban, 
  Eye, 
  Zap,
  Bot,
  LucideIcon
} from 'lucide-react';
import { RolePermissions } from '../store/services/rolesApi';

export interface RouteConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  requiredPermission?: {
    module: keyof RolePermissions;
    action?: string;
  };
}

export const routes: RouteConfig[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home 
  },
  { 
    name: 'ABC Supply', 
    href: '/abc-supply', 
    icon: Package,
    requiredPermission: {
      module: 'integrations'
    }
  },
  { 
    name: 'CRM', 
    href: '/crm', 
    icon: Users,
    requiredPermission: {
      module: 'contacts'
    }
  },
  { 
    name: 'Marketing', 
    href: '/marketing', 
    icon: TrendingUp,
    requiredPermission: {
      module: 'marketing'
    }
  },
  { 
    name: 'Project Management', 
    href: '/project-management', 
    icon: FolderKanban,
    requiredPermission: {
      module: 'jobs'
    }
  },
  { 
    name: 'Edge View', 
    href: '/edge-view', 
    icon: Eye,
    requiredPermission: {
      module: 'reporting'
    }
  },
  { 
    name: 'Roof Runner', 
    href: '/roof-runner', 
    icon: Zap,
    requiredPermission: {
      module: 'jobs'
    }
  },
  { 
    name: 'AI Agents', 
    href: '/ai-agents', 
    icon: Bot,
    requiredPermission: {
      module: 'automation'
    }
  },
];
