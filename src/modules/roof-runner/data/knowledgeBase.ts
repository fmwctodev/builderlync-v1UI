/**
 * BuilderLync Knowledge Base — content + types + lookup helpers.
 *
 * This file is the single source of truth for KB content. To add or update
 * articles, edit the `KB_CATEGORIES` and `KB_ARTICLES` arrays below.
 *
 * The data shape is intentionally portable so the content can be migrated
 * to a Supabase table (e.g. `kb_categories` / `kb_articles`) later without
 * changing the page components — they read through the helper functions
 * exported at the bottom of this file.
 */

import {
  type LucideIcon,
  Home, Users, HardHat, Calendar, MessageSquare, FileCheck, Ruler,
  Camera, Megaphone, Zap, CloudLightning, Bot, CreditCard, Settings,
  ShoppingCart, BarChart, Star, Sparkles,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface KbCategory {
  /** URL-safe identifier — used in the route path. */
  slug: string;
  /** Display name shown in cards, breadcrumbs, headings. */
  name: string;
  /** One-line description shown on the home grid. */
  description: string;
  /** Lucide icon for the category card. */
  icon: LucideIcon;
  /** Tailwind background class for the icon tile (light mode). Dark uses /20. */
  accent: string;
  /** Sort order on the home page (lower = earlier). */
  order: number;
}

/**
 * A content block is a structured piece of an article body. Using
 * structured blocks (rather than raw markdown) keeps the renderer
 * dependency-free and ensures consistent styling.
 */
export type KbBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone?: 'info' | 'tip' | 'warn'; title?: string; text: string }
  | { type: 'video'; provider?: 'youtube' | 'vimeo' | 'loom'; src: string; caption?: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'steps'; items: { title: string; text: string }[] }
  | { type: 'code'; language?: string; text: string };

export interface KbArticle {
  /** URL-safe identifier — used in the route path. */
  slug: string;
  /** Article title shown on cards and at the top of the detail view. */
  title: string;
  /** Short summary (1-2 sentences) — shown on lists and search results. */
  summary: string;
  /** Slug of the parent category. Must exist in KB_CATEGORIES. */
  categorySlug: string;
  /** Free-form tags for search relevance. Lowercase. */
  tags: string[];
  /** Primary video for the article (also shown at top of detail view). */
  primaryVideoUrl?: string;
  /** ISO timestamp when the article was last updated. */
  updatedAt: string;
  /** Author display name. */
  author?: string;
  /** Featured on the home page if true. */
  featured?: boolean;
  /** Estimated read time in minutes. */
  readMinutes?: number;
  /** Structured body blocks. */
  body: KbBlock[];
}

// ============================================================================
// CATEGORIES — keep ordered by `order` (Getting Started first)
// ============================================================================

