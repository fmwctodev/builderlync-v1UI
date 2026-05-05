import { Users } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-staff',
    name: 'Staff',
    description: 'Add teammates, manage seats, deactivate users.',
    icon: Users,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 3,
  },
  articles: [
    walkthrough({
      slug: 'staff-overview',
      title: 'Staff overview',
      summary: 'Add, edit, and deactivate team members.',
      categorySlug: 'settings-staff',
      tags: ['staff', 'team', 'overview'],
      readMinutes: 3,
      intro: 'Staff is your list of users with seats. Each gets a role.',
      videoDesc: 'Staff tour (60 sec)',
      steps: [
        { title: 'Settings → Staff', text: '', screenshot: 'staff sidebar' },
        { title: 'List view', text: '', screenshot: 'staff list' },
        { title: 'Per-user actions', text: 'Edit, deactivate, reset password.', screenshot: 'user menu' },
      ],
    }),
    walkthrough({
      slug: 'invite-a-team-member',
      title: 'Invite a team member',
      summary: 'Send an invite by email with a starting role.',
      categorySlug: 'settings-staff',
      tags: ['staff', 'invite'],
      readMinutes: 3,
      intro: 'Invites expire in 7 days.',
      videoDesc: 'Invite teammate (60 sec)',
      steps: [
        { title: 'Staff → Invite', text: '', screenshot: 'invite button' },
        { title: 'Email + name + role', text: '', screenshot: 'invite form' },
        { title: 'Send', text: 'They get an email with a signup link.', screenshot: 'sent' },
      ],
    }),
    walkthrough({
      slug: 'edit-staff-permissions',
      title: 'Edit a teammate\'s permissions',
      summary: 'Change role or fine-tune individual permissions.',
      categorySlug: 'settings-staff',
      tags: ['staff', 'permissions'],
      readMinutes: 3,
      intro: 'Most permissions come from role; override individually when needed.',
      videoDesc: 'Edit permissions (60 sec)',
      steps: [
        { title: 'Staff → click user', text: '', screenshot: 'user detail' },
        { title: 'Change role', text: '', screenshot: 'role picker' },
        { title: 'Per-permission toggle', text: 'Override role defaults.', screenshot: 'permission toggles' },
      ],
    }),
    walkthrough({
      slug: 'deactivate-a-user',
      title: 'Deactivate a user',
      summary: 'Remove access without deleting historical data.',
      categorySlug: 'settings-staff',
      tags: ['staff', 'deactivate'],
      readMinutes: 2,
      intro: 'Deactivation revokes login but keeps their assigned jobs and audit history.',
      videoDesc: 'Deactivate user (45 sec)',
      steps: [
        { title: 'Staff → user → Deactivate', text: '', screenshot: 'deactivate button' },
        { title: 'Confirm + reassign', text: 'Optionally reassign their jobs.', screenshot: 'reassign modal' },
      ],
    }),
    walkthrough({
      slug: 'staff-troubleshooting',
      title: 'Staff troubleshooting',
      summary: 'Invite not received, login issues, MFA reset.',
      categorySlug: 'settings-staff',
      tags: ['staff', 'troubleshooting'],
      readMinutes: 2,
      intro: 'Most staff issues are email delivery or MFA.',
      videoDesc: 'Troubleshooting (45 sec)',
      steps: [
        { title: 'Resend invite', text: 'If expired or lost.', screenshot: 'resend invite' },
        { title: 'Reset MFA', text: 'Owner can clear MFA for a user.', screenshot: 'reset mfa' },
        { title: 'Reset password', text: '', screenshot: 'reset password' },
      ],
    }),
  ],
};

export default cm;
