import { BarChart3 } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'google-ads',
    name: 'Google Ads',
    description: 'Connect, monitor, and attribute Google Ads campaigns.',
    icon: BarChart3,
    accent: 'bg-rose-100',
    section: 'marketing',
    order: 4,
  },
  articles: [
    walkthrough({
      slug: 'connect-google-ads',
      title: 'Connect Google Ads',
      summary: 'Authorize Google Ads so BuilderLync can pull campaign metrics.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'connect'],
      readMinutes: 3,
      intro: 'Connecting Google Ads pulls campaign metrics into BuilderLync and unlocks attribution from leads to ad spend.',
      videoDesc: 'Connect Google Ads (90 sec)',
      steps: [
        { title: 'Settings → Integrations → Google Ads', text: '', screenshot: 'integration tile' },
        { title: 'OAuth', text: 'Manager and account scopes.', screenshot: 'oauth' },
        { title: 'Pick account', text: 'If you manage multiple.', screenshot: 'account picker' },
      ],
    }),
    walkthrough({
      slug: 'view-campaign-performance',
      title: 'View Google Ads campaign performance',
      summary: 'Spend, clicks, conversions, ROAS by campaign.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'performance'],
      readMinutes: 3,
      intro: 'Marketing → Analytics → Google Ads is the dashboard for every connected account.',
      videoDesc: 'Performance dashboard (90 sec)',
      steps: [
        { title: 'Open Google Ads tab', text: '', screenshot: 'google ads tab' },
        { title: 'Filter by date', text: 'Last 7 / 30 / 90 days or custom.', screenshot: 'date filter' },
        { title: 'Drill into a campaign', text: 'Click any row.', screenshot: 'campaign detail' },
      ],
    }),
    walkthrough({
      slug: 'keyword-and-cost-reports',
      title: 'Keyword and cost reports',
      summary: 'Top keywords and cost-per-click trend.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'keywords'],
      readMinutes: 3,
      intro: 'Find your best (and worst) keywords without leaving BuilderLync.',
      videoDesc: 'Keyword reports (90 sec)',
      steps: [
        { title: 'Campaign detail → Keywords tab', text: '', screenshot: 'keywords tab' },
        { title: 'Sort by spend or conversions', text: '', screenshot: 'sort options' },
        { title: 'Export CSV', text: '', screenshot: 'export button' },
      ],
    }),
    walkthrough({
      slug: 'attribution-from-ads-to-jobs',
      title: 'Attribute Google Ads to jobs',
      summary: 'Tie signed jobs back to the ad that produced the lead.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'attribution'],
      readMinutes: 4,
      intro: 'Attribution joins click → form submission → job to show ROAS by campaign.',
      videoDesc: 'Attribution (2 min)',
      steps: [
        { title: 'Verify UTM tags on ads', text: 'Auto-tag is the simplest path.', screenshot: 'utm guide' },
        { title: 'View attribution report', text: 'Reporting → Attribution.', screenshot: 'attribution view' },
        { title: 'Filter by source = Google Ads', text: '', screenshot: 'source filter' },
      ],
      related: [{ categorySlug: 'attribution-and-analytics', articleSlug: 'attribution-overview' }],
    }),
    walkthrough({
      slug: 'roi-by-campaign',
      title: 'ROI by Google Ads campaign',
      summary: 'Calculate revenue per dollar spent at the campaign level.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'roi'],
      readMinutes: 3,
      intro: 'BuilderLync divides closed job value by ad spend to give you ROAS.',
      videoDesc: 'ROI report (90 sec)',
      steps: [
        { title: 'Reporting → AI Reports → Google Ads', text: '', screenshot: 'ai report' },
        { title: 'View ROAS column', text: '', screenshot: 'roas table' },
        { title: 'Drill in', text: 'Click campaign for the contributing jobs.', screenshot: 'jobs list' },
      ],
    }),
    walkthrough({
      slug: 'troubleshooting-data-gaps',
      title: 'Troubleshooting Google Ads data gaps',
      summary: 'Why metrics might be missing or delayed.',
      categorySlug: 'google-ads',
      tags: ['google-ads', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Google Ads data lags 1-3 hours; conversion data lags up to 48 hours.',
      videoDesc: 'Troubleshooting (90 sec)',
      steps: [
        { title: 'Check connection', text: 'Settings → Integrations → Google Ads → Status.', screenshot: 'status check' },
        { title: 'Refresh manually', text: 'Force re-pull.', screenshot: 'refresh button' },
        { title: 'View sync log', text: 'Last sync time + any errors.', screenshot: 'sync log' },
      ],
    }),
  ],
};

export default cm;
