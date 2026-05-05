import { Phone } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-phone-setup',
    name: 'Phone Setup',
    description: 'Twilio setup, numbers, voicemail, call routing.',
    icon: Phone,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 8,
  },
  articles: [
    walkthrough({
      slug: 'phone-setup-overview',
      title: 'Phone setup overview',
      summary: 'Buy or import numbers, configure routing, voicemail.',
      categorySlug: 'settings-phone-setup',
      tags: ['phone', 'setup', 'overview'],
      readMinutes: 3,
      intro: 'BuilderLync handles Twilio setup on your behalf — you don\'t need to manage Twilio directly.',
      videoDesc: 'Phone setup tour (60 sec)',
      steps: [
        { title: 'Settings → Phone', text: '', screenshot: 'phone section' },
        { title: 'Numbers', text: 'List of your numbers.', screenshot: 'numbers list' },
        { title: 'Per-number routing', text: '', screenshot: 'routing config' },
      ],
    }),
    walkthrough({
      slug: 'buy-a-phone-number',
      title: 'Buy a phone number',
      summary: 'Add a new number via Twilio.',
      categorySlug: 'settings-phone-setup',
      tags: ['phone', 'buy', 'twilio'],
      readMinutes: 2,
      intro: 'Numbers are typically $1-3/month + per-minute usage.',
      videoDesc: 'Buy a number (45 sec)',
      steps: [
        { title: 'Phone → Buy Number', text: '', screenshot: 'buy button' },
        { title: 'Pick area code', text: '', screenshot: 'area code' },
        { title: 'Confirm purchase', text: '', screenshot: 'confirm' },
      ],
    }),
    walkthrough({
      slug: 'import-existing-twilio-number',
      title: 'Import an existing Twilio number',
      summary: 'Bring numbers from your existing Twilio account.',
      categorySlug: 'settings-phone-setup',
      tags: ['phone', 'twilio', 'import'],
      readMinutes: 3,
      intro: 'If you already have Twilio numbers, you can route them through BuilderLync.',
      videoDesc: 'Import (60 sec)',
      steps: [
        { title: 'Phone → Import', text: '', screenshot: 'import button' },
        { title: 'Twilio account credentials', text: 'API key + SID.', screenshot: 'credentials' },
        { title: 'Pick numbers', text: '', screenshot: 'number picker' },
      ],
    }),
    walkthrough({
      slug: 'voicemail-setup',
      title: 'Voicemail setup',
      summary: 'Custom greeting, transcription, notifications.',
      categorySlug: 'settings-phone-setup',
      tags: ['phone', 'voicemail'],
      readMinutes: 3,
      intro: 'Voicemails transcribe automatically and notify the assigned rep.',
      videoDesc: 'Voicemail setup (60 sec)',
      steps: [
        { title: 'Open number → Voicemail', text: '', screenshot: 'voicemail tab' },
        { title: 'Greeting', text: 'Text-to-speech or upload audio.', screenshot: 'greeting' },
        { title: 'Notification rules', text: 'Email / SMS / both.', screenshot: 'notifications' },
      ],
    }),
    walkthrough({
      slug: 'phone-troubleshooting',
      title: 'Phone troubleshooting',
      summary: 'Calls not routing, dropped calls, recording quality.',
      categorySlug: 'settings-phone-setup',
      tags: ['phone', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Phone issues usually trace to routing config or carrier-side delays.',
      videoDesc: 'Troubleshooting (60 sec)',
      steps: [
        { title: 'Test inbound', text: 'Call the number.', screenshot: 'test inbound' },
        { title: 'Check routing rules', text: '', screenshot: 'routing rules' },
        { title: 'Check Twilio status', text: 'status.twilio.com.', screenshot: 'twilio status' },
      ],
    }),
  ],
};

export default cm;
