import { HandCoins } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'affiliates',
    name: 'Affiliates',
    description: 'Refer BuilderLync, earn commissions, track payouts.',
    icon: HandCoins,
    accent: 'bg-red-100',
    section: 'support-account',
    order: 3,
  },
  articles: [
    walkthrough({
      slug: 'affiliates-overview',
      title: 'Affiliates overview',
      summary: 'Earn 30% commission for 12 months on every account you refer.',
      categorySlug: 'affiliates',
      tags: ['affiliates', 'overview'],
      readMinutes: 3,
      intro: 'BuilderLync\'s affiliate program pays 30% recurring commission for the first 12 months on every account you refer. Net 30 payouts.',
      videoDesc: 'Affiliates tour (60 sec)',
      steps: [
        { title: 'Settings → Affiliates', text: '', screenshot: 'affiliates section' },
        { title: 'View your link', text: 'Personal referral URL.', screenshot: 'referral link' },
        { title: 'Track referrals + payouts', text: '', screenshot: 'tracking' },
      ],
    }),
    walkthrough({
      slug: 'share-your-referral-link',
      title: 'Share your referral link',
      summary: 'Get your unique URL to share with prospects.',
      categorySlug: 'affiliates',
      tags: ['affiliates', 'link'],
      readMinutes: 2,
      intro: 'Your referral link tracks every signup back to you.',
      videoDesc: 'Share link (45 sec)',
      steps: [
        { title: 'Affiliates → Your Link', text: '', screenshot: 'link section' },
        { title: 'Copy', text: '', screenshot: 'copy button' },
        { title: 'Share', text: 'Email, social, in-person.', screenshot: 'share' },
      ],
    }),
    walkthrough({
      slug: 'view-payouts',
      title: 'View payouts',
      summary: 'See pending and completed commission payouts.',
      categorySlug: 'affiliates',
      tags: ['affiliates', 'payouts'],
      readMinutes: 3,
      intro: 'Net 30 payouts: a commission earned in May pays out at the end of June.',
      videoDesc: 'View payouts (60 sec)',
      steps: [
        { title: 'Affiliates → Payouts', text: '', screenshot: 'payouts section' },
        { title: 'Pending vs completed', text: '', screenshot: 'pending payouts' },
        { title: 'Update payout method', text: 'Bank or PayPal.', screenshot: 'payout method' },
      ],
    }),
  ],
};

export default cm;
