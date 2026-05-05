import { Wallet } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'account-and-plan',
    name: 'Account & Plan',
    description: 'Subscription, plan changes, seats, cancellation.',
    icon: Wallet,
    accent: 'bg-red-100',
    section: 'support-account',
    order: 2,
  },
  articles: [
    walkthrough({
      slug: 'subscription-and-billing',
      title: 'Subscription and billing',
      summary: 'Where to view your plan, invoices, and payment method.',
      categorySlug: 'account-and-plan',
      tags: ['billing', 'subscription'],
      readMinutes: 3,
      intro: 'Account billing lives in Settings → Billing. Owner-only by default.',
      videoDesc: 'Billing tour (60 sec)',
      steps: [
        { title: 'Settings → Billing', text: '', screenshot: 'billing section' },
        { title: 'View plan', text: '', screenshot: 'plan' },
        { title: 'Update card', text: '', screenshot: 'card' },
        { title: 'Download invoices', text: '', screenshot: 'invoices' },
      ],
      related: [{ categorySlug: 'settings-billing', articleSlug: 'billing-overview' }],
    }),
    walkthrough({
      slug: 'change-your-plan',
      title: 'Change your plan',
      summary: 'Upgrade or downgrade your BuilderLync subscription.',
      categorySlug: 'account-and-plan',
      tags: ['plan', 'upgrade', 'downgrade'],
      readMinutes: 3,
      intro: 'Plan changes prorate to the day.',
      videoDesc: 'Change plan (60 sec)',
      steps: [
        { title: 'Settings → Billing → Change Plan', text: '', screenshot: 'change plan' },
        { title: 'Pick tier', text: 'Starter, Pro, Enterprise.', screenshot: 'tier picker' },
        { title: 'Confirm', text: 'Charged or credited prorated.', screenshot: 'confirm' },
      ],
    }),
    walkthrough({
      slug: 'manage-seats',
      title: 'Manage seats',
      summary: 'Buy more seats or remove unused.',
      categorySlug: 'account-and-plan',
      tags: ['seats', 'plan'],
      readMinutes: 2,
      intro: 'Seats are billed monthly; changes prorate.',
      videoDesc: 'Manage seats (45 sec)',
      steps: [
        { title: 'Billing → Seats', text: '', screenshot: 'seats' },
        { title: 'Adjust', text: '', screenshot: 'counter' },
      ],
    }),
    walkthrough({
      slug: 'cancel-your-account',
      title: 'Cancel your account',
      summary: 'Pause or fully cancel.',
      categorySlug: 'account-and-plan',
      tags: ['cancel', 'account'],
      readMinutes: 4,
      intro: 'Cancellation pauses billing. Data is retained for 90 days; you can reactivate.',
      videoDesc: 'Cancel (60 sec)',
      steps: [
        { title: 'Billing → Cancel', text: '', screenshot: 'cancel button' },
        { title: 'Reason form', text: 'Tell us why.', screenshot: 'reason form' },
        { title: 'Confirm', text: 'Account marked cancelled; access until period end.', screenshot: 'confirm' },
      ],
      warnings: ['After 90 days post-cancellation, data is permanently deleted. Export anything you need.'],
    }),
  ],
};

export default cm;
