import { Activity } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'logs-and-testing',
    name: 'Logs & Testing',
    description: 'Call logs, transcripts, and test tools for Sierra agents.',
    icon: Activity,
    accent: 'bg-fuchsia-100',
    section: 'sierra-ai',
    order: 6,
  },
  articles: [
    walkthrough({
      slug: 'view-call-logs',
      title: 'View call logs',
      summary: 'Every call your agent handled, searchable and filterable.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'logs', 'calls'],
      readMinutes: 3,
      intro: 'Call logs save with the contact and in the agent\'s log.',
      videoDesc: 'Call logs (90 sec)',
      steps: [
        { title: 'Sierra → Logs tab', text: '', screenshot: 'logs tab' },
        { title: 'Filter', text: 'Date, agent, outcome.', screenshot: 'filters' },
        { title: 'Open a call', text: 'Audio player + transcript.', screenshot: 'call detail' },
      ],
    }),
    walkthrough({
      slug: 'transcript-and-summary',
      title: 'Transcripts and summaries',
      summary: 'Every call has a full transcript and AI-generated summary.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'transcripts', 'summary'],
      readMinutes: 3,
      intro: 'Sierra writes a 2-3 sentence summary plus a full transcript for every call.',
      videoDesc: 'Transcripts (90 sec)',
      steps: [
        { title: 'Open a call log', text: '', screenshot: 'call log' },
        { title: 'Read summary', text: 'Top of the panel.', screenshot: 'summary section' },
        { title: 'Full transcript', text: 'Speaker-labeled.', screenshot: 'transcript' },
      ],
    }),
    walkthrough({
      slug: 'test-an-agent-live',
      title: 'Test an agent live',
      summary: 'Call your agent\'s number to test in real conditions.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'test', 'live'],
      readMinutes: 3,
      intro: 'Live testing is the best way to verify behavior before launching.',
      videoDesc: 'Live test (90 sec)',
      steps: [
        { title: 'Pick agent\'s number', text: 'In the Numbers tab.', screenshot: 'agent numbers' },
        { title: 'Call from your phone', text: '', screenshot: 'phone calling' },
        { title: 'Hang up', text: 'Test call appears in logs.', screenshot: 'test call in logs' },
      ],
    }),
    walkthrough({
      slug: 'simulated-call-testing',
      title: 'Simulated call testing',
      summary: 'Run scripted simulations to verify behavior across scenarios.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'test', 'simulator'],
      readMinutes: 4,
      intro: 'The simulator lets you script customer questions and verify the agent\'s responses without real calls.',
      videoDesc: 'Simulator (2 min)',
      steps: [
        { title: 'Sierra → Test tab', text: '', screenshot: 'test tab' },
        { title: 'Build scenarios', text: 'Pre-scripted question/answer pairs.', screenshot: 'scenario editor' },
        { title: 'Run', text: 'Pass/fail per scenario.', screenshot: 'run results' },
      ],
    }),
    walkthrough({
      slug: 'failed-call-troubleshooting',
      title: 'Troubleshoot failed calls',
      summary: 'Why calls dropped, hung up, or escalated unexpectedly.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'troubleshooting'],
      readMinutes: 4,
      intro: 'Failed calls cluster around three causes: prompt issues, voice config, or routing rules.',
      videoDesc: 'Troubleshooting (2 min)',
      steps: [
        { title: 'Filter logs by status = Failed', text: '', screenshot: 'failed filter' },
        { title: 'Open transcript', text: 'Look for prompt confusion or escalation triggers.', screenshot: 'transcript' },
        { title: 'Iterate prompt', text: 'Fix system prompt and re-test.', screenshot: 'prompt iteration' },
      ],
    }),
    walkthrough({
      slug: 'quality-scoring',
      title: 'Call quality scoring',
      summary: 'Sierra rates each call on resolution, sentiment, and accuracy.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'quality', 'scoring'],
      readMinutes: 3,
      intro: 'Auto-scoring helps you find calls that need human review.',
      videoDesc: 'Quality scoring (90 sec)',
      steps: [
        { title: 'Logs → score column', text: '', screenshot: 'score column' },
        { title: 'Sort by score', text: 'Find low-scoring calls.', screenshot: 'sort by score' },
        { title: 'Open and review', text: 'Adjust prompt to fix.', screenshot: 'low score review' },
      ],
    }),
    walkthrough({
      slug: 'export-conversation-data',
      title: 'Export conversation data',
      summary: 'Download CSV of calls, transcripts, and metadata.',
      categorySlug: 'logs-and-testing',
      tags: ['sierra', 'export'],
      readMinutes: 3,
      intro: 'Export for analysis, training, or compliance.',
      videoDesc: 'Export data (90 sec)',
      steps: [
        { title: 'Logs → Filter to date range', text: '', screenshot: 'date filter' },
        { title: 'Click Export', text: 'CSV with metadata + transcripts.', screenshot: 'export button' },
        { title: 'Download', text: '', screenshot: 'download' },
      ],
    }),
  ],
};

export default cm;
