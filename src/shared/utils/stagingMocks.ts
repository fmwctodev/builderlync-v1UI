/**
 * Staging mock fixtures
 *
 * Seed data served to data-driven pages when `isStagingMode()` is true.
 * Without these, modules like Dashboard / Sierra AI / Storm Canvassing /
 * Reporting render correct UI shells but appear empty on staging because
 * there's no real Supabase data.
 *
 * Each `getStaging*()` function returns a mock-shaped payload that callers
 * can substitute for the real API response. They are pure synchronous
 * functions — caller is responsible for any artificial latency or
 * Promise wrapping.
 *
 * Tracked under "Staging mock fixtures" in docs/UX_AUDIT.md.
 */

// ============================================================================
// Dashboard widgets
// ============================================================================

export const STAGING_DASHBOARD_WIDGETS = [
  {
    id: 1,
    widget_key: 'kpi_total_revenue',
    name: 'Total Revenue',
    description: 'Cumulative revenue across all jobs',
    category: 'kpi',
    default_visible: true,
    default_position: 0,
  },
  {
    id: 2,
    widget_key: 'kpi_open_jobs',
    name: 'Open Jobs',
    description: 'Jobs currently in pipeline',
    category: 'kpi',
    default_visible: true,
    default_position: 1,
  },
  {
    id: 3,
    widget_key: 'kpi_active_proposals',
    name: 'Active Proposals',
    description: 'Proposals awaiting customer signature',
    category: 'kpi',
    default_visible: true,
    default_position: 2,
  },
  {
    id: 4,
    widget_key: 'kpi_conversion_rate',
    name: 'Conversion Rate',
    description: 'Quote → signed proposal rate (last 30 days)',
    category: 'kpi',
    default_visible: true,
    default_position: 3,
  },
  {
    id: 5,
    widget_key: 'recent_activity',
    name: 'Recent Activity',
    description: 'Latest team actions across modules',
    category: 'feed',
    default_visible: true,
    default_position: 4,
  },
  {
    id: 6,
    widget_key: 'upcoming_tasks',
    name: 'Upcoming Tasks',
    description: 'Your next 5 tasks across all jobs',
    category: 'feed',
    default_visible: true,
    default_position: 5,
  },
  {
    id: 7,
    widget_key: 'kpi_appointments_today',
    name: 'Appointments Today',
    description: 'Scheduled appointments for today',
    category: 'kpi',
    default_visible: false,
    default_position: 6,
  },
  {
    id: 8,
    widget_key: 'kpi_outstanding_invoices',
    name: 'Outstanding Invoices',
    description: 'Invoices awaiting payment',
    category: 'kpi',
    default_visible: false,
    default_position: 7,
  },
];

export const getStagingDashboardWidgets = () => STAGING_DASHBOARD_WIDGETS;

export const getStagingDashboardPreferences = () =>
  STAGING_DASHBOARD_WIDGETS.filter((w) => w.default_visible).map((w, i) => ({
    widget_key: w.widget_key,
    is_visible: true,
    position: i,
  }));

