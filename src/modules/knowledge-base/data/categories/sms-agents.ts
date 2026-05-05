import { MessageCircle } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'sms-agents',
    name: 'SMS Agents',
    description: 'Build Sierra agents that handle text conversations.',
    icon: MessageCircle,
    accent: 'bg-fuchsia-100',
    section: 'sierra-ai',
    order: 2,
  },
  articles: [
    walkthrough({
      slug: 'create-an-sms-agent',
      title: 'Create an SMS agent',
      summary: 'A text-first Sierra agent for high-volume inbound SMS.',
      categorySlug: 'sms-agents',
      tags: ['sierra', 'sms', 'agent', 'create'],
      readMinutes: 5,
      intro: 'SMS agents handle text conversations 24/7 — qualifying leads, booking, answering FAQs.',
      videoDesc: 'Create SMS agent (3 min)',
      steps: [
        { title: 'Sierra → Create Agent → SMS', text: '', screenshot: 'create sms agent' },
        { title: 'System prompt', text: 'Define behavior and brand voice.', screenshot: 'sms prompt' },
        { title: 'Connect number', text: 'SMS-enabled number from Numbers tab.', screenshot: 'number connect' },
        { title: 'Test', text: 'Text the number to test.', screenshot: 'test sms' },
      ],
    }),
    walkthrough({
      slug: 'sms-conversation-flow',
      title: 'SMS conversation flow',
      summary: 'Author the conversation tree the agent follows.',
      categorySlug: 'sms-agents',
      tags: ['sierra', 'sms', 'flow'],
      readMinutes: 5,
      intro: 'Conversation flow is the structured path Sierra takes through an SMS thread.',
      videoDesc: 'Conversation flow (3 min)',
      steps: [
        { title: 'Agent builder → Flow tab', text: '', screenshot: 'flow tab' },
        { title: 'Add nodes', text: 'Question, Branch, Action.', screenshot: 'flow canvas' },
        { title: 'Connect with arrows', text: '', screenshot: 'connections' },
        { title: 'Test in simulator', text: '', screenshot: 'simulator' },
      ],
    }),
    walkthrough({
      slug: 'keyword-triggers',
      title: 'Keyword triggers',
      summary: 'Trigger specific actions when the customer texts certain keywords.',
      categorySlug: 'sms-agents',
      tags: ['sierra', 'sms', 'keywords'],
      readMinutes: 3,
      intro: 'Keyword triggers handle common short replies — STOP, BOOK, CALL — without going through the full conversation.',
      videoDesc: 'Keyword triggers (90 sec)',
      steps: [
        { title: 'Flow → Triggers panel', text: '', screenshot: 'triggers panel' },
        { title: 'Add keyword', text: 'BOOK → "schedule appointment" action.', screenshot: 'add keyword' },
        { title: 'Test', text: '', screenshot: 'test trigger' },
      ],
      warnings: ['STOP / UNSUBSCRIBE keywords are reserved for compliance — do not override.'],
    }),
    walkthrough({
      slug: 'link-to-booking',
      title: 'Link to a booking calendar',
      summary: 'Send the customer a one-tap link to book an appointment.',
      categorySlug: 'sms-agents',
      tags: ['sierra', 'sms', 'booking'],
      readMinutes: 3,
      intro: 'When a customer texts "I want an estimate", Sierra can text back a calendar link.',
      videoDesc: 'Link to booking (90 sec)',
      steps: [
        { title: 'Tools panel → Add booking tool', text: '', screenshot: 'add booking tool' },
        { title: 'Pick calendar', text: 'Default or per-rep.', screenshot: 'calendar picker' },
        { title: 'Customize message', text: '', screenshot: 'message template' },
      ],
    }),
    walkthrough({
      slug: 'sms-agent-logs',
      title: 'View SMS agent logs',
      summary: 'Read every conversation the agent handled.',
      categorySlug: 'sms-agents',
      tags: ['sierra', 'sms', 'logs'],
      readMinutes: 3,
      intro: 'Every SMS thread the agent handled saves with the contact.',
      videoDesc: 'SMS logs (90 sec)',
      steps: [
        { title: 'Sierra → Agent → Logs', text: '', screenshot: 'logs tab' },
        { title: 'Filter by date / status', text: '', screenshot: 'filters' },
        { title: 'Open thread', text: 'Read full conversation.', screenshot: 'thread view' },
      ],
    }),
  ],
};

export default cm;
