import { PhoneCall } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'routing-and-numbers',
    name: 'Routing & Numbers',
    description: 'Phone numbers, call routing, and after-hours rules.',
    icon: PhoneCall,
    accent: 'bg-fuchsia-100',
    section: 'sierra-ai',
    order: 4,
  },
  articles: [
    walkthrough({
      slug: 'import-phone-numbers',
      title: 'Import or buy phone numbers',
      summary: 'Add Twilio numbers to your account for Sierra agents.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'numbers', 'twilio'],
      readMinutes: 4,
      intro: 'Sierra agents need phone numbers. Buy new ones in BuilderLync or import existing Twilio numbers.',
      videoDesc: 'Import numbers (2 min)',
      steps: [
        { title: 'Sierra → Numbers tab', text: '', screenshot: 'numbers tab' },
        { title: 'Click Import or Buy', text: '', screenshot: 'import button' },
        { title: 'Pick area code', text: '', screenshot: 'area code picker' },
        { title: 'Confirm', text: 'Number added immediately.', screenshot: 'number list' },
      ],
    }),
    walkthrough({
      slug: 'assign-number-to-agent',
      title: 'Assign a number to an agent',
      summary: 'Map a phone number to a specific Sierra agent.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'numbers', 'assign'],
      readMinutes: 3,
      intro: 'Each number routes to one agent. You can have multiple numbers route to the same agent for tracking.',
      videoDesc: 'Assign number (60 sec)',
      steps: [
        { title: 'Numbers → click number', text: '', screenshot: 'number detail' },
        { title: 'Pick agent', text: 'Dropdown.', screenshot: 'agent picker' },
        { title: 'Save', text: '', screenshot: 'save' },
      ],
    }),
    walkthrough({
      slug: 'business-hours-and-routing',
      title: 'Business hours and after-hours routing',
      summary: 'Different routing during open hours vs closed.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'hours', 'routing'],
      readMinutes: 4,
      intro: 'Configure when an agent picks up vs when calls go to voicemail or another number.',
      videoDesc: 'Business hours (2 min)',
      steps: [
        { title: 'Numbers → Routing rules', text: '', screenshot: 'routing rules' },
        { title: 'Define hours', text: 'Per day of week.', screenshot: 'hours grid' },
        { title: 'After-hours behavior', text: 'Voicemail, agent answers anyway, or transfer.', screenshot: 'after hours config' },
      ],
    }),
    walkthrough({
      slug: 'voicemail-and-after-hours',
      title: 'Voicemail and after-hours messages',
      summary: 'Customize the voicemail greeting and transcription.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'voicemail'],
      readMinutes: 3,
      intro: 'Voicemails transcribe automatically and notify the assigned rep.',
      videoDesc: 'Voicemail (90 sec)',
      steps: [
        { title: 'Voicemail config', text: '', screenshot: 'voicemail config' },
        { title: 'Custom greeting', text: 'Text-to-speech or upload audio.', screenshot: 'greeting' },
        { title: 'Transcripts', text: 'Auto-attach to contact timeline.', screenshot: 'transcript view' },
      ],
    }),
    walkthrough({
      slug: 'number-pooling',
      title: 'Number pooling',
      summary: 'Use a pool of numbers to dynamically assign per ad/campaign.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'numbers', 'pooling'],
      readMinutes: 4,
      intro: 'Number pooling assigns a unique number to each ad campaign for clean attribution.',
      videoDesc: 'Number pooling (2 min)',
      steps: [
        { title: 'Sierra → Numbers → Pools', text: '', screenshot: 'pools tab' },
        { title: 'Create pool', text: 'Pick a set of numbers.', screenshot: 'create pool' },
        { title: 'Assign to campaign', text: '', screenshot: 'campaign mapping' },
      ],
    }),
    walkthrough({
      slug: 'number-billing',
      title: 'Phone number billing',
      summary: 'How numbers are billed monthly.',
      categorySlug: 'routing-and-numbers',
      tags: ['sierra', 'billing', 'numbers'],
      readMinutes: 3,
      intro: 'Each number costs $1-3/month + per-minute usage.',
      videoDesc: 'Number billing (90 sec)',
      steps: [
        { title: 'Settings → Billing → Phone usage', text: '', screenshot: 'phone usage' },
        { title: 'Per-number cost', text: '', screenshot: 'per-number' },
        { title: 'Per-minute usage', text: '', screenshot: 'per-minute' },
      ],
    }),
  ],
};

export default cm;
