import { Mail } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-communications',
    name: 'Communications',
    description: 'Email, SMS provider, sender domains, opt-in compliance.',
    icon: Mail,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 7,
  },
  articles: [
    walkthrough({
      slug: 'communications-overview',
      title: 'Communications overview',
      summary: 'How email and SMS sending works.',
      categorySlug: 'settings-communications',
      tags: ['communications', 'overview'],
      readMinutes: 3,
      intro: 'BuilderLync sends through Twilio (SMS), and either Gmail/Outlook OAuth or BuilderLync default sender (email).',
      videoDesc: 'Comms tour (60 sec)',
      steps: [
        { title: 'Settings → Communications', text: '', screenshot: 'comms section' },
        { title: 'Email service', text: 'Connect Gmail/Outlook or use default.', screenshot: 'email service' },
        { title: 'SMS provider', text: 'Twilio.', screenshot: 'sms section' },
      ],
    }),
    walkthrough({
      slug: 'connect-email-service',
      title: 'Connect Gmail or Outlook',
      summary: 'Send emails as your work email instead of a generic sender.',
      categorySlug: 'settings-communications',
      tags: ['email', 'gmail', 'outlook'],
      readMinutes: 3,
      intro: 'Connecting your email service makes outbound mail come from your real address with proper threading.',
      videoDesc: 'Connect email (60 sec)',
      steps: [
        { title: 'Communications → Email', text: '', screenshot: 'email section' },
        { title: 'Pick provider', text: 'Gmail or Outlook.', screenshot: 'provider' },
        { title: 'OAuth', text: '', screenshot: 'oauth' },
      ],
    }),
    walkthrough({
      slug: 'verify-sender-domain',
      title: 'Verify your sender domain',
      summary: 'SPF/DKIM setup so emails reach inboxes (not spam).',
      categorySlug: 'settings-communications',
      tags: ['email', 'spf', 'dkim'],
      readMinutes: 5,
      intro: 'Verifying your sender domain via SPF/DKIM dramatically improves deliverability.',
      videoDesc: 'Verify domain (2 min)',
      steps: [
        { title: 'Communications → Domain', text: '', screenshot: 'domain section' },
        { title: 'Add domain', text: '', screenshot: 'add domain' },
        { title: 'Add DNS records', text: 'SPF + DKIM.', screenshot: 'dns records' },
        { title: 'Verify', text: 'Auto-checks every hour.', screenshot: 'verify status' },
      ],
    }),
    walkthrough({
      slug: 'sms-compliance',
      title: 'SMS compliance and 10DLC',
      summary: 'Register your business with carriers; honor opt-out keywords.',
      categorySlug: 'settings-communications',
      tags: ['sms', 'compliance', '10dlc'],
      readMinutes: 5,
      intro: '10DLC registration is required by US carriers for business SMS. BuilderLync handles registration on your behalf.',
      videoDesc: '10DLC (2 min)',
      steps: [
        { title: 'Communications → SMS', text: '', screenshot: 'sms section' },
        { title: 'Submit registration', text: 'Provide EIN + use case.', screenshot: 'registration form' },
        { title: 'Wait for approval', text: '~3 business days.', screenshot: 'approval' },
      ],
      warnings: ['Unregistered numbers face deliverability throttling. Register before sending volume.'],
    }),
    walkthrough({
      slug: 'communications-troubleshooting',
      title: 'Communications troubleshooting',
      summary: 'When emails go to spam or SMS doesn\'t deliver.',
      categorySlug: 'settings-communications',
      tags: ['communications', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Email-to-spam usually means SPF/DKIM is misconfigured.',
      videoDesc: 'Troubleshooting (60 sec)',
      steps: [
        { title: 'Check SPF/DKIM', text: '', screenshot: 'verify status' },
        { title: 'Check sender reputation', text: 'BuilderLync surfaces bounce rate per domain.', screenshot: 'reputation' },
        { title: 'Check 10DLC status', text: '', screenshot: '10dlc status' },
      ],
    }),
  ],
};

export default cm;
