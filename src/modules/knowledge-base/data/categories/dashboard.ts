import { Home } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'dashboard',
    name: 'Dashboard',
    description: 'Your home screen — widgets, KPIs, and quick links.',
    icon: Home,
    accent: 'bg-red-100',
    section: 'workspace',
    order: 1,
  },
  articles: [
    walkthrough({
      slug: 'dashboard-overview',
      title: 'Dashboard overview',
      summary: 'Understand the dashboard widgets, categories, and how data refreshes.',
      categorySlug: 'dashboard',
      tags: ['dashboard', 'overview', 'widgets'],
      featured: true,
      readMinutes: 4,
      intro: 'Your dashboard is the first screen you see when you log in. It surfaces the most important numbers across Jobs, Opportunities, Reporting, Payments, Appointments, Marketing, and Analytics so you can spot what matters in a glance.',
      videoDesc: 'Dashboard tour (3 min)',
      prereqs: ['You have access to at least one organization', 'You have view permission for the modules whose widgets are visible'],
      steps: [
        { title: 'Open the Dashboard', text: 'Click "Dashboard" in the left sidebar — it\'s the default landing page after login.', screenshot: 'dashboard sidebar nav highlighted' },
        { title: 'Scan widgets by category', text: 'Widgets are grouped under category headers (Jobs, Opportunities, Reporting, Payments, Appointments, Marketing, Detailed Analytics). Each widget shows a single metric or chart.', screenshot: 'dashboard widget grid' },
        { title: 'Refresh data', text: 'Click "Refresh" in the header to re-pull data without reloading the page. Dashboard data is cached for performance.', screenshot: 'refresh button in dashboard header' },
        { title: 'Add or remove widgets', text: 'Click "Add Widget" to open the picker. Toggle widgets on or off; your selection is saved per-user.', screenshot: 'add widget modal' },
      ],
      tips: ['Drag widgets to reorder them — your order persists across sessions.', 'Click any widget to drill into the underlying report.'],
      related: [
        { categorySlug: 'dashboard', articleSlug: 'add-and-arrange-widgets' },
        { categorySlug: 'dashboard', articleSlug: 'widget-categories-explained' },
        { categorySlug: 'reporting', articleSlug: 'reporting-overview' },
      ],
    }),
    walkthrough({
      slug: 'add-and-arrange-widgets',
      title: 'Add and arrange dashboard widgets',
      summary: 'Customize your dashboard by choosing which widgets to show and in what order.',
      categorySlug: 'dashboard',
      tags: ['dashboard', 'widgets', 'customize'],
      readMinutes: 3,
      intro: 'BuilderLync ships with dozens of widgets across seven categories. You decide which ones appear on your personal dashboard.',
      videoDesc: 'Add and arrange widgets (90 sec)',
      steps: [
        { title: 'Click "Add Widget"', text: 'The button is in the top-right of the dashboard.', screenshot: 'add widget button' },
        { title: 'Pick widgets', text: 'Toggle widgets on or off. Use the search bar in the picker to find specific widgets quickly.', screenshot: 'widget picker modal' },
        { title: 'Apply', text: 'Click "Apply". Your dashboard reloads with the new widgets in their default positions.', screenshot: 'dashboard after apply' },
        { title: 'Reorder', text: 'Drag a widget by its handle to a new position. The new order saves automatically.', screenshot: 'drag handle on widget card' },
      ],
      tips: ['Widget preferences are per-user — your teammates see their own selections.'],
      related: [
        { categorySlug: 'dashboard', articleSlug: 'widget-categories-explained' },
        { categorySlug: 'dashboard', articleSlug: 'customize-your-default-view' },
      ],
    }),
    walkthrough({
      slug: 'widget-categories-explained',
      title: 'Widget categories explained',
      summary: 'What each widget category covers — Jobs, Opportunities, Reporting, Payments, Appointments, Marketing, Analytics.',
      categorySlug: 'dashboard',
      tags: ['dashboard', 'widgets', 'reference'],
      readMinutes: 4,
      intro: 'Widgets are organized by category so you can find the right metric fast. Here is what lives where.',
      videoDesc: 'Widget categories (2 min)',
      steps: [
        { title: 'Jobs', text: 'Active jobs, jobs by stage, days-to-close, value pipeline. Best for production managers.', screenshot: 'Jobs widget category' },
        { title: 'Opportunities', text: 'Lead volume, opportunity-by-stage, conversion rate, lost reasons. Best for sales.', screenshot: 'Opportunities widget category' },
        { title: 'Reporting', text: 'AI-generated executive summaries, custom report previews. Surfaces narrative insight.', screenshot: 'Reporting widget category' },
        { title: 'Payments', text: 'Outstanding invoices, recent transactions, AR aging. Best for finance.', screenshot: 'Payments widget category' },
        { title: 'Appointments', text: 'Today\'s schedule, upcoming visits, no-show rate.', screenshot: 'Appointments widget category' },
        { title: 'Marketing', text: 'Lead source mix, campaign performance, social engagement.', screenshot: 'Marketing widget category' },
        { title: 'Detailed Analytics', text: 'Granular metrics — Google Ads, Meta Ads, GBP performance, attribution detail.', screenshot: 'Detailed Analytics widget category' },
      ],
      related: [
        { categorySlug: 'dashboard', articleSlug: 'add-and-arrange-widgets' },
        { categorySlug: 'reporting', articleSlug: 'pre-built-reports' },
      ],
    }),
    walkthrough({
      slug: 'customize-your-default-view',
      title: 'Customize your default dashboard view',
      summary: 'Set which dashboard you see at login and tune density for small screens.',
      categorySlug: 'dashboard',
      tags: ['dashboard', 'customize', 'preferences'],
      readMinutes: 3,
      intro: 'If your team uses multiple dashboards (e.g. role-specific layouts), pick which one loads by default and adjust density.',
      videoDesc: 'Customize default view (90 sec)',
      steps: [
        { title: 'Open user preferences', text: 'Click your avatar in the top-right and open "Preferences".', screenshot: 'user menu preferences link' },
        { title: 'Pick default dashboard', text: 'Under "Default landing page" select "Dashboard" or any other module.', screenshot: 'default landing dropdown' },
        { title: 'Adjust density', text: 'Toggle "Compact widgets" to fit more on screen.', screenshot: 'compact widgets toggle' },
        { title: 'Save', text: 'Changes apply immediately on your next login.', screenshot: 'save preferences button' },
      ],
      related: [
        { categorySlug: 'dashboard', articleSlug: 'dashboard-shortcuts' },
      ],
    }),
    walkthrough({
      slug: 'dashboard-shortcuts',
      title: 'Dashboard keyboard shortcuts',
      summary: 'Move around the dashboard faster with keyboard shortcuts.',
      categorySlug: 'dashboard',
      tags: ['dashboard', 'shortcuts', 'productivity'],
      readMinutes: 2,
      intro: 'A few keyboard shortcuts make dashboard navigation faster, especially when you have many widgets.',
      videoDesc: 'Keyboard shortcuts (60 sec)',
      steps: [
        { title: 'Refresh dashboard', text: 'Press R to refresh all widget data without reloading the page.', screenshot: 'shortcut hint R refresh' },
        { title: 'Open widget picker', text: 'Press W to open the "Add Widget" panel.', screenshot: 'shortcut hint W widget' },
        { title: 'Jump to module', text: 'Press G then the first letter of the module name (G then J for Jobs, G then P for Payments).', screenshot: 'shortcut overlay' },
      ],
      tips: ['Open the global shortcut overlay any time with ? (Shift+/).'],
    }),
  ],
};

export default cm;