// Sample widget data the DynamicWidgets component reads from.
// The actual widget components decide what to render given a data shape;
// these fields cover the most common metric/feed widgets.
export const getStagingWidgetData = (widgetKey: string) => {
  switch (widgetKey) {
    case 'kpi_total_revenue':
      return { value: 247_840, change_pct: 12.4, trend: 'up' as const, label: 'YTD' };
    case 'kpi_open_jobs':
      return { value: 38, change_pct: 4.1, trend: 'up' as const, label: 'this week' };
    case 'kpi_active_proposals':
      return { value: 14, change_pct: -8.2, trend: 'down' as const, label: 'awaiting signature' };
    case 'kpi_conversion_rate':
      return { value: 32.6, suffix: '%', change_pct: 2.3, trend: 'up' as const, label: 'last 30 days' };
    case 'kpi_appointments_today':
      return { value: 7, label: 'today' };
    case 'kpi_outstanding_invoices':
      return { value: 18_920, prefix: '$', label: '6 invoices' };
    case 'recent_activity':
      return [
        { id: '1', type: 'proposal_signed', actor: 'Maria Lopez', target: 'Davis Roof Replacement', timestamp: '2026-05-05T14:21:00Z' },
        { id: '2', type: 'job_created', actor: 'Sam Chen', target: 'Henderson Gutters', timestamp: '2026-05-05T13:48:00Z' },
        { id: '3', type: 'invoice_sent', actor: 'Maria Lopez', target: 'Smith Storm Restoration', timestamp: '2026-05-05T11:32:00Z' },
        { id: '4', type: 'appointment_booked', actor: 'Booking widget', target: 'Patel — Inspection', timestamp: '2026-05-05T10:14:00Z' },
        { id: '5', type: 'review_received', actor: 'Google', target: '5 stars from Walker', timestamp: '2026-05-04T22:03:00Z' },
      ];
    case 'upcoming_tasks':
      return [
        { id: 't1', title: 'Follow up with Davis on materials selection', due: '2026-05-06T15:00:00Z', priority: 'high' as const, job: 'Davis Roof Replacement' },
        { id: 't2', title: 'Schedule final inspection — Henderson', due: '2026-05-07T09:00:00Z', priority: 'medium' as const, job: 'Henderson Gutters' },
        { id: 't3', title: 'Send invoice for Smith storm work', due: '2026-05-07T17:00:00Z', priority: 'high' as const, job: 'Smith Storm Restoration' },
        { id: 't4', title: 'Review proposal for Patel', due: '2026-05-08T10:00:00Z', priority: 'medium' as const, job: 'Patel — Inspection' },
        { id: 't5', title: 'Order shingles for Davis (3 squares)', due: '2026-05-08T12:00:00Z', priority: 'low' as const, job: 'Davis Roof Replacement' },
      ];
    default:
      return null;
  }
};

// ============================================================================
// Sierra AI agents — shape matches AIAgent in sierra-ai/services/agentsApi.ts
// ============================================================================

interface StagingAIAgent {
  id: string;
  agent_id: string;
  organization_id: string;
  name: string;
  description: string;
  agent_type: 'voice' | 'chat' | 'email' | 'sms';
  status: 'active' | 'paused' | 'draft';
  voice_id?: string;
  phone_number?: string;
  channels: {
    voice?: { enabled: boolean; configured: boolean };
    sms?: { enabled: boolean; configured: boolean };
    webchat?: { enabled: boolean; configured: boolean };
    email?: { enabled: boolean; configured: boolean };
  };
  knowledge_base_ids?: string[];
  stats: {
    callsHandled?: number;
    messagesHandled?: number;
    appointmentsBooked?: number;
    successRate?: number;
    avgDuration?: number;
  };
  created_at: string;
  updated_at: string;
}

const buildStagingAgent = (orgId: string, partial: Omit<StagingAIAgent, 'organization_id'>): StagingAIAgent => ({
  ...partial,
  organization_id: orgId,
});

export const getStagingSierraAgents = (organizationId: string = '1'): StagingAIAgent[] => [
  buildStagingAgent(organizationId, {
    id: 'agent_demo_inbound',
    agent_id: 'agent_demo_inbound',
    name: 'After-Hours Inbound',
    description: 'Answers calls when the office is closed and books appointments to the next-available slot.',
    agent_type: 'voice',
    status: 'active',
    voice_id: 'en-US-Wavenet-F',
    phone_number: '+1 (555) 010-2031',
    channels: {
      voice: { enabled: true, configured: true },
      sms: { enabled: false, configured: false },
      webchat: { enabled: false, configured: false },
    },
    knowledge_base_ids: ['kb_demo_1', 'kb_demo_2'],
    stats: { callsHandled: 84, appointmentsBooked: 17, successRate: 0.78, avgDuration: 134 },
    created_at: '2026-04-15T10:00:00Z',
    updated_at: '2026-05-05T03:42:00Z',
  }),
  buildStagingAgent(organizationId, {
    id: 'agent_demo_qualifier',
    agent_id: 'agent_demo_qualifier',
    name: 'Lead Qualifier',
    description: 'Pre-qualifies inbound leads before routing to a human estimator. Captures address, project type, timeline, budget.',
    agent_type: 'voice',
    status: 'active',
    voice_id: 'en-US-Wavenet-D',
    phone_number: '+1 (555) 010-3199',
    channels: {
      voice: { enabled: true, configured: true },
      sms: { enabled: false, configured: false },
    },
    knowledge_base_ids: ['kb_demo_3'],
    stats: { callsHandled: 142, appointmentsBooked: 38, successRate: 0.84, avgDuration: 218 },
    created_at: '2026-03-22T14:00:00Z',
    updated_at: '2026-05-05T16:08:00Z',
  }),
  buildStagingAgent(organizationId, {
    id: 'agent_demo_chat',
    agent_id: 'agent_demo_chat',
    name: 'Website Chat Concierge',
    description: 'Embedded chat widget on the marketing site. Answers FAQs and books appointments directly.',
    agent_type: 'chat',
    status: 'active',
    channels: {
      webchat: { enabled: true, configured: true },
    },
    knowledge_base_ids: ['kb_demo_4', 'kb_demo_5'],
    stats: { messagesHandled: 421, appointmentsBooked: 51, successRate: 0.71 },
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-05-05T18:51:00Z',
  }),
  buildStagingAgent(organizationId, {
    id: 'agent_demo_review',
    agent_id: 'agent_demo_review',
    name: 'Review Requestor',
    description: 'Sends post-job review requests via SMS 48 hours after invoice payment.',
    agent_type: 'sms',
    status: 'paused',
    phone_number: '+1 (555) 010-4422',
    channels: {
      sms: { enabled: true, configured: true },
    },
    knowledge_base_ids: [],
    stats: { messagesHandled: 0 },
    created_at: '2026-01-08T11:15:00Z',
    updated_at: '2026-04-28T10:00:00Z',
  }),
];