export const KB_CATEGORIES: KbCategory[] = [
  {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Set up your account, invite your team, and ship your first proposal.',
    icon: Home,
    accent: 'bg-red-100',
    order: 1,
  },
  {
    slug: 'pipeline-and-opportunities',
    name: 'Pipeline & Opportunities',
    description: 'Lead-to-closed pipeline, kanban stages, and opportunity management.',
    icon: BarChart,
    accent: 'bg-purple-100',
    order: 2,
  },
  {
    slug: 'jobs',
    name: 'Jobs',
    description: 'Convert opportunities to jobs, manage workflow stages, assign crews.',
    icon: HardHat,
    accent: 'bg-emerald-100',
    order: 3,
  },
  {
    slug: 'proposals',
    name: 'Proposals',
    description: 'Build, send, sign, and track proposals — manually or with Sierra AI.',
    icon: FileCheck,
    accent: 'bg-amber-100',
    order: 4,
  },
  {
    slug: 'measurements',
    name: 'Measurements',
    description: 'Order EagleView reports or capture DIY measurements.',
    icon: Ruler,
    accent: 'bg-violet-100',
    order: 5,
  },
  {
    slug: 'job-cam',
    name: 'Job Cam',
    description: 'Site photos, daily reports, and homeowner-facing galleries.',
    icon: Camera,
    accent: 'bg-orange-100',
    order: 6,
  },
  {
    slug: 'calendar-and-conversations',
    name: 'Calendar & Conversations',
    description: 'Booked estimates, team scheduling, SMS & email inbox.',
    icon: Calendar,
    accent: 'bg-blue-100',
    order: 7,
  },
  {
    slug: 'contacts',
    name: 'Contacts',
    description: 'Customer profiles, deduplication, CSV import, lead sources.',
    icon: Users,
    accent: 'bg-sky-100',
    order: 8,
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    description: 'Forms, funnels, campaigns, ads, social, and lead routing.',
    icon: Megaphone,
    accent: 'bg-rose-100',
    order: 9,
  },
  {
    slug: 'automations',
    name: 'Automations',
    description: 'Workflow builder, triggers, and stage-based task creation.',
    icon: Zap,
    accent: 'bg-yellow-100',
    order: 10,
  },
  {
    slug: 'storm-intelligence',
    name: 'Storm Intelligence',
    description: 'Storm canvassing, hail forecasts, turfs, GPS rep tracking.',
    icon: CloudLightning,
    accent: 'bg-cyan-100',
    order: 11,
  },
  {
    slug: 'sierra-ai',
    name: 'Sierra AI',
    description: 'Build voice and chat agents, configure prompts, manage scripts.',
    icon: Bot,
    accent: 'bg-fuchsia-100',
    order: 12,
  },
  {
    slug: 'payments-and-invoicing',
    name: 'Payments & Invoicing',
    description: 'Invoices, estimates, transactions, coupons, QuickBooks sync.',
    icon: CreditCard,
    accent: 'bg-teal-100',
    order: 13,
  },
  {
    slug: 'material-and-work-orders',
    name: 'Materials & Work Orders',
    description: 'ABC Supply ordering, supplier integrations, purchase orders.',
    icon: ShoppingCart,
    accent: 'bg-lime-100',
    order: 14,
  },
  {
    slug: 'reporting',
    name: 'Reporting',
    description: 'Pipeline reports, attribution, Google/Meta ads, AI reports.',
    icon: BarChart,
    accent: 'bg-indigo-100',
    order: 15,
  },
  {
    slug: 'reputation',
    name: 'Reputation',
    description: 'Review monitoring, reply automation, QR codes, integrations.',
    icon: Star,
    accent: 'bg-pink-100',
    order: 16,
  },
  {
    slug: 'settings-and-billing',
    name: 'Settings & Billing',
    description: 'Org setup, users, permissions, integrations, subscription.',
    icon: Settings,
    accent: 'bg-slate-100',
    order: 17,
  },
];

// ============================================================================
// ARTICLES
// ============================================================================
//
// Authoring conventions:
// - slugs are kebab-case, unique across the entire KB
// - summary is one sentence, ends with a period
// - body uses structured blocks (paragraph, heading, list, callout, video,
//   steps) — the ArticleBody renderer styles each block consistently
// - primaryVideoUrl renders prominently at the top of the article
// - featured: true surfaces the article on the home page (max ~6)
// ============================================================================

const NOW = '2026-05-04T00:00:00.000Z';

