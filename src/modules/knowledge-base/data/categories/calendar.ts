import { Calendar } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'calendar',
    name: 'Calendar',
    description: 'Bookings, team scheduling, and appointment automation.',
    icon: Calendar,
    accent: 'bg-blue-100',
    section: 'workspace',
    order: 4,
  },
  articles: [
    walkthrough({
      slug: 'calendar-overview',
      title: 'Calendar overview',
      summary: 'How appointments, calendar groups, and bookable URLs fit together.',
      categorySlug: 'calendar',
      tags: ['calendar', 'overview', 'appointments'],
      readMinutes: 4,
      intro: 'BuilderLync Calendar handles three things: bookable slots customers self-serve, internal team scheduling, and automated SMS/email reminders.',
      videoDesc: 'Calendar tour (3 min)',
      steps: [
        { title: 'Open Calendars', text: 'Sidebar → Calendars.', screenshot: 'calendars sidebar' },
        { title: 'Switch view', text: 'Calendar View, Appointment List View, or Calendar Settings.', screenshot: 'calendar tabs' },
        { title: 'Daily / Weekly / Monthly', text: 'Toggle in Calendar View.', screenshot: 'view type dropdown' },
      ],
      related: [
        { categorySlug: 'calendar', articleSlug: 'book-an-appointment' },
        { categorySlug: 'calendar', articleSlug: 'team-availability' },
      ],
    }),
    walkthrough({
      slug: 'book-an-appointment',
      title: 'Book an appointment',
      summary: 'Create an appointment with a contact, time slot, and team member.',
      categorySlug: 'calendar',
      tags: ['calendar', 'appointment', 'book'],
      readMinutes: 3,
      intro: 'Most appointments in BuilderLync are estimate visits, but the same flow handles internal meetings and customer calls.',
      videoDesc: 'Book an appointment (90 sec)',
      steps: [
        { title: 'Click a time slot', text: 'In Calendar View, click any empty slot.', screenshot: 'click empty slot' },
        { title: 'Pick the contact', text: 'Search existing contacts or create new.', screenshot: 'contact picker' },
        { title: 'Set details', text: 'Title, location (or "video call"), team member.', screenshot: 'appointment details' },
        { title: 'Save', text: 'Customer gets an SMS/email confirmation if you have those reminders enabled.', screenshot: 'appointment saved' },
      ],
      related: [
        { categorySlug: 'calendar', articleSlug: 'team-availability' },
        { categorySlug: 'calendar', articleSlug: 'sync-with-google-or-outlook' },
      ],
    }),
    walkthrough({
      slug: 'team-availability',
      title: 'Manage team availability',
      summary: 'Set business hours, time off, and per-rep availability.',
      categorySlug: 'calendar',
      tags: ['calendar', 'availability', 'team'],
      readMinutes: 4,
      intro: 'Availability rules drive what bookable slots show to customers.',
      videoDesc: 'Team availability (2 min)',
      steps: [
        { title: 'Open Calendar Settings', text: 'Calendars page → Calendar Settings tab.', screenshot: 'calendar settings tab' },
        { title: 'Pick a calendar', text: 'Each calendar has its own rules.', screenshot: 'calendar list' },
        { title: 'Set business hours', text: 'Open hours for each day of the week.', screenshot: 'business hours grid' },
        { title: 'Add time off', text: 'Vacation or training blocks.', screenshot: 'time off section' },
      ],
      related: [
        { categorySlug: 'calendar', articleSlug: 'appointment-types' },
      ],
    }),
    walkthrough({
      slug: 'appointment-types',
      title: 'Configure appointment types',
      summary: 'Set up bookable services with different durations, locations, and forms.',
      categorySlug: 'calendar',
      tags: ['calendar', 'appointment-types', 'services'],
      readMinutes: 4,
      intro: 'An "appointment type" is a bookable service — On-site Estimate (60 min), Phone Consult (15 min), Insurance Adjuster Meeting (30 min).',
      videoDesc: 'Appointment types (2 min)',
      steps: [
        { title: 'Calendar Settings → New', text: 'Click "New Calendar".', screenshot: 'new calendar button' },
        { title: 'Pick a calendar type', text: 'Round-robin, simple, or class booking.', screenshot: 'calendar type picker' },
        { title: 'Set duration + location', text: 'How long and where (in-person, video, phone).', screenshot: 'duration and location' },
        { title: 'Attach intake form', text: 'Optional form the customer fills before the slot is held.', screenshot: 'attach form' },
      ],
      related: [
        { categorySlug: 'forms-and-funnels', articleSlug: 'create-a-lead-form' },
      ],
    }),
    walkthrough({
      slug: 'calendar-settings',
      title: 'Calendar settings',
      summary: 'Notifications, time zones, default views, and embed options.',
      categorySlug: 'calendar',
      tags: ['calendar', 'settings'],
      readMinutes: 3,
      intro: 'Org-wide and per-calendar settings live in Calendar Settings.',
      videoDesc: 'Calendar settings (2 min)',
      steps: [
        { title: 'Time zone', text: 'Default time zone for new calendars.', screenshot: 'timezone dropdown' },
        { title: 'Notification timing', text: 'How long before an appointment to send reminders.', screenshot: 'notification timing' },
        { title: 'Embed code', text: 'Copy the iframe to put a bookable calendar on your website.', screenshot: 'embed code modal' },
      ],
    }),
    walkthrough({
      slug: 'sync-with-google-or-outlook',
      title: 'Sync with Google or Outlook',
      summary: 'Two-way calendar sync so external events block your BuilderLync bookable slots.',
      categorySlug: 'calendar',
      tags: ['calendar', 'sync', 'google', 'outlook'],
      readMinutes: 4,
      intro: 'Sync your work or personal calendar so external events block booking and BuilderLync events show up there.',
      videoDesc: 'Calendar sync (90 sec)',
      steps: [
        { title: 'Settings → Integrations', text: 'Or Calendar Settings → Connect calendar.', screenshot: 'integrations panel' },
        { title: 'Pick provider', text: 'Google or Outlook.', screenshot: 'provider picker' },
        { title: 'Authorize', text: 'OAuth flow, you accept the calendar scope.', screenshot: 'oauth screen' },
        { title: 'Pick calendars', text: 'Choose which to sync — usually your primary work calendar.', screenshot: 'calendar selector' },
      ],
      warnings: ['Sync runs every 5 minutes. There can be a brief delay between an external event and BuilderLync respecting it.'],
      related: [
        { categorySlug: 'settings-integrations', articleSlug: 'integrations-overview' },
      ],
    }),
  ],
};

export default cm;
