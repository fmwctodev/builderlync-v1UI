import { MessageSquare } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'conversations',
    name: 'Conversations',
    description: 'Unified inbox for SMS, email, and calls.',
    icon: MessageSquare,
    accent: 'bg-indigo-100',
    section: 'workspace',
    order: 6,
  },
  articles: [
    walkthrough({
      slug: 'conversations-inbox',
      title: 'The Conversations inbox',
      summary: 'Unified inbox for every customer touchpoint with assignment and AI replies.',
      categorySlug: 'conversations',
      tags: ['conversations', 'inbox', 'overview'],
      featured: true,
      readMinutes: 4,
      intro: 'Every text, email, and call attached to a contact lands in Conversations. Assign threads, leave internal notes, and let Sierra suggest replies.',
      videoDesc: 'Conversations tour (3 min)',
      steps: [
        { title: 'Open Conversations', text: 'Sidebar → Conversations.', screenshot: 'conversations sidebar' },
        { title: 'Filter by channel', text: 'All, SMS, Email, Calls.', screenshot: 'channel tabs' },
        { title: 'Assign a thread', text: 'Click "Assign" → pick a teammate.', screenshot: 'assign menu' },
        { title: 'Internal note', text: 'Leave a note visible only to your team — not the customer.', screenshot: 'internal note' },
      ],
      related: [
        { categorySlug: 'conversations', articleSlug: 'send-an-sms' },
        { categorySlug: 'conversations', articleSlug: 'send-an-email' },
      ],
    }),
    walkthrough({
      slug: 'send-an-sms',
      title: 'Send an SMS',
      summary: 'Text a contact directly from their profile or the inbox.',
      categorySlug: 'conversations',
      tags: ['sms', 'send'],
      readMinutes: 2,
      intro: 'BuilderLync uses Twilio for SMS. Numbers must be verified and contacts must not have DND set for SMS.',
      videoDesc: 'Send SMS (45 sec)',
      steps: [
        { title: 'Open the contact', text: 'Or open an existing thread.', screenshot: 'contact profile' },
        { title: 'Click SMS tab', text: 'In the message area.', screenshot: 'sms tab' },
        { title: 'Type and send', text: 'Templates and snippets available below the input.', screenshot: 'sms compose' },
      ],
      warnings: ['Contacts with "DND for SMS" cannot receive texts. Honor opt-out keywords (STOP, UNSUBSCRIBE) automatically.'],
      related: [
        { categorySlug: 'settings-phone-setup', articleSlug: 'phone-setup-overview' },
      ],
    }),
    walkthrough({
      slug: 'send-an-email',
      title: 'Send an email',
      summary: 'Email a contact directly from their profile or the inbox.',
      categorySlug: 'conversations',
      tags: ['email', 'send'],
      readMinutes: 2,
      intro: 'Emails go through your connected email service (Gmail, Outlook) or BuilderLync\'s default sender.',
      videoDesc: 'Send email (45 sec)',
      steps: [
        { title: 'Click Email tab', text: 'In the contact or thread.', screenshot: 'email tab' },
        { title: 'Compose', text: 'Subject, body, attachments. Use snippets for reusable templates.', screenshot: 'email compose' },
        { title: 'Send', text: 'The thread saves into Conversations.', screenshot: 'email sent' },
      ],
      related: [
        { categorySlug: 'settings-communications', articleSlug: 'connect-email-service' },
      ],
    }),
    walkthrough({
      slug: 'phone-calls-and-recordings',
      title: 'Phone calls and call recordings',
      summary: 'Make and receive calls; access recordings and transcripts.',
      categorySlug: 'conversations',
      tags: ['calls', 'recordings', 'transcripts'],
      readMinutes: 3,
      intro: 'Inbound and outbound calls log automatically. Recordings (when enabled) save to the contact\'s timeline with a Sierra-generated transcript.',
      videoDesc: 'Calls and recordings (2 min)',
      steps: [
        { title: 'Click the Call icon', text: 'In the contact profile or thread.', screenshot: 'call icon' },
        { title: 'Dialer opens', text: 'Pick the outbound number, dial, talk.', screenshot: 'dialer modal' },
        { title: 'Recording auto-saves', text: 'When call ends, recording + transcript appear in the timeline.', screenshot: 'call timeline entry' },
      ],
      tips: ['Disable recording per-state if state law requires opt-in (Settings → Communications).'],
    }),
    walkthrough({
      slug: 'assign-thread-to-rep',
      title: 'Assign a thread to a rep',
      summary: 'Route a conversation to the right team member with one click.',
      categorySlug: 'conversations',
      tags: ['conversations', 'assign', 'routing'],
      readMinutes: 2,
      intro: 'Threads default to whoever first responds. Reassign to keep accountability clear.',
      videoDesc: 'Assign thread (30 sec)',
      steps: [
        { title: 'Open the thread', text: 'In Conversations.', screenshot: 'thread open' },
        { title: 'Click Assign', text: 'Top-right of the thread.', screenshot: 'assign button' },
        { title: 'Pick teammate', text: 'They get a notification.', screenshot: 'assign picker' },
      ],
    }),
    walkthrough({
      slug: 'internal-notes',
      title: 'Internal notes',
      summary: 'Leave context for teammates that the customer never sees.',
      categorySlug: 'conversations',
      tags: ['conversations', 'notes', 'team'],
      readMinutes: 2,
      intro: 'Internal notes look like messages but are visible only to your team. Use them for context handoffs and reminders.',
      videoDesc: 'Internal notes (30 sec)',
      steps: [
        { title: 'Click "Internal note"', text: 'Tab next to SMS / Email.', screenshot: 'internal note tab' },
        { title: '@-mention a teammate', text: 'They get notified.', screenshot: 'mention dropdown' },
        { title: 'Save', text: 'Note appears in the timeline with a yellow highlight.', screenshot: 'note in timeline' },
      ],
    }),
  ],
};

export default cm;
