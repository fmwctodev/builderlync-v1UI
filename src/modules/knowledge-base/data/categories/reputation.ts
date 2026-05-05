import { Star } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'reputation',
    name: 'Reputation',
    description: 'Monitor and reply to reviews across platforms.',
    icon: Star,
    accent: 'bg-pink-100',
    section: 'marketing',
    order: 8,
  },
  articles: [
    walkthrough({
      slug: 'connect-google-business-profile',
      title: 'Connect Google Business Profile',
      summary: 'Authorize GBP so reviews flow into BuilderLync.',
      categorySlug: 'reputation',
      tags: ['reputation', 'google', 'gbp', 'connect'],
      readMinutes: 3,
      intro: 'Reviews live in Google Business Profile; connecting brings them into BuilderLync\'s unified inbox.',
      videoDesc: 'Connect GBP (90 sec)',
      steps: [
        { title: 'Settings → Integrations → GBP', text: '', screenshot: 'gbp tile' },
        { title: 'OAuth', text: '', screenshot: 'oauth' },
        { title: 'Pick location', text: 'If you have multiple GBP locations.', screenshot: 'location picker' },
      ],
    }),
    walkthrough({
      slug: 'monitor-reviews',
      title: 'Monitor reviews',
      summary: 'Watch new reviews across Google, Facebook, and Yelp.',
      categorySlug: 'reputation',
      tags: ['reputation', 'reviews', 'monitor'],
      featured: true,
      readMinutes: 3,
      intro: 'Reputation has a unified inbox for every connected review platform.',
      videoDesc: 'Monitor reviews (90 sec)',
      steps: [
        { title: 'Open Reputation', text: 'Sidebar.', screenshot: 'reputation sidebar' },
        { title: 'Inbox tab', text: 'All reviews, newest first.', screenshot: 'review inbox' },
        { title: 'Filter by platform', text: '', screenshot: 'platform filter' },
      ],
    }),
    walkthrough({
      slug: 'reply-to-reviews',
      title: 'Reply to a review',
      summary: 'Send a public response from BuilderLync that posts to the source platform.',
      categorySlug: 'reputation',
      tags: ['reputation', 'reply'],
      readMinutes: 3,
      intro: 'Replies posted from BuilderLync appear publicly on Google/Facebook within minutes.',
      videoDesc: 'Reply to review (90 sec)',
      steps: [
        { title: 'Open the review', text: '', screenshot: 'review detail' },
        { title: 'Type response', text: 'Or click "Suggest reply" for an AI draft.', screenshot: 'reply composer' },
        { title: 'Post', text: 'Reply syncs to the source.', screenshot: 'reply posted' },
      ],
    }),
    walkthrough({
      slug: 'ai-reply-suggestions',
      title: 'AI reply suggestions',
      summary: 'Sierra drafts contextual replies you can edit before posting.',
      categorySlug: 'reputation',
      tags: ['reputation', 'ai', 'reply', 'sierra'],
      readMinutes: 3,
      intro: 'Sierra reads the review tone and your business context to draft a reply.',
      videoDesc: 'AI reply suggestions (90 sec)',
      steps: [
        { title: 'In review reply', text: 'Click "Suggest reply".', screenshot: 'suggest button' },
        { title: 'Pick tone', text: 'Apologetic, grateful, professional.', screenshot: 'tone picker' },
        { title: 'Edit + post', text: '', screenshot: 'edit reply' },
      ],
    }),
    walkthrough({
      slug: 'qr-code-builder',
      title: 'Review QR code builder',
      summary: 'Generate printable QR codes that open your review form.',
      categorySlug: 'reputation',
      tags: ['reputation', 'qr', 'reviews'],
      readMinutes: 3,
      intro: 'QR codes on invoices, business cards, and door hangers drive review volume.',
      videoDesc: 'QR builder (90 sec)',
      steps: [
        { title: 'Reputation → QR Builder', text: '', screenshot: 'qr builder' },
        { title: 'Pick destination', text: 'Direct Google review form, or BuilderLync routing page.', screenshot: 'destination picker' },
        { title: 'Download PNG/SVG', text: 'Print-ready.', screenshot: 'download' },
      ],
    }),
  ],
};

export default cm;