// ============================================================================
// Storm Canvassing — events, turfs, doors
// Shapes match `StormEvent`, `Turf`, `Door` in storm-canvassing/types/index.ts
// ============================================================================

const ORG_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000001';

export const getStagingStormEvents = (organizationId: string = ORG_ID_PLACEHOLDER) => [
  {
    id: 'storm_demo_active_1',
    organization_id: organizationId,
    provider: 'NOAA' as const,
    external_id: 'NWS-DFW-2026-05-04',
    name: 'NWS Severe Thunderstorm — May 4 Hailstorm',
    description: '1.5"–2.0" hail reported across northern Dallas County. Insurance carriers actively dispatching.',
    event_date: '2026-05-04',
    event_start: '2026-05-04T18:00:00Z',
    event_end: '2026-05-04T22:30:00Z',
    bbox: { minLng: -96.85, minLat: 32.95, maxLng: -96.65, maxLat: 33.20 },
    center_lat: 33.05,
    center_lng: -96.78,
    is_active: true,
    status: 'ACTIVE' as const,
    max_hail_estimate: 2.0,
    confidence_score: 0.91,
    created_at: '2026-05-04T18:30:00Z',
    updated_at: '2026-05-05T08:00:00Z',
  },
  {
    id: 'storm_demo_closed_1',
    organization_id: organizationId,
    provider: 'NOAA' as const,
    external_id: 'NWS-DFW-2026-04-28',
    name: 'Wind Event — April 28 Squall Line',
    description: '60–70 mph wind gusts. Roof and fence damage reported.',
    event_date: '2026-04-28',
    event_start: '2026-04-28T22:00:00Z',
    event_end: '2026-04-29T02:00:00Z',
    bbox: { minLng: -96.78, minLat: 32.92, maxLng: -96.62, maxLat: 33.05 },
    center_lat: 32.98,
    center_lng: -96.70,
    is_active: false,
    status: 'ARCHIVED' as const,
    max_hail_estimate: 0,
    confidence_score: 0.82,
    created_at: '2026-04-28T22:30:00Z',
    updated_at: '2026-04-29T03:00:00Z',
  },
];

