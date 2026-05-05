import { Shield } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-roles',
    name: 'Roles & Permissions',
    description: 'Define who can view, edit, or manage each module.',
    icon: Shield,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 4,
  },
  articles: [
    walkthrough({
      slug: 'roles-overview',
      title: 'Roles overview',
      summary: 'Owner, Admin, Manager, Estimator, Crew — what each can do.',
      categorySlug: 'settings-roles',
      tags: ['roles', 'permissions', 'overview'],
      readMinutes: 4,
      intro: 'Roles are bundles of permissions. Each user has one role; permissions can be overridden per-user.',
      videoDesc: 'Roles tour (90 sec)',
      steps: [
        { title: 'Settings → Roles', text: '', screenshot: 'roles section' },
        { title: 'Built-in roles', text: 'Owner, Admin, Manager, Estimator, Crew.', screenshot: 'built-in roles' },
        { title: 'Permission matrix', text: 'See per-module access.', screenshot: 'matrix' },
      ],
    }),
    walkthrough({
      slug: 'create-a-custom-role',
      title: 'Create a custom role',
      summary: 'Build a role tailored to your team structure.',
      categorySlug: 'settings-roles',
      tags: ['roles', 'custom'],
      readMinutes: 4,
      intro: 'Custom roles fit teams that don\'t map to the built-in five.',
      videoDesc: 'Custom role (90 sec)',
      steps: [
        { title: 'Roles → +New', text: '', screenshot: 'new role button' },
        { title: 'Name + description', text: '', screenshot: 'role form' },
        { title: 'Pick permissions', text: 'View, edit, manage per module.', screenshot: 'permission picker' },
        { title: 'Save', text: 'Available when assigning users.', screenshot: 'saved' },
      ],
    }),
    walkthrough({
      slug: 'permission-modules',
      title: 'Permission modules',
      summary: 'Which permissions exist per module.',
      categorySlug: 'settings-roles',
      tags: ['roles', 'permissions', 'modules'],
      readMinutes: 4,
      intro: 'Each module exposes view / edit / manage permissions; some have additional fine-grained options.',
      videoDesc: 'Permission modules (90 sec)',
      steps: [
        { title: 'Open a role', text: '', screenshot: 'role detail' },
        { title: 'Per-module toggles', text: 'Jobs, Contacts, Proposals, etc.', screenshot: 'module toggles' },
        { title: 'Special permissions', text: 'e.g. Export contacts (Owner only by default).', screenshot: 'special permissions' },
      ],
    }),
    walkthrough({
      slug: 'override-per-user',
      title: 'Override permissions for a single user',
      summary: 'Grant or revoke a specific permission outside their role.',
      categorySlug: 'settings-roles',
      tags: ['roles', 'override', 'user'],
      readMinutes: 3,
      intro: 'Per-user overrides let you handle exceptions without creating new roles.',
      videoDesc: 'Per-user override (60 sec)',
      steps: [
        { title: 'Staff → click user', text: '', screenshot: 'user detail' },
        { title: 'Permissions tab', text: '', screenshot: 'permissions tab' },
        { title: 'Override toggles', text: 'Diff vs role highlighted.', screenshot: 'override' },
      ],
    }),
    walkthrough({
      slug: 'roles-troubleshooting',
      title: 'Roles troubleshooting',
      summary: 'When users can\'t access something they should.',
      categorySlug: 'settings-roles',
      tags: ['roles', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Most permission issues are role mismatch or per-user override.',
      videoDesc: 'Troubleshooting (60 sec)',
      steps: [
        { title: 'Check role', text: 'Settings → Staff → user.', screenshot: 'check role' },
        { title: 'Check per-user overrides', text: '', screenshot: 'check overrides' },
        { title: 'Check Audit Log', text: 'Recent permission changes.', screenshot: 'audit log' },
      ],
    }),
  ],
};

export default cm;
