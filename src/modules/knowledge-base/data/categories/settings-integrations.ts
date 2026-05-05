import { Plug } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-integrations',
    name: 'Integrations',
    description: 'Third-party connections — QuickBooks, Google, EagleView, Stripe.',
    icon: Plug,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 6,
  },
  articles: [
    walkthrough({
      slug: 'integrations-overview',
      title: 'Integrations overview',
      summary: 'Available integrations and what each unlocks.',
      categorySlug: 'settings-integrations',
      tags: ['integrations', 'overview'],
      readMinutes: 4,
      intro: 'BuilderLync integrates with 30+ tools. Each integration connects via OAuth.',
      videoDesc: 'Integrations tour (90 sec)',
      steps: [
        { title: 'Settings → Integrations', text: '', screenshot: 'integrations section' },
        { title: 'Browse by category', text: 'Accounting, Marketing, Comms, Field, Storage.', screenshot: 'categories' },
        { title: 'Per-integration tile', text: 'Status + connect button.', screenshot: 'tile' },
      ],
    }),
    walkthrough({
      slug: 'connect-quickbooks',
      title: 'Connect QuickBooks',
      summary: 'Set up two-way sync of customers, invoices, payments.',
      categorySlug: 'settings-integrations',
      tags: ['integrations', 'quickbooks'],
      readMinutes: 5,
      intro: 'QuickBooks Online connection enables two-way sync. Direct guide for the most common case.',
      videoDesc: 'Connect QB (2 min)',
      steps: [
        { title: 'Integrations → QuickBooks', text: '', screenshot: 'qb tile' },
        { title: 'OAuth', text: '', screenshot: 'oauth' },
        { title: 'Pick company', text: '', screenshot: 'company picker' },
        { title: 'Initial sync', text: '', screenshot: 'sync progress' },
      ],
      related: [{ categorySlug: 'payments', articleSlug: 'quickbooks-two-way-sync' }],
    }),
    walkthrough({
      slug: 'connect-google',
      title: 'Connect Google services',
      summary: 'Calendar, Gmail, GA4, Google Ads, GBP.',
      categorySlug: 'settings-integrations',
      tags: ['integrations', 'google'],
      readMinutes: 4,
      intro: 'Google has multiple BuilderLync integrations — connect each separately.',
      videoDesc: 'Connect Google (90 sec)',
      steps: [
        { title: 'Pick service', text: 'Calendar / Gmail / Analytics / Ads / GBP.', screenshot: 'google services' },
        { title: 'OAuth', text: 'Each requests its own scope.', screenshot: 'oauth' },
        { title: 'Confirm config', text: '', screenshot: 'config' },
      ],
    }),
    walkthrough({
      slug: 'disconnect-an-integration',
      title: 'Disconnect an integration',
      summary: 'Revoke access; existing data stays.',
      categorySlug: 'settings-integrations',
      tags: ['integrations', 'disconnect'],
      readMinutes: 2,
      intro: 'Disconnecting stops future sync but keeps already-synced data.',
      videoDesc: 'Disconnect (45 sec)',
      steps: [
        { title: 'Open integration tile', text: '', screenshot: 'tile' },
        { title: 'Click Disconnect', text: '', screenshot: 'disconnect button' },
        { title: 'Confirm', text: '', screenshot: 'confirm' },
      ],
    }),
    walkthrough({
      slug: 'integrations-troubleshooting',
      title: 'Integrations troubleshooting',
      summary: 'When sync fails or data looks wrong.',
      categorySlug: 'settings-integrations',
      tags: ['integrations', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Most integration failures are expired tokens — reconnect to fix.',
      videoDesc: 'Troubleshooting (90 sec)',
      steps: [
        { title: 'Check status', text: 'Integration tile shows "Reconnect needed" if token expired.', screenshot: 'reconnect notice' },
        { title: 'Reconnect', text: 'OAuth again.', screenshot: 'reconnect' },
        { title: 'Force refresh', text: 'Trigger a manual sync.', screenshot: 'force refresh' },
      ],
    }),
  ],
};

export default cm;
