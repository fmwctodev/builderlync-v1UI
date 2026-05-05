import { Rocket } from 'lucide-react';
import { walkthrough, raw } from '../authoring';
import type { CategoryModule, KbBlock } from '../types';

// Migrated existing welcome article — preserves its richer body content
const welcomeBody: KbBlock[] = [
  { type: 'paragraph', text: 'BuilderLync brings every part of running a contracting business — leads, estimates, proposals, jobs, payments, and crews — into one workspace. This walkthrough covers the essentials in about fifteen minutes.' },
  { type: 'video', placeholder: { description: 'Welcome to BuilderLync (3 min)' }, caption: 'Welcome to BuilderLync (3 min)' },
  { type: 'heading', level: 2, text: "What you'll do" },
  { type: 'list', items: [
    'Configure your organization profile and branding',
    'Connect your phone, email, and calendar',
    'Import or add your first contacts',
    'Run your first instant estimate',
    'Send your first proposal with Sierra AI',
  ]},
  { type: 'callout', tone: 'tip', title: 'Tip', text: 'You can complete onboarding at your own pace — every step is reachable later under Settings.' },
  { type: 'heading', level: 2, text: 'The contractor workflow' },
  { type: 'paragraph', text: 'BuilderLync follows the natural rhythm of a contracting job: a lead becomes a booked estimate, a measurement informs a proposal, the proposal converts to a job, the job moves through production, and the invoice closes the loop.' },
  { type: 'steps', items: [
    { title: 'Lead capture', text: 'Forms, calls, web traffic, and Storm Intelligence canvassing all funnel into Contacts and Opportunities.' },
    { title: 'Booked estimate', text: 'Schedule the in-person visit on your Calendar — Sierra can text the homeowner with reminders.' },
    { title: 'Measurement', text: 'Order an EagleView report or capture DIY measurements on site.' },
    { title: 'Proposal', text: 'Generate with AI from the measurement, or build manually from a template.' },
    { title: 'Job', text: 'Convert the signed proposal into a Job with crew assignments and a workflow stage.' },
    { title: 'Production', text: 'Track production in Job Cam with photos, checklists, and shared galleries.' },
    { title: 'Invoice', text: 'Send the invoice from Payments — it syncs back to QuickBooks automatically.' },
  ]},
  { type: 'heading', level: 2, text: "What's next" },
  { type: 'related', articleSlugs: [
    { categorySlug: 'getting-started', articleSlug: 'invite-your-team' },
    { categorySlug: 'getting-started', articleSlug: 'connect-your-integrations' },
    { categorySlug: 'pipeline-and-opportunities', articleSlug: 'pipeline-overview' },
  ]},
];