export const getStagingStormTurfs = (organizationId: string = ORG_ID_PLACEHOLDER) => [
  {
    id: 'turf_demo_1',
    organization_id: organizationId,
    storm_event_id: 'storm_demo_active_1',
    name: 'Davis Subdivision (Plano)',
    description: 'Affluent subdivision, 1990s-era roofs — high insurance claim probability.',
    geometry: {
      type: 'MultiPolygon' as const,
      coordinates: [
        [
          [
            [-96.6989, 33.0198],
            [-96.6919, 33.0198],
            [-96.6919, 33.0150],
            [-96.6989, 33.0150],
            [-96.6989, 33.0198],
          ],
        ],
      ],
    },
    bbox: { minLng: -96.6989, minLat: 33.0150, maxLng: -96.6919, maxLat: 33.0198 },
    status: 'IN_PROGRESS' as const,
    total_doors: 184,
    visited_doors: 67,
    color: '#DC2626',
    created_at: '2026-05-05T08:00:00Z',
    updated_at: '2026-05-05T14:30:00Z',
    progress: {
      total: 184,
      visited: 67,
      unvisited: 117,
      do_not_knock: 3,
      interested: 12,
      appointment_set: 9,
      completion_pct: 36.4,
    },
  },
  {
    id: 'turf_demo_2',
    organization_id: organizationId,
    storm_event_id: 'storm_demo_active_1',
    name: 'Henderson Estates (Frisco)',
    description: 'Newer construction (2010s) but in the heaviest hail band.',
    geometry: {
      type: 'MultiPolygon' as const,
      coordinates: [
        [
          [
            [-96.8230, 33.1500],
            [-96.8170, 33.1500],
            [-96.8170, 33.1450],
            [-96.8230, 33.1450],
            [-96.8230, 33.1500],
          ],
        ],
      ],
    },
    bbox: { minLng: -96.8230, minLat: 33.1450, maxLng: -96.8170, maxLat: 33.1500 },
    status: 'NOT_STARTED' as const,
    total_doors: 96,
    visited_doors: 0,
    color: '#F59E0B',
    created_at: '2026-05-05T08:30:00Z',
    updated_at: '2026-05-05T08:30:00Z',
    progress: {
      total: 96,
      visited: 0,
      unvisited: 96,
      do_not_knock: 0,
      interested: 0,
      appointment_set: 0,
      completion_pct: 0,
    },
  },
];

