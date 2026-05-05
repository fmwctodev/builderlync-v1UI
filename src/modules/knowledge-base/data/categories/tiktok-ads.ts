import { BarChart3 } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'tiktok-ads',
    name: 'TikTok Ads',
    description: 'TikTok ad campaign metrics and attribution.',
    icon: BarChart3,
    accent: 'bg-rose-100',
    section: 'marketing',
    order: 6,
  },
  articles: [
    walkthrough({
      slug: 'connect-tiktok-ads',
      title: 'Connect TikTok for Business Ads',
      summary: 'Authorize TikTok ads OAuth.',
      categorySlug: 'tiktok-ads',
      tags: ['tiktok-ads', 'connect'],
      readMinutes: 3,
      intro: 'TikTok Ads connection requires a Business account on TikTok.',
      videoDesc: 'Connect TikTok Ads (90 sec)',
      steps: [
        { title: 'Settings → Integrations → TikTok Ads', text: '', screenshot: 'tiktok integration' },
        { title: 'OAuth', text: '', screenshot: 'oauth' },
        { title: 'Pick advertiser', text: '', screenshot: 'advertiser picker' },
      ],
    }),
    walkthrough({
      slug: 'tiktok-campaigns-overview',
      title: 'TikTok campaigns overview',
      summary: 'See campaigns, ad groups, and creative performance.',
      categorySlug: 'tiktok-ads',
      tags: ['tiktok-ads', 'campaigns'],
      readMinutes: 3,
      intro: 'Marketing → Analytics → TikTok Ads dashboard.',
      videoDesc: 'TikTok dashboard (90 sec)',
      steps: [
        { title: 'Open TikTok Ads tab', text: '', screenshot: 'tiktok tab' },
        { title: 'Filter by date', text: '', screenshot: 'date filter' },
        { title: 'Sort by performance', text: '', screenshot: 'sort options' },
      ],
    }),
    walkthrough({
      slug: 'creative-performance',
      title: 'TikTok creative performance',
      summary: 'Identify top-performing video creatives.',
      categorySlug: 'tiktok-ads',
      tags: ['tiktok-ads', 'creative'],
      readMinutes: 3,
      intro: 'TikTok rewards creative variety. Track which videos win.',
      videoDesc: 'Creative performance (90 sec)',
      steps: [
        { title: 'Campaign detail → Creatives', text: '', screenshot: 'creatives tab' },
        { title: 'Sort by CTR or CPM', text: '', screenshot: 'sort' },
        { title: 'Preview video', text: 'Inline player.', screenshot: 'video player' },
      ],
    }),
    walkthrough({
      slug: 'attribution-to-jobs',
      title: 'Attribute TikTok ads to jobs',
      summary: 'Connect TikTok clicks to signed jobs.',
      categorySlug: 'tiktok-ads',
      tags: ['tiktok-ads', 'attribution'],
      readMinutes: 3,
      intro: 'Same attribution model as Google + Meta — TikTok click → form → contact → job.',
      videoDesc: 'TikTok attribution (60 sec)',
      steps: [
        { title: 'Reporting → Attribution → source = TikTok', text: '', screenshot: 'tiktok filter' },
        { title: 'View jobs', text: '', screenshot: 'jobs from tiktok' },
      ],
    }),
    walkthrough({
      slug: 'troubleshooting',
      title: 'Troubleshooting TikTok Ads',
      summary: 'When data is missing or attribution is off.',
      categorySlug: 'tiktok-ads',
      tags: ['tiktok-ads', 'troubleshooting'],
      readMinutes: 3,
      intro: 'TikTok\'s API has stricter rate limits and longer sync delays than Google/Meta.',
      videoDesc: 'Troubleshooting (90 sec)',
      steps: [
        { title: 'Check connection status', text: '', screenshot: 'status check' },
        { title: 'Force refresh', text: '', screenshot: 'refresh button' },
        { title: 'View sync log', text: '', screenshot: 'sync log' },
      ],
    }),
  ],
};

export default cm;