export const KB_ARTICLES: KbArticle[] = [
  // ── Getting Started ──────────────────────────────────────────────────────
  {
    slug: 'welcome-to-builderlync',
    title: 'Welcome to BuilderLync — your first 15 minutes',
    summary: 'A guided tour of the platform: workspace setup, your first contact, and your first proposal.',
    categorySlug: 'getting-started',
    tags: ['onboarding', 'tour', 'setup', 'first-time'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    author: 'BuilderLync Team',
    featured: true,
    readMinutes: 6,
    body: [
      { type: 'paragraph', text: 'BuilderLync brings every part of running a contracting business — leads, estimates, proposals, jobs, payments, and crews — into one workspace. This walkthrough covers the essentials in about fifteen minutes.' },
      { type: 'heading', level: 2, text: 'What you\'ll do' },
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
    ],
  },
  {
    slug: 'invite-your-team',
    title: 'Invite your team and assign roles',
    summary: 'Add staff, assign roles, and control permissions across modules.',
    categorySlug: 'getting-started',
    tags: ['team', 'staff', 'roles', 'permissions', 'rbac'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Roles let you grant the right level of access to each teammate without exposing settings or financial data they shouldn\'t see.' },
      { type: 'heading', level: 2, text: 'Add a teammate' },
      { type: 'steps', items: [
        { title: 'Open Settings', text: 'Go to Settings → Staff.' },
        { title: 'Click "Invite User"', text: 'Enter their email, name, and starting role.' },
        { title: 'Pick a role', text: 'Choose Owner, Admin, Manager, Estimator, or Crew. You can fine-tune permissions afterward.' },
        { title: 'Send the invite', text: 'They receive an email with a one-time signup link. The link expires in 7 days.' },
      ]},
      { type: 'callout', tone: 'info', title: 'Owners only', text: 'Only Owners can change billing, delete the workspace, or modify other Owners.' },
    ],
  },
  {
    slug: 'connect-your-integrations',
    title: 'Connect QuickBooks, Google, and EagleView',
    summary: 'Wire up the integrations that power proposals, payments, and measurements.',
    categorySlug: 'getting-started',
    tags: ['integrations', 'quickbooks', 'google', 'eagleview', 'oauth'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Most BuilderLync features work better with at least these three integrations connected.' },
      { type: 'heading', level: 2, text: 'QuickBooks' },
      { type: 'paragraph', text: 'Two-way sync of invoices, customers, and payments. Settings → Integrations → QuickBooks → Connect.' },
      { type: 'heading', level: 2, text: 'Google Workspace' },
      { type: 'paragraph', text: 'Calendar, Gmail, Google Business Profile, and Google Ads attribution. Settings → Integrations → Google.' },
      { type: 'heading', level: 2, text: 'EagleView' },
      { type: 'paragraph', text: 'Aerial measurements ordered directly from the Measurements module. Settings → Integrations → EagleView.' },
      { type: 'callout', tone: 'warn', title: 'OAuth scopes', text: 'BuilderLync only requests the scopes it needs. You can revoke access at any time from your Google or QuickBooks account settings.' },
    ],
  },

  // ── Pipeline & Opportunities ─────────────────────────────────────────────
  {
    slug: 'pipeline-overview',
    title: 'The Pipeline view: lead to closed at a glance',
    summary: 'Understand the eight-stage pipeline and how to drag projects through it.',
    categorySlug: 'pipeline-and-opportunities',
    tags: ['pipeline', 'kanban', 'stages', 'workflow'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    featured: true,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'The Pipeline view aggregates every customer relationship across the eight standard stages: Lead, Booked Estimate, Measurement, Proposal, Job, Production, Invoice, Closed.' },
      { type: 'heading', level: 2, text: 'How cards are derived' },
      { type: 'paragraph', text: 'Each card represents one Job, Proposal, or Opportunity record. Stage is inferred live from the underlying data — moving a card runs the same actions as the legacy pages, so nothing gets out of sync.' },
      { type: 'heading', level: 2, text: 'Filters that matter' },
      { type: 'list', items: [
        'Owner — narrow to your own book of business',
        'Job type — Residential vs Commercial vs Insurance',
        'Value range — surface only six-figure projects',
        'Search — match across title, contact, address',
      ]},
      { type: 'callout', tone: 'tip', title: 'Hide what\'s noisy', text: 'Click any column header to collapse it. Closed and Invoice columns are collapsed by default to fit on a laptop screen.' },
    ],
  },
  {
    slug: 'opportunities-vs-jobs',
    title: 'Opportunities vs Jobs: when does a Lead become a Job?',
    summary: 'The difference between an Opportunity (sales) and a Job (delivery), and the conversion mechanics.',
    categorySlug: 'pipeline-and-opportunities',
    tags: ['opportunities', 'jobs', 'conversion', 'workflow'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'An Opportunity is a sales record — a lead you\'re actively trying to close. A Job is a contracted delivery — work you\'ve been paid (or promised payment) to perform.' },
      { type: 'heading', level: 2, text: 'When to convert' },
      { type: 'paragraph', text: 'Convert when the customer signs the proposal. The conversion creates a Job with the proposal\'s value, line items, and contact, and moves the Opportunity to "Won".' },
      { type: 'heading', level: 2, text: 'How to convert' },
      { type: 'steps', items: [
        { title: 'Open the Opportunity', text: 'Click the row in the Opportunities table or board.' },
        { title: 'Confirm proposal is signed', text: 'The "Convert to Job" button is disabled until the proposal has signedAt set.' },
        { title: 'Click "Convert to Job"', text: 'BuilderLync creates the Job, links it to the proposal, and assigns it to the same owner.' },
      ]},
    ],
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────
  {
    slug: 'managing-job-stages',
    title: 'Managing job workflow stages',
    summary: 'How workflow stages drive automations, tasks, and what happens when you advance one.',
    categorySlug: 'jobs',
    tags: ['jobs', 'stages', 'workflow', 'automation'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Every Job has a workflow stage that represents where it sits in your delivery process. Stages are configurable per pipeline and trigger automations downstream.' },
      { type: 'heading', level: 2, text: 'Default stages' },
      { type: 'list', items: [
        'New Lead',
        'Estimate Scheduled',
        'Measurement Pending',
        'Proposal Sent',
        'Contract Signed',
        'Materials Ordered',
        'In Progress',
        'Punchlist',
        'Job Complete',
      ]},
      { type: 'callout', tone: 'info', title: 'Auto-task creation', text: 'Some stage transitions auto-create tasks (e.g., entering "Materials Ordered" creates a "Schedule delivery" task). Manage these in Settings → Workflow Stages.' },
    ],
  },
  {
    slug: 'job-cam-overview',
    title: 'Job Cam: photos, reports, and homeowner sharing',
    summary: 'Capture site photos, build daily reports, and share approved galleries with homeowners.',
    categorySlug: 'job-cam',
    tags: ['job-cam', 'photos', 'reports', 'sharing'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    featured: true,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Job Cam is the on-site documentation system: photos and videos linked to a Job, organized into albums, and exportable as branded daily reports.' },
      { type: 'heading', level: 2, text: 'Three workflows' },
      { type: 'list', items: [
        'Field capture from iPad or phone (offline-capable)',
        'Daily report builder with photo annotations',
        'Homeowner sharing — public link, no login required',
      ]},
      { type: 'callout', tone: 'tip', title: 'Offline first', text: 'Photos captured without service queue locally and sync automatically when the device reconnects.' },
    ],
  },

  // ── Proposals ────────────────────────────────────────────────────────────
  {
    slug: 'generate-proposal-with-sierra',
    title: 'Generate a proposal with Sierra AI in 60 seconds',
    summary: 'Hand Sierra a contact and a measurement; get a draft proposal back instantly.',
    categorySlug: 'proposals',
    tags: ['proposals', 'sierra', 'ai', 'generation'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    featured: true,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Sierra reads the contact, the property measurement, and your saved templates to draft a complete proposal — line items, scope, assumptions, and terms.' },
      { type: 'heading', level: 2, text: 'Walkthrough' },
      { type: 'steps', items: [
        { title: 'Open Proposals', text: 'Click "New Proposal" → "Generate with AI".' },
        { title: 'Select contact', text: 'Search by name, address, or phone.' },
        { title: 'Select template', text: 'Pick a base template — Sierra adapts the line items to the measurement.' },
        { title: 'Review and edit', text: 'The draft opens in the proposal editor. Tweak any section before sending.' },
        { title: 'Send for signature', text: 'Click Send. The homeowner gets an email with a one-tap sign link.' },
      ]},
      { type: 'callout', tone: 'info', title: 'Templates matter', text: 'The better your saved templates (assumptions, exclusions, terms), the better Sierra\'s drafts. See "Building reusable proposal templates".' },
    ],
  },
  {
    slug: 'proposal-templates',
    title: 'Building reusable proposal templates',
    summary: 'Save approved scopes, terms, and pricing as templates so every new proposal starts polished.',
    categorySlug: 'proposals',
    tags: ['proposals', 'templates', 'pricing', 'terms'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Templates are the foundation of consistent, professional proposals. Save your top-five jobs as templates and 90% of future proposals start at a draft you can ship in minutes.' },
      { type: 'heading', level: 2, text: 'What to include' },
      { type: 'list', items: [
        'Scope of work — the standard line items for this job type',
        'Assumptions — what you\'re assuming about the property',
        'Exclusions — what\'s explicitly NOT covered',
        'Pricing structure — flat, per-square, or per-unit',
        'Terms and warranties',
        'Cover image and brand colors',
      ]},
    ],
  },

  // ── Measurements ─────────────────────────────────────────────────────────
  {
    slug: 'order-eagleview-report',
    title: 'Ordering an EagleView aerial measurement',
    summary: 'Property measurements without a ladder — pricing, turnaround, and how to attach to a job.',
    categorySlug: 'measurements',
    tags: ['measurements', 'eagleview', 'aerial', 'orders'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    featured: true,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'EagleView aerial measurements give you square footage, pitch, ridge length, valleys, and other roof metrics without climbing onto the property.' },
      { type: 'heading', level: 2, text: 'Pricing & turnaround' },
      { type: 'list', items: [
        'Standard report: 24 hours, $25-65 depending on building complexity',
        'Premium report: 4 hours, $40-95',
        'You pay the EagleView credit price; BuilderLync does not mark up reports',
      ]},
      { type: 'heading', level: 2, text: 'How to order' },
      { type: 'steps', items: [
        { title: 'Open Measurements', text: 'Click Order → New Measurement.' },
        { title: 'Enter address', text: 'Use the autocomplete to ensure exact match.' },
        { title: 'Select products', text: 'Standard, Premium, Commercial, Wall, etc.' },
        { title: 'Place order', text: 'Order is sent to EagleView and tracked in Order History.' },
        { title: 'Receive report', text: 'You get an email when ready; the report attaches to any proposal you generate next.' },
      ]},
    ],
  },
  {
    slug: 'diy-measurements',
    title: 'DIY measurements when EagleView isn\'t available',
    summary: 'Capture pitch, square footage, and ridge length manually using the DIY measurement tool.',
    categorySlug: 'measurements',
    tags: ['measurements', 'diy', 'manual', 'mobile'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Use the DIY tool when the property isn\'t covered by EagleView imagery, when you need a same-day measurement, or when you simply prefer to capture it yourself.' },
      { type: 'callout', tone: 'tip', title: 'Use a tablet on site', text: 'The DIY tool is optimized for tablet use — the interface is touch-first and works offline.' },
    ],
  },

  // ── Calendar & Conversations ─────────────────────────────────────────────
  {
    slug: 'calendar-overview',
    title: 'Calendar: bookings, team scheduling, and reminders',
    summary: 'How to set up bookable calendars, manage team availability, and automate reminders.',
    categorySlug: 'calendar-and-conversations',
    tags: ['calendar', 'scheduling', 'appointments', 'reminders'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Calendar handles three things: bookable slots customers can self-serve, internal team scheduling for production crews, and automated SMS/email reminders.' },
    ],
  },
  {
    slug: 'conversations-inbox',
    title: 'The Conversations inbox: SMS, email, and calls in one place',
    summary: 'Unified inbox for every customer touchpoint with assignment and AI-suggested replies.',
    categorySlug: 'calendar-and-conversations',
    tags: ['conversations', 'inbox', 'sms', 'email', 'calls'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Every text, email, and call attached to a contact lands in Conversations. Assign threads to reps, leave internal notes, and let Sierra suggest replies.' },
    ],
  },

  // ── Contacts ─────────────────────────────────────────────────────────────
  {
    slug: 'csv-import',
    title: 'Import contacts from a CSV',
    summary: 'Bulk-import a list of customers or leads with column mapping and deduplication.',
    categorySlug: 'contacts',
    tags: ['contacts', 'csv', 'import', 'migration'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'CSV import is the fastest way to migrate contacts from another system. The importer handles column mapping, dedup by phone+email, and queues bulk creates so it doesn\'t time out.' },
      { type: 'heading', level: 2, text: 'Recommended columns' },
      { type: 'list', items: [
        'full_name (required)',
        'email or phone (at least one)',
        'company',
        'address',
        'tags (semicolon-separated)',
        'source (e.g. "Storm 2025", "Web form")',
      ]},
    ],
  },

  // ── Marketing ────────────────────────────────────────────────────────────
  {
    slug: 'forms-and-funnels',
    title: 'Building forms and funnels',
    summary: 'Create lead capture forms, embed them on your site, and route submissions to your pipeline.',
    categorySlug: 'marketing',
    tags: ['marketing', 'forms', 'funnels', 'lead-capture'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Forms capture leads from anywhere — your website, landing pages, paid ads, even printed QR codes. Each submission lands as a contact and an opportunity.' },
    ],
  },
  {
    slug: 'campaigns-overview',
    title: 'Running marketing campaigns',
    summary: 'Multi-channel campaigns across email, SMS, social, and ads with attribution back to revenue.',
    categorySlug: 'marketing',
    tags: ['marketing', 'campaigns', 'email', 'sms', 'attribution'],
    updatedAt: NOW,
    readMinutes: 6,
    body: [
      { type: 'paragraph', text: 'Plan, schedule, and measure marketing campaigns in one place — and tie every signed proposal back to the source channel.' },
    ],
  },

  // ── Automations ──────────────────────────────────────────────────────────
  {
    slug: 'workflow-builder-basics',
    title: 'Workflow Builder: triggers, conditions, and actions',
    summary: 'Visual automation builder that watches for events and runs actions in response.',
    categorySlug: 'automations',
    tags: ['automations', 'workflow', 'triggers', 'builder'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    readMinutes: 6,
    body: [
      { type: 'paragraph', text: 'Workflow Builder is a node-based canvas. Pick a trigger, add conditions and delays, then chain together the actions you want to run.' },
      { type: 'heading', level: 2, text: 'Common patterns' },
      { type: 'list', items: [
        'Lead created → SMS welcome → wait 1 day → email follow-up',
        'Job stage = "Materials Ordered" → notify production lead',
        'Proposal viewed but not signed in 48h → text the homeowner',
        'Invoice 7 days overdue → reminder email + assign collections task',
      ]},
    ],
  },

  // ── Storm Intelligence ───────────────────────────────────────────────────
  {
    slug: 'storm-canvassing-overview',
    title: 'Storm Intelligence: canvassing playbook',
    summary: 'Hail forecasts, turfs, GPS rep tracking, and door-by-door visit logging.',
    categorySlug: 'storm-intelligence',
    tags: ['storm', 'canvassing', 'hail', 'turfs', 'gps'],
    updatedAt: NOW,
    readMinutes: 7,
    body: [
      { type: 'paragraph', text: 'Storm Intelligence pairs NOAA forecast and historical hail data with a turf-management system so canvassing crews work the right neighborhoods at the right time.' },
    ],
  },

  // ── Sierra AI ────────────────────────────────────────────────────────────
  {
    slug: 'create-sierra-agent',
    title: 'Create a Sierra AI voice agent',
    summary: 'Build a custom voice or chat agent that handles inbound calls and qualifies leads.',
    categorySlug: 'sierra-ai',
    tags: ['sierra', 'ai', 'voice', 'agent', 'inbound'],
    primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    updatedAt: NOW,
    featured: true,
    readMinutes: 6,
    body: [
      { type: 'paragraph', text: 'Sierra agents answer your phone, qualify leads, book appointments, and write notes back to BuilderLync — 24/7, with no after-hours queue.' },
      { type: 'heading', level: 2, text: 'When to use a Sierra agent' },
      { type: 'list', items: [
        'After-hours inbound coverage',
        'Overflow during peak storm season',
        'Outbound follow-up on aged leads',
        'Appointment confirmations and rescheduling',
      ]},
    ],
  },

  // ── Payments & Invoicing ─────────────────────────────────────────────────
  {
    slug: 'send-an-invoice',
    title: 'Send your first invoice',
    summary: 'Create an invoice from a job, send it for payment, and watch the QuickBooks sync.',
    categorySlug: 'payments-and-invoicing',
    tags: ['payments', 'invoices', 'quickbooks'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Invoices live in Payments. Create from a job, send via email or SMS, and accept card or ACH directly. Every invoice syncs to QuickBooks automatically.' },
    ],
  },
  {
    slug: 'quickbooks-sync',
    title: 'How QuickBooks two-way sync works',
    summary: 'What syncs, what doesn\'t, and how to handle conflicts when both systems edit the same record.',
    categorySlug: 'payments-and-invoicing',
    tags: ['quickbooks', 'sync', 'integrations', 'accounting'],
    updatedAt: NOW,
    readMinutes: 6,
    body: [
      { type: 'paragraph', text: 'BuilderLync syncs Customers, Invoices, Estimates, Payments, and Items with QuickBooks Online. Sync runs every 15 minutes and on every save.' },
      { type: 'callout', tone: 'warn', title: 'Conflict resolution', text: 'If the same record is edited in both systems between syncs, BuilderLync\'s edit wins by default. Change this in Settings → Integrations → QuickBooks.' },
    ],
  },

  // ── Materials & Work Orders ──────────────────────────────────────────────
  {
    slug: 'abc-supply-ordering',
    title: 'Order materials from ABC Supply',
    summary: 'Native ABC Supply integration for placing material orders directly from a job.',
    categorySlug: 'material-and-work-orders',
    tags: ['materials', 'abc-supply', 'orders', 'integrations'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Connect your ABC Supply account once; from then on, materials can be ordered directly from any job without leaving BuilderLync.' },
    ],
  },

  // ── Reporting ────────────────────────────────────────────────────────────
  {
    slug: 'attribution-reports',
    title: 'Lead attribution reports',
    summary: 'Tie every signed proposal back to the lead source — Storm, Google Ads, Meta Ads, referrals.',
    categorySlug: 'reporting',
    tags: ['reporting', 'attribution', 'analytics', 'roi'],
    updatedAt: NOW,
    readMinutes: 5,
    body: [
      { type: 'paragraph', text: 'Attribution reports show which lead sources drove which closed jobs and how much revenue they produced — by week, month, or campaign.' },
    ],
  },
  {
    slug: 'ai-reports',
    title: 'AI-generated executive reports',
    summary: 'Sierra summarizes your weekly and monthly performance with narrative analysis.',
    categorySlug: 'reporting',
    tags: ['reporting', 'ai', 'sierra', 'executive'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'AI Reports give you a one-page narrative of the week or month — what changed, why, and what to do about it. Schedule them weekly to land in your inbox every Monday.' },
    ],
  },

  // ── Reputation ───────────────────────────────────────────────────────────
  {
    slug: 'review-monitoring',
    title: 'Review monitoring and reply automation',
    summary: 'Watch Google, Facebook, and Yelp reviews; auto-thank 5-stars; flag negatives for human reply.',
    categorySlug: 'reputation',
    tags: ['reputation', 'reviews', 'reply', 'automation'],
    updatedAt: NOW,
    readMinutes: 4,
    body: [
      { type: 'paragraph', text: 'Connect your Google Business Profile and other review sources; Reputation pulls every new review into one inbox with AI-suggested replies.' },
    ],
  },

  // ── Settings & Billing ───────────────────────────────────────────────────
  {
    slug: 'subscription-and-billing',
    title: 'Manage your subscription and billing',
    summary: 'View invoices, update payment method, change plan, manage seats.',
    categorySlug: 'settings-and-billing',
    tags: ['billing', 'subscription', 'plan', 'seats'],
    updatedAt: NOW,
    readMinutes: 3,
    body: [
      { type: 'paragraph', text: 'Settings → Billing has everything related to your BuilderLync subscription: plan, seat count, payment method, invoices, and upgrade/downgrade.' },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** All categories sorted by `order`. */
export function getAllCategories(): KbCategory[] {
  return [...KB_CATEGORIES].sort((a, b) => a.order - b.order);
}

/** Look up a category by slug. */
export function getCategoryBySlug(slug: string): KbCategory | null {
  return KB_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/** All articles, most recently updated first. */
export function getAllArticles(): KbArticle[] {
  return [...KB_ARTICLES].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** Articles in a given category. */
export function getArticlesByCategory(categorySlug: string): KbArticle[] {
  return KB_ARTICLES.filter((a) => a.categorySlug === categorySlug).sort(
    (a, b) => (a.updatedAt < b.updatedAt ? 1 : -1),
  );
}

/** Look up an article by slug (within a known category, for safety). */
export function getArticleBySlug(categorySlug: string, articleSlug: string): KbArticle | null {
  return (
    KB_ARTICLES.find((a) => a.categorySlug === categorySlug && a.slug === articleSlug) ?? null
  );
}

/** Articles flagged `featured: true`. Used on the home page. */
export function getFeaturedArticles(limit = 6): KbArticle[] {
  return KB_ARTICLES.filter((a) => a.featured).slice(0, limit);
}

/**
 * Simple keyword search — matches across title, summary, tags, and the
 * paragraph text in the article body. Case-insensitive. Ranks by where
 * the match lands (title > summary > tag > body).
 */
export function searchArticles(query: string, limit = 20): KbArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  type Hit = { article: KbArticle; score: number };
  const hits: Hit[] = [];

  for (const article of KB_ARTICLES) {
    let score = 0;

    if (article.title.toLowerCase().includes(q)) score += 10;
    if (article.summary.toLowerCase().includes(q)) score += 5;
    if (article.tags.some((t) => t.toLowerCase().includes(q))) score += 3;

    if (score === 0) {
      // Body scan only if no metadata hit
      const bodyText = article.body
        .map((b) => {
          if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'callout') {
            return b.text;
          }
          if (b.type === 'list') return b.items.join(' ');
          if (b.type === 'steps') return b.items.map((s) => `${s.title} ${s.text}`).join(' ');
          return '';
        })
        .join(' ')
        .toLowerCase();
      if (bodyText.includes(q)) score += 1;
    }

    if (score > 0) hits.push({ article, score });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit).map((h) => h.article);
}

/**
 * Related articles for a given article: same category, excluding self,
 * ranked by tag overlap.
 */
export function getRelatedArticles(article: KbArticle, limit = 4): KbArticle[] {
  const candidates = KB_ARTICLES.filter(
    (a) => a.categorySlug === article.categorySlug && a.slug !== article.slug,
  );
  const tagSet = new Set(article.tags);
  return candidates
    .map((a) => ({ a, overlap: a.tags.filter((t) => tagSet.has(t)).length }))
    .sort((x, y) => y.overlap - x.overlap)
    .slice(0, limit)
    .map((x) => x.a);
}

/** Total article count — used in the home header. */
export function getArticleCount(): number {
  return KB_ARTICLES.length;
}