export const getStagingStormDoors = (
  organizationId: string = ORG_ID_PLACEHOLDER,
  turfId?: string,
) => {
  const all = [
    // Davis Subdivision (turf_demo_1)
    { id: 'door_d1', turfId: 'turf_demo_1', address1: '1402 Maple Ave', lat: 33.0185, lng: -96.6960, last_outcome: 'INTERESTED' as const, visit_count: 1, last_visit_at: '2026-05-05T13:42:00Z' },
    { id: 'door_d2', turfId: 'turf_demo_1', address1: '1406 Maple Ave', lat: 33.0184, lng: -96.6957, last_outcome: 'NOT_HOME' as const, visit_count: 1, last_visit_at: '2026-05-05T13:45:00Z' },
    { id: 'door_d3', turfId: 'turf_demo_1', address1: '1410 Maple Ave', lat: 33.0183, lng: -96.6954, last_outcome: 'NOT_INTERESTED' as const, visit_count: 1, last_visit_at: '2026-05-05T13:48:00Z' },
    { id: 'door_d4', turfId: 'turf_demo_1', address1: '1414 Maple Ave', lat: 33.0182, lng: -96.6951, last_outcome: 'CALLBACK' as const, visit_count: 1, last_visit_at: '2026-05-05T13:50:00Z' },
    { id: 'door_d5', turfId: 'turf_demo_1', address1: '1418 Maple Ave', lat: 33.0181, lng: -96.6948, last_outcome: 'APPOINTMENT_SET' as const, visit_count: 1, last_visit_at: '2026-05-05T13:54:00Z' },
    { id: 'door_d6', turfId: 'turf_demo_1', address1: '1422 Maple Ave', lat: 33.0180, lng: -96.6945, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
    { id: 'door_d7', turfId: 'turf_demo_1', address1: '1426 Maple Ave', lat: 33.0179, lng: -96.6942, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
    { id: 'door_d8', turfId: 'turf_demo_1', address1: '1430 Maple Ave', lat: 33.0178, lng: -96.6939, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
    // Henderson Estates (turf_demo_2)
    { id: 'door_h1', turfId: 'turf_demo_2', address1: '4502 Birch Ln', lat: 33.1480, lng: -96.8210, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
    { id: 'door_h2', turfId: 'turf_demo_2', address1: '4506 Birch Ln', lat: 33.1479, lng: -96.8207, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
    { id: 'door_h3', turfId: 'turf_demo_2', address1: '4510 Birch Ln', lat: 33.1478, lng: -96.8204, last_outcome: undefined, visit_count: 0, last_visit_at: undefined },
  ];
  const expanded = all.map((d) => ({
    id: d.id,
    organization_id: organizationId,
    turf_id: d.turfId,
    normalized_address: `${d.address1.toLowerCase()}, plano, tx`,
    address1: d.address1,
    city: d.turfId === 'turf_demo_1' ? 'Plano' : 'Frisco',
    state: 'TX',
    zip: d.turfId === 'turf_demo_1' ? '75025' : '75034',
    country: 'US',
    lat: d.lat,
    lng: d.lng,
    last_outcome: d.last_outcome,
    visit_count: d.visit_count,
    is_do_not_knock: false,
    last_visit_at: d.last_visit_at,
    created_at: '2026-05-05T08:00:00Z',
    updated_at: d.last_visit_at ?? '2026-05-05T08:00:00Z',
  }));
  return turfId ? expanded.filter((d) => d.turf_id === turfId) : expanded;
};

// ============================================================================
// Reporting metrics
// ============================================================================

export const getStagingReportingCallMetrics = () => ({
  total_calls: 487,
  answered_calls: 412,
  missed_calls: 75,
  avg_duration_seconds: 184,
  appointments_booked: 96,
  by_day: [
    { date: '2026-04-29', calls: 67, appts: 14 },
    { date: '2026-04-30', calls: 71, appts: 13 },
    { date: '2026-05-01', calls: 58, appts: 11 },
    { date: '2026-05-02', calls: 42, appts: 9 },
    { date: '2026-05-03', calls: 38, appts: 7 },
    { date: '2026-05-04', calls: 89, appts: 19 },
    { date: '2026-05-05', calls: 122, appts: 23 },
  ],
});

export const getStagingReportingAppointmentMetrics = () => ({
  total_scheduled: 142,
  total_completed: 109,
  total_cancelled: 18,
  total_no_show: 15,
  conversion_rate: 76.7,
  avg_lead_to_appt_hours: 22.4,
  by_outcome: [
    { outcome: 'Sold', count: 48, color: '#16A34A' },
    { outcome: 'Pending Decision', count: 31, color: '#F59E0B' },
    { outcome: 'Lost', count: 22, color: '#DC2626' },
    { outcome: 'No Show', count: 15, color: '#6B7280' },
    { outcome: 'Cancelled', count: 18, color: '#9CA3AF' },
  ],
});

export const getStagingReportingAttribution = () => ({
  total_leads: 287,
  by_source: [
    { source: 'Google Ads', leads: 94, cost: 8420, cost_per_lead: 89.57, color: '#3B82F6' },
    { source: 'Meta Ads', leads: 67, cost: 4210, cost_per_lead: 62.84, color: '#1877F2' },
    { source: 'Google Organic', leads: 52, cost: 0, cost_per_lead: 0, color: '#34A853' },
    { source: 'Door Knock', leads: 41, cost: 0, cost_per_lead: 0, color: '#F59E0B' },
    { source: 'Referral', leads: 23, cost: 0, cost_per_lead: 0, color: '#8B5CF6' },
    { source: 'Direct Phone', leads: 10, cost: 0, cost_per_lead: 0, color: '#EC4899' },
  ],
});

export const getStagingReportingGoogleAds = () => ({
  total_spend: 8420,
  total_clicks: 1843,
  total_impressions: 47_281,
  avg_cpc: 4.57,
  ctr: 3.9,
  conversions: 94,
  cost_per_conversion: 89.57,
  by_campaign: [
    { name: 'Roofing — Plano (Search)', spend: 3210, clicks: 712, conversions: 38 },
    { name: 'Storm Restoration (Search)', spend: 2890, clicks: 642, conversions: 31 },
    { name: 'Brand (Search)', spend: 1180, clicks: 287, conversions: 18 },
    { name: 'Display Retargeting', spend: 1140, clicks: 202, conversions: 7 },
  ],
});

export const getStagingReportingMetaAds = () => ({
  total_spend: 4210,
  total_clicks: 2104,
  total_impressions: 198_472,
  avg_cpc: 2.00,
  ctr: 1.06,
  conversions: 67,
  cost_per_conversion: 62.84,
  by_campaign: [
    { name: 'Lead Gen — Roofing Quote', spend: 2490, clicks: 1284, conversions: 41 },
    { name: 'Awareness — Storm Damage', spend: 1140, clicks: 562, conversions: 18 },
    { name: 'Reels — Crew Spotlight', spend: 580, clicks: 258, conversions: 8 },
  ],
});
