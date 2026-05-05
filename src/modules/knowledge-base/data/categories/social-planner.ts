import { Share2 } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'social-planner',
    name: 'Social Planner',
    description: 'Schedule posts to Facebook, Instagram, TikTok.',
    icon: Share2,
    accent: 'bg-rose-100',
    section: 'marketing',
    order: 3,
  },
  articles: [
    walkthrough({
      slug: 'social-planner-overview',
      title: 'Social planner overview',
      summary: 'Plan, schedule, and track posts across multiple social channels.',
      categorySlug: 'social-planner',
      tags: ['social', 'overview'],
      readMinutes: 3,
      intro: 'The social planner is a content calendar with multi-channel scheduling and performance tracking.',
      videoDesc: 'Social planner tour (2 min)',
      steps: [
        { title: 'Open Marketing → Social', text: '', screenshot: 'social sidebar' },
        { title: 'Calendar view', text: 'See all scheduled posts.', screenshot: 'calendar' },
        { title: 'List view', text: 'Tabular list with status filters.', screenshot: 'list view' },
      ],
      related: [{ categorySlug: 'social-planner', articleSlug: 'compose-a-post' }],
    }),
    walkthrough({
      slug: 'connect-facebook-instagram',
      title: 'Connect Facebook and Instagram',
      summary: 'Link your Facebook Page and Instagram business account.',
      categorySlug: 'social-planner',
      tags: ['social', 'facebook', 'instagram', 'connect'],
      readMinutes: 3,
      intro: 'Connect via Meta\'s OAuth — the same flow used for Meta Ads.',
      videoDesc: 'Connect FB/IG (90 sec)',
      steps: [
        { title: 'Settings → Integrations → Meta', text: '', screenshot: 'meta integration' },
        { title: 'Connect', text: 'OAuth flow.', screenshot: 'oauth screen' },
        { title: 'Pick page + IG account', text: '', screenshot: 'page picker' },
      ],
    }),
    walkthrough({
      slug: 'connect-tiktok',
      title: 'Connect TikTok for Business',
      summary: 'Authorize TikTok so the social planner can post to your handle.',
      categorySlug: 'social-planner',
      tags: ['social', 'tiktok', 'connect'],
      readMinutes: 3,
      intro: 'TikTok requires a Business account.',
      videoDesc: 'Connect TikTok (90 sec)',
      steps: [
        { title: 'Settings → Integrations → TikTok', text: '', screenshot: 'tiktok integration' },
        { title: 'OAuth', text: 'Approve scopes.', screenshot: 'oauth screen' },
        { title: 'Verify connection', text: 'Test post button.', screenshot: 'test post' },
      ],
    }),
    walkthrough({
      slug: 'compose-a-post',
      title: 'Compose a social post',
      summary: 'Write copy, attach media, pick channels, schedule.',
      categorySlug: 'social-planner',
      tags: ['social', 'compose'],
      readMinutes: 4,
      intro: 'One composer — one post, multiple channels, with channel-specific previews.',
      videoDesc: 'Compose post (2 min)',
      steps: [
        { title: '+ New Post', text: '', screenshot: 'new post button' },
        { title: 'Pick channels', text: 'FB, IG, TikTok, all of the above.', screenshot: 'channel checkboxes' },
        { title: 'Write + attach', text: 'Image or video.', screenshot: 'composer' },
        { title: 'Channel previews', text: 'See how it renders on each.', screenshot: 'previews' },
        { title: 'Schedule', text: 'Now or later.', screenshot: 'schedule' },
      ],
    }),
    walkthrough({
      slug: 'schedule-content-calendar',
      title: 'Plan a content calendar',
      summary: 'Build a multi-week content calendar with bulk scheduling.',
      categorySlug: 'social-planner',
      tags: ['social', 'calendar', 'planning'],
      readMinutes: 4,
      intro: 'Plan a month of content in one sitting using the calendar view.',
      videoDesc: 'Content calendar (2 min)',
      steps: [
        { title: 'Open calendar view', text: '', screenshot: 'calendar view' },
        { title: 'Drag to schedule', text: 'Drag a post draft onto a day/time slot.', screenshot: 'drag slot' },
        { title: 'Bulk import', text: 'CSV with date, channels, copy.', screenshot: 'bulk import' },
      ],
    }),
    walkthrough({
      slug: 'track-post-performance',
      title: 'Track social post performance',
      summary: 'See impressions, engagement, link clicks per post.',
      categorySlug: 'social-planner',
      tags: ['social', 'analytics'],
      readMinutes: 3,
      intro: 'Performance pulls from native platform analytics — refresh every hour.',
      videoDesc: 'Post performance (90 sec)',
      steps: [
        { title: 'Open a published post', text: '', screenshot: 'post detail' },
        { title: 'Performance tab', text: 'Impressions, engagement, click-throughs.', screenshot: 'performance tab' },
        { title: 'Compare across posts', text: 'In the list view, sort by metric.', screenshot: 'sort by metric' },
      ],
    }),
  ],
};

export default cm;