const cm: CategoryModule = {
  category: {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Set up your account, invite your team, ship your first proposal.',
    icon: Rocket,
    accent: 'bg-red-100',
    section: 'support-account',
    order: 1,
  },
  articles: [
    raw({
      slug: 'welcome-to-builderlync',
      title: 'Welcome to BuilderLync — your first 15 minutes',
      summary: 'A guided tour: workspace setup, your first contact, and your first proposal.',
      categorySlug: 'getting-started',
      tags: ['onboarding', 'tour', 'setup', 'first-time'],
      featured: true,
      readMinutes: 6,
      primaryVideoDesc: 'Welcome to BuilderLync (3 min)',
      body: welcomeBody,
    }),
    walkthrough({
      slug: 'your-first-15-minutes',
      title: 'Your first 15 minutes',
      summary: 'A focused checklist for your first quarter-hour with BuilderLync.',
      categorySlug: 'getting-started',
      tags: ['onboarding', 'checklist'],
      readMinutes: 5,
      intro: 'Skip the noise — here\'s what to do in your first 15 minutes.',
      videoDesc: 'First 15 minutes (3 min)',
      steps: [
        { title: 'Set business info', text: 'Settings → Business Info.', screenshot: 'business info' },
        { title: 'Upload logo', text: 'Brand Board.', screenshot: 'logo upload' },
        { title: 'Connect QuickBooks', text: 'Or skip if not using.', screenshot: 'qb connect' },
        { title: 'Connect Google Calendar', text: '', screenshot: 'calendar connect' },
        { title: 'Invite teammates', text: '', screenshot: 'invite' },
        { title: 'Add your first contact', text: '', screenshot: 'add contact' },
      ],
    }),
    walkthrough({
      slug: 'invite-your-team',
      title: 'Invite your team',
      summary: 'Add staff and assign roles.',
      categorySlug: 'getting-started',
      tags: ['team', 'staff', 'roles'],
      readMinutes: 4,
      intro: 'Invites expire in 7 days. Owners can invite anyone.',
      videoDesc: 'Invite team (90 sec)',
      steps: [
        { title: 'Settings → Staff → Invite', text: '', screenshot: 'invite button' },
        { title: 'Email + name + role', text: '', screenshot: 'invite form' },
        { title: 'Send', text: 'They get a signup link.', screenshot: 'sent' },
      ],
      related: [{ categorySlug: 'settings-staff', articleSlug: 'staff-overview' }],
    }),
    walkthrough({
      slug: 'connect-your-integrations',
      title: 'Connect QuickBooks, Google, and EagleView',
      summary: 'The three integrations that unlock most BuilderLync features.',
      categorySlug: 'getting-started',
      tags: ['integrations', 'quickbooks', 'google', 'eagleview'],
      readMinutes: 5,
      intro: 'Most BuilderLync features work better with QuickBooks (payments), Google (calendar/email), and EagleView (measurements) connected.',
      videoDesc: 'Integrations (3 min)',
      steps: [
        { title: 'QuickBooks', text: 'Settings → Integrations → QuickBooks.', screenshot: 'qb connect' },
        { title: 'Google', text: 'Calendar, Gmail, GBP.', screenshot: 'google services' },
        { title: 'EagleView', text: '', screenshot: 'eagleview connect' },
      ],
    }),
    walkthrough({
      slug: 'import-your-existing-data',
      title: 'Import your existing data',
      summary: 'Bring contacts, jobs, and templates from another system.',
      categorySlug: 'getting-started',
      tags: ['migration', 'import', 'csv'],
      readMinutes: 5,
      intro: 'Most teams come from another CRM. Import contacts via CSV; jobs/proposals require manual setup.',
      videoDesc: 'Import data (2 min)',
      steps: [
        { title: 'CSV import contacts', text: 'Contacts → Import.', screenshot: 'csv import' },
        { title: 'Manual job entry', text: 'For active jobs in flight.', screenshot: 'job entry' },
        { title: 'Save proposal templates', text: 'Replicate your top-five.', screenshot: 'template save' },
      ],
      related: [{ categorySlug: 'contacts', articleSlug: 'import-contacts-from-csv' }],
    }),
    walkthrough({
      slug: 'set-your-brand-colors-and-logo',
      title: 'Set your brand colors and logo',
      summary: 'Brand Board setup so your documents look polished.',
      categorySlug: 'getting-started',
      tags: ['brand', 'colors', 'logo', 'onboarding'],
      readMinutes: 3,
      intro: 'Brand Board is one of the highest-leverage onboarding steps — every customer-facing document inherits your branding.',
      videoDesc: 'Brand setup (90 sec)',
      steps: [
        { title: 'Settings → Brand Board', text: '', screenshot: 'brand board' },
        { title: 'Logo + colors', text: '', screenshot: 'logo and colors' },
        { title: 'Preview a proposal', text: 'See it applied.', screenshot: 'proposal preview' },
      ],
      related: [{ categorySlug: 'settings-brand-board', articleSlug: 'brand-board-overview' }],
    }),
  ],
};

export default cm;
