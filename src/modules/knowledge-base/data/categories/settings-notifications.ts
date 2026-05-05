import { Bell } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-notifications',
    name: 'Notifications',
    description: 'Email, SMS, push, and in-app alerts.',
    icon: Bell,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 11,
  },
  articles: [
    walkthrough({
      slug: 'notifications-overview',
      title: 'Notifications overview',
      summary: 'What triggers notifications and how to control them.',
      categorySlug: 'settings-notifications',
      tags: ['notifications', 'overview'],
      readMinutes: 3,
      intro: 'BuilderLync sends in-app, email, SMS, and push notifications for relevant events.',
      videoDesc: 'Notifications tour (60 sec)',
      steps: [
        { title: 'Settings → Notifications', text: '', screenshot: 'notifications section' },
        { title: 'Per-event channels', text: 'Toggle email/SMS/push per event.', screenshot: 'event grid' },
      ],
    }),
    walkthrough({
      slug: 'configure-per-event',
      title: 'Configure notifications per event',
      summary: 'Choose which channels for each event type.',
      categorySlug: 'settings-notifications',
      tags: ['notifications', 'events'],
      readMinutes: 3,
      intro: 'Events include: New lead, Form submission, Proposal signed, Payment received, Task assigned.',
      videoDesc: 'Per-event (60 sec)',
      steps: [
        { title: 'Pick event', text: '', screenshot: 'event row' },
        { title: 'Toggle channels', text: '', screenshot: 'channel toggles' },
        { title: 'Save', text: '', screenshot: 'save' },
      ],
    }),
    walkthrough({
      slug: 'mobile-push-notifications',
      title: 'Enable mobile push notifications',
      summary: 'OneSignal-powered push to your device.',
      categorySlug: 'settings-notifications',
      tags: ['notifications', 'push', 'mobile'],
      readMinutes: 3,
      intro: 'BuilderLync uses OneSignal for push. Allow notifications when prompted.',
      videoDesc: 'Push notifications (60 sec)',
      steps: [
        { title: 'Open BuilderLync on mobile', text: '', screenshot: 'mobile app' },
        { title: 'Allow when prompted', text: '', screenshot: 'allow prompt' },
        { title: 'Verify in Notifications settings', text: 'Push toggle is enabled.', screenshot: 'push toggle' },
      ],
    }),
    walkthrough({
      slug: 'quiet-hours',
      title: 'Set quiet hours',
      summary: 'Pause non-urgent notifications during off-hours.',
      categorySlug: 'settings-notifications',
      tags: ['notifications', 'quiet-hours'],
      readMinutes: 2,
      intro: 'Quiet hours suppress non-critical notifications outside business hours.',
      videoDesc: 'Quiet hours (45 sec)',
      steps: [
        { title: 'Notifications → Quiet Hours', text: '', screenshot: 'quiet hours' },
        { title: 'Set window', text: 'Per day of week.', screenshot: 'window picker' },
      ],
    }),
    walkthrough({
      slug: 'notifications-troubleshooting',
      title: 'Notifications troubleshooting',
      summary: 'Not getting alerts? Check channel toggles, browser permissions, OneSignal config.',
      categorySlug: 'settings-notifications',
      tags: ['notifications', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Missing notifications usually trace to disabled channels or browser permissions.',
      videoDesc: 'Troubleshooting (60 sec)',
      steps: [
        { title: 'Check channel toggles', text: '', screenshot: 'channel toggles' },
        { title: 'Check browser permissions', text: 'Block setting on the browser side.', screenshot: 'browser permissions' },
        { title: 'Test', text: 'Trigger event and verify.', screenshot: 'test' },
      ],
    }),
  ],
};

export default cm;
