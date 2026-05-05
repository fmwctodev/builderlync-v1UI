import { ScrollText } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-audit-logs',
    name: 'Audit Logs',
    description: 'Activity history across users and modules.',
    icon: ScrollText,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 12,
  },
  articles: [
    walkthrough({
      slug: 'audit-logs-overview',
      title: 'Audit logs overview',
      summary: 'Every change to records, settings, and permissions.',
      categorySlug: 'settings-audit-logs',
      tags: ['audit', 'logs', 'overview'],
      readMinutes: 3,
      intro: 'Audit logs track who did what when, across the entire system.',
      videoDesc: 'Audit logs tour (60 sec)',
      steps: [
        { title: 'Settings → Audit Logs', text: '', screenshot: 'audit logs section' },
        { title: 'Filter by user / entity / time', text: '', screenshot: 'filters' },
        { title: 'Click row', text: 'See the diff.', screenshot: 'diff view' },
      ],
    }),
    walkthrough({
      slug: 'who-did-what',
      title: 'Find who made a specific change',
      summary: 'Trace a record back to the user who edited it.',
      categorySlug: 'settings-audit-logs',
      tags: ['audit', 'who'],
      readMinutes: 2,
      intro: 'Audit logs answer "who changed this?" reliably.',
      videoDesc: 'Who did it (45 sec)',
      steps: [
        { title: 'Filter by entity ID', text: 'Job ID, Contact ID, etc.', screenshot: 'entity filter' },
        { title: 'See changelog', text: '', screenshot: 'changelog' },
      ],
    }),
    walkthrough({
      slug: 'export-audit-logs',
      title: 'Export audit logs',
      summary: 'Download CSV of audit history for compliance.',
      categorySlug: 'settings-audit-logs',
      tags: ['audit', 'export'],
      readMinutes: 2,
      intro: 'Export logs for SOC 2 / HIPAA / internal compliance.',
      videoDesc: 'Export (45 sec)',
      steps: [
        { title: 'Filter to date range', text: '', screenshot: 'date filter' },
        { title: 'Click Export', text: '', screenshot: 'export button' },
        { title: 'Download CSV', text: '', screenshot: 'download' },
      ],
    }),
    walkthrough({
      slug: 'log-retention',
      title: 'Audit log retention',
      summary: 'How long logs are kept and how to extend.',
      categorySlug: 'settings-audit-logs',
      tags: ['audit', 'retention'],
      readMinutes: 2,
      intro: 'Default retention is 90 days; Enterprise plans extend to 7 years.',
      videoDesc: 'Retention (45 sec)',
      steps: [
        { title: 'Settings → Audit → Retention', text: '', screenshot: 'retention' },
        { title: 'View current setting', text: '', screenshot: 'current setting' },
        { title: 'Contact Support to extend', text: '', screenshot: 'support link' },
      ],
    }),
    walkthrough({
      slug: 'audit-troubleshooting',
      title: 'Audit logs troubleshooting',
      summary: 'When logs don\'t show what you expected.',
      categorySlug: 'settings-audit-logs',
      tags: ['audit', 'troubleshooting'],
      readMinutes: 2,
      intro: 'Some events are logged at the entity level, not the audit log — check the entity\'s activity tab.',
      videoDesc: 'Troubleshooting (45 sec)',
      steps: [
        { title: 'Check entity activity', text: 'Each entity has its own timeline.', screenshot: 'entity activity' },
        { title: 'Check time range', text: 'Beyond retention, logs are gone.', screenshot: 'date range' },
      ],
    }),
  ],
};

export default cm;
