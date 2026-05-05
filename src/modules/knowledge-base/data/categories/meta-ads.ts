import { BarChart3 } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'meta-ads',
    name: 'Meta Ads',
    description: 'Facebook and Instagram ad performance and attribution.',
    icon: BarChart3,
    accent: 'bg-rose-100',
    section: 'marketing',
    order: 5,
  },
  articles: [
    walkthrough({
      slug: 'connect-facebook-ads-account',
      title: 'Connect a Facebook Ads account',
      summary: 'Authorize Meta so BuilderLync can pull campaign metrics.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'connect'],
      readMinutes: 3,
      intro: 'Meta ads connection is OAuth-based and requires the Ads scope.',
      videoDesc: 'Connect Meta Ads (90 sec)',
      steps: [
        { title: 'Settings → Integrations → Meta Ads', text: '', screenshot: 'meta ads tile' },
        { title: 'OAuth', text: 'Approve the Ads scope.', screenshot: 'oauth' },
        { title: 'Pick ad account', text: 'If multiple.', screenshot: 'ad account picker' },
      ],
    }),
    walkthrough({
      slug: 'meta-campaigns-overview',
      title: 'Meta campaigns overview',
      summary: 'See spend, reach, conversions across campaigns.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'campaigns', 'overview'],
      readMinutes: 3,
      intro: 'Marketing → Analytics → Meta Ads is the dashboard.',
      videoDesc: 'Meta dashboard (90 sec)',
      steps: [
        { title: 'Open Meta Ads tab', text: '', screenshot: 'meta ads tab' },
        { title: 'Date filter', text: '', screenshot: 'date filter' },
        { title: 'Sort by ROAS', text: '', screenshot: 'sort by roas' },
      ],
    }),
    walkthrough({
      slug: 'creative-and-audience-reports',
      title: 'Creative and audience reports',
      summary: 'See which creatives and audiences drive the most leads.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'creative', 'audience'],
      readMinutes: 4,
      intro: 'Drill into a campaign to compare creatives and audiences.',
      videoDesc: 'Creative reports (2 min)',
      steps: [
        { title: 'Campaign detail', text: '', screenshot: 'campaign detail' },
        { title: 'Creatives tab', text: 'Each ad creative ranked by CTR/CPL.', screenshot: 'creatives ranked' },
        { title: 'Audiences tab', text: 'Each audience\'s performance.', screenshot: 'audience performance' },
      ],
    }),
    walkthrough({
      slug: 'attribution-to-jobs',
      title: 'Attribute Meta Ads to jobs',
      summary: 'Connect ad clicks to closed jobs.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'attribution'],
      readMinutes: 3,
      intro: 'BuilderLync joins ad click → form submission → contact → job for end-to-end attribution.',
      videoDesc: 'Attribution (90 sec)',
      steps: [
        { title: 'Reporting → Attribution', text: '', screenshot: 'attribution report' },
        { title: 'Filter source = Facebook/Instagram', text: '', screenshot: 'source filter' },
        { title: 'View revenue', text: '', screenshot: 'revenue column' },
      ],
    }),
    walkthrough({
      slug: 'roi-by-campaign',
      title: 'ROI by Meta campaign',
      summary: 'Revenue divided by spend, per campaign.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'roi'],
      readMinutes: 3,
      intro: 'Pre-built ROI report compares ad spend to closed job value.',
      videoDesc: 'Meta ROI (90 sec)',
      steps: [
        { title: 'Reporting → AI Reports → Meta', text: '', screenshot: 'meta ai report' },
        { title: 'ROAS column', text: '', screenshot: 'roas column' },
        { title: 'Drill into campaign', text: '', screenshot: 'drill in' },
      ],
    }),
    walkthrough({
      slug: 'pixel-and-capi-events',
      title: 'Meta Pixel and Conversions API',
      summary: 'Set up server-side conversion events for accurate attribution.',
      categorySlug: 'meta-ads',
      tags: ['meta-ads', 'pixel', 'capi'],
      readMinutes: 5,
      intro: 'Server-side CAPI events restore attribution lost to iOS 14.5+.',
      videoDesc: 'Pixel + CAPI (3 min)',
      steps: [
        { title: 'Add Pixel ID', text: 'Settings → Integrations → Meta → Pixel.', screenshot: 'pixel id' },
        { title: 'Configure CAPI', text: 'BuilderLync sends conversions server-side.', screenshot: 'capi config' },
        { title: 'Test events', text: 'Use Meta\'s test events tool.', screenshot: 'test events' },
      ],
      warnings: ['CAPI events count for attribution but not for ad delivery optimization unless deduplicated with the Pixel.'],
    }),
  ],
};

export default cm;
