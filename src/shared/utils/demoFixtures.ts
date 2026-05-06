/**
 * Demo fixtures — rich seed data for the iframe-able demo environment.
 *
 * Used by `demoBackend.ts` to respond to API calls when `isStagingMode()`.
 * Every entity has stable IDs that link cross-module (contact #5 owns
 * job #3 which has proposal #7, etc.) so the demo feels like a coherent
 * customer account, not random data.
 *
 * Shape rules:
 *   - Match the real backend's response shape (camelCase for Express
 *     responses, snake_case for Supabase tables — see comments per entity)
 *   - Use ISO date strings, never raw Date objects
 *   - IDs are simple integers or `demo_<entity>_<n>` strings
 *
 * Visitor edits are layered on top of these fixtures via demoStore.ts —
 * fixtures never change at runtime; localStorage holds the deltas.
 */

// ============================================================================
// Helpers
// ============================================================================

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const hoursFromNow = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
};

// ============================================================================
// Organization + User (the demo "company")
// ============================================================================

export const DEMO_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'BuilderLync Demo',
  slug: 'staging-org',
  logo_url: undefined,
  primary_color: '#dc2626',
  enabled_modules: ['all'],
  subscription_status: 'active',
  subscription_tier: 'enterprise',
  selected_plan: 'enterprise',
  industry: 'Roofing & Restoration',
  email: 'hello@builderlync-demo.com',
  phone: '+1 (555) 010-2000',
  address: '1500 Example Ave',
  city: 'Plano',
  state: 'TX',
  zip: '75025',
  website: 'https://builderlync-demo.com',
  created_at: daysAgo(420),
  updated_at: daysAgo(2),
};

export const DEMO_USER = {
  id: 1,
  firstName: 'Demo',
  lastName: 'Reviewer',
  email: 'demo@builderlync.com',
  companyName: DEMO_ORG.name,
  companySlug: DEMO_ORG.slug,
  organizationId: DEMO_ORG.id,
  organization_id: DEMO_ORG.id,
  createdAt: daysAgo(420),
  updatedAt: daysAgo(2),
  is_beta_user: true,
  user_type: 'staff',
  subscription_status: 'active',
  has_active_subscription: true,
};

// ============================================================================
// Staff (used in assignee dropdowns, sidebar, etc.)
// ============================================================================

export const DEMO_STAFF = [
  { id: 1, first_name: 'Demo', last_name: 'Reviewer', firstName: 'Demo', lastName: 'Reviewer', email: 'demo@builderlync.com', phone: '+1 (555) 010-2000', role: 'admin', user_type: 'staff', avatar_url: null, status: 'active', created_at: daysAgo(420) },
  { id: 2, first_name: 'Maria', last_name: 'Lopez', firstName: 'Maria', lastName: 'Lopez', email: 'maria@builderlync-demo.com', phone: '+1 (555) 010-2010', role: 'estimator', user_type: 'staff', avatar_url: null, status: 'active', created_at: daysAgo(380) },
  { id: 3, first_name: 'Sam', last_name: 'Chen', firstName: 'Sam', lastName: 'Chen', email: 'sam@builderlync-demo.com', phone: '+1 (555) 010-2011', role: 'production_manager', user_type: 'staff', avatar_url: null, status: 'active', created_at: daysAgo(310) },
  { id: 4, first_name: 'Jess', last_name: 'Walker', firstName: 'Jess', lastName: 'Walker', email: 'jess@builderlync-demo.com', phone: '+1 (555) 010-2012', role: 'crew_lead', user_type: 'staff', avatar_url: null, status: 'active', created_at: daysAgo(220) },
  { id: 5, first_name: 'Carla', last_name: 'Ortiz', firstName: 'Carla', lastName: 'Ortiz', email: 'carla@builderlync-demo.com', phone: '+1 (555) 010-2013', role: 'office_admin', user_type: 'staff', avatar_url: null, status: 'active', created_at: daysAgo(190) },
];

export const DEMO_ROLES = [
  { id: 'role_admin', name: 'admin', label: 'Admin', description: 'Full account access', is_default: false, is_system: true, permissions: { all: true } },
  { id: 'role_estimator', name: 'estimator', label: 'Estimator', description: 'Creates proposals & estimates', is_default: false, is_system: true, permissions: { jobs: ['view', 'create'], proposals: ['view', 'create', 'edit', 'send'] } },
  { id: 'role_production_manager', name: 'production_manager', label: 'Production Manager', description: 'Manages job production', is_default: false, is_system: true, permissions: { jobs: ['view', 'edit'], work_orders: ['view', 'create', 'edit'] } },
  { id: 'role_crew_lead', name: 'crew_lead', label: 'Crew Lead', description: 'Leads field crews', is_default: false, is_system: true, permissions: { jobs: ['view'], work_orders: ['view'] } },
  { id: 'role_office_admin', name: 'office_admin', label: 'Office Admin', description: 'Office administration', is_default: true, is_system: true, permissions: { contacts: ['view', 'create', 'edit'], appointments: ['view', 'create', 'edit'] } },
];

// ============================================================================
// Contacts (the demo CRM rolodex — 20 contacts, mix of customers + leads)
// ============================================================================

export const DEMO_CONTACTS = [
  { id: 1, full_name: 'Maria Davis', first_name: 'Maria', last_name: 'Davis', firstName: 'Maria', lastName: 'Davis', email: 'maria.davis@example.com', phone: '+1 (555) 010-3001', phoneType: 'mobile', type: 'customer', company: '', address: '1402 Maple Ave, Plano, TX 75025', latitude: 33.0185, longitude: -96.6960, timezone: 'America/Chicago', tags: ['hailstorm-2026', 'insurance-claim'], created_at: daysAgo(15), updated_at: daysAgo(2) },
  { id: 2, full_name: 'Tom Henderson', first_name: 'Tom', last_name: 'Henderson', firstName: 'Tom', lastName: 'Henderson', email: 'tom.h@example.com', phone: '+1 (555) 010-3002', phoneType: 'mobile', type: 'customer', company: 'Henderson Properties LLC', address: '4502 Birch Ln, Frisco, TX 75034', latitude: 33.1480, longitude: -96.8210, timezone: 'America/Chicago', tags: ['commercial', 'priority'], created_at: daysAgo(22), updated_at: daysAgo(3) },
  { id: 3, full_name: 'Patel Family', first_name: 'Anish', last_name: 'Patel', firstName: 'Anish', lastName: 'Patel', email: 'anish.patel@example.com', phone: '+1 (555) 010-3003', phoneType: 'mobile', type: 'customer', company: '', address: '209 Cedar Ridge Dr, McKinney, TX 75070', latitude: 33.1972, longitude: -96.6398, timezone: 'America/Chicago', tags: ['referral'], created_at: daysAgo(8), updated_at: daysAgo(1) },
  { id: 4, full_name: 'Alex Smith', first_name: 'Alex', last_name: 'Smith', firstName: 'Alex', lastName: 'Smith', email: 'asmith@example.com', phone: '+1 (555) 010-3004', phoneType: 'mobile', type: 'lead', company: '', address: '8821 Pine Hollow, Allen, TX 75013', latitude: 33.1031, longitude: -96.6706, timezone: 'America/Chicago', tags: ['google-ads'], created_at: daysAgo(4), updated_at: daysAgo(4) },
  { id: 5, full_name: 'Jess Walker', first_name: 'Jess', last_name: 'Walker', firstName: 'Jess', lastName: 'Walker', email: 'jw@example.com', phone: '+1 (555) 010-3005', phoneType: 'mobile', type: 'customer', company: '', address: '12 Cottonwood Cir, Plano, TX 75024', latitude: 33.0522, longitude: -96.7461, timezone: 'America/Chicago', tags: ['repeat-customer'], created_at: daysAgo(180), updated_at: daysAgo(11) },
  { id: 6, full_name: 'Carla Ortiz', first_name: 'Carla', last_name: 'Ortiz', firstName: 'Carla', lastName: 'Ortiz', email: 'co@example.com', phone: '+1 (555) 010-3006', phoneType: 'mobile', type: 'lead', company: '', address: '3340 Elm Crossing, Carrollton, TX 75007', latitude: 32.9760, longitude: -96.8866, timezone: 'America/Chicago', tags: [], created_at: daysAgo(6), updated_at: daysAgo(6) },
  { id: 7, full_name: 'Devon Lee', first_name: 'Devon', last_name: 'Lee', firstName: 'Devon', lastName: 'Lee', email: 'dl@example.com', phone: '+1 (555) 010-3007', phoneType: 'mobile', type: 'customer', company: 'Lee Family Trust', address: '716 Magnolia Way, Frisco, TX 75035', latitude: 33.1432, longitude: -96.7969, timezone: 'America/Chicago', tags: ['insurance-claim'], created_at: daysAgo(45), updated_at: daysAgo(7) },
  { id: 8, full_name: 'Renata Kim', first_name: 'Renata', last_name: 'Kim', firstName: 'Renata', lastName: 'Kim', email: 'rk@example.com', phone: '+1 (555) 010-3008', phoneType: 'mobile', type: 'customer', company: '', address: '155 Sycamore St, Richardson, TX 75080', latitude: 32.9483, longitude: -96.7299, timezone: 'America/Chicago', tags: [], created_at: daysAgo(31), updated_at: daysAgo(9) },
  { id: 9, full_name: 'Gabe Ramirez', first_name: 'Gabe', last_name: 'Ramirez', firstName: 'Gabe', lastName: 'Ramirez', email: 'gr@example.com', phone: '+1 (555) 010-3009', phoneType: 'mobile', type: 'customer', company: '', address: '2810 Hickory Trail, Wylie, TX 75098', latitude: 33.0151, longitude: -96.5388, timezone: 'America/Chicago', tags: ['storm-canvassing'], created_at: daysAgo(12), updated_at: daysAgo(5) },
  { id: 10, full_name: 'Ashley Brown', first_name: 'Ashley', last_name: 'Brown', firstName: 'Ashley', lastName: 'Brown', email: 'ab@example.com', phone: '+1 (555) 010-3010', phoneType: 'mobile', type: 'customer', company: '', address: '500 Willow Creek Rd, The Colony, TX 75056', latitude: 33.0890, longitude: -96.8867, timezone: 'America/Chicago', tags: [], created_at: daysAgo(60), updated_at: daysAgo(14) },
  { id: 11, full_name: 'Mike Park', first_name: 'Mike', last_name: 'Park', firstName: 'Mike', lastName: 'Park', email: 'mp@example.com', phone: '+1 (555) 010-3011', phoneType: 'mobile', type: 'lead', company: '', address: '1908 Aspen Glade, Lewisville, TX 75067', latitude: 33.0462, longitude: -96.9942, timezone: 'America/Chicago', tags: ['facebook-ads'], created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 12, full_name: 'Sara Cohen', first_name: 'Sara', last_name: 'Cohen', firstName: 'Sara', lastName: 'Cohen', email: 'sc@example.com', phone: '+1 (555) 010-3012', phoneType: 'mobile', type: 'customer', company: '', address: '3300 Pecan Grove, Flower Mound, TX 75022', latitude: 33.0146, longitude: -97.0972, timezone: 'America/Chicago', tags: ['hailstorm-2026'], created_at: daysAgo(20), updated_at: daysAgo(8) },
  { id: 13, full_name: 'James Reilly', first_name: 'James', last_name: 'Reilly', firstName: 'James', lastName: 'Reilly', email: 'jr@example.com', phone: '+1 (555) 010-3013', phoneType: 'mobile', type: 'customer', company: 'Reilly Restaurants Group', address: '900 Commerce St, Dallas, TX 75201', latitude: 32.7787, longitude: -96.7969, timezone: 'America/Chicago', tags: ['commercial', 'multi-property'], created_at: daysAgo(95), updated_at: daysAgo(20) },
  { id: 14, full_name: 'Priya Singh', first_name: 'Priya', last_name: 'Singh', firstName: 'Priya', lastName: 'Singh', email: 'ps@example.com', phone: '+1 (555) 010-3014', phoneType: 'mobile', type: 'lead', company: '', address: '1212 Birchwood Dr, Coppell, TX 75019', latitude: 32.9546, longitude: -96.9900, timezone: 'America/Chicago', tags: ['referral'], created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 15, full_name: 'Brett Lawson', first_name: 'Brett', last_name: 'Lawson', firstName: 'Brett', lastName: 'Lawson', email: 'bl@example.com', phone: '+1 (555) 010-3015', phoneType: 'mobile', type: 'customer', company: '', address: '6612 Springwood Ln, Garland, TX 75044', latitude: 32.9563, longitude: -96.6388, timezone: 'America/Chicago', tags: [], created_at: daysAgo(50), updated_at: daysAgo(16) },
  { id: 16, full_name: 'Olivia Tran', first_name: 'Olivia', last_name: 'Tran', firstName: 'Olivia', lastName: 'Tran', email: 'ot@example.com', phone: '+1 (555) 010-3016', phoneType: 'mobile', type: 'customer', company: '', address: '4400 Sunflower Ct, Murphy, TX 75094', latitude: 33.0148, longitude: -96.6128, timezone: 'America/Chicago', tags: ['priority'], created_at: daysAgo(40), updated_at: daysAgo(12) },
  { id: 17, full_name: 'Ethan Wood', first_name: 'Ethan', last_name: 'Wood', firstName: 'Ethan', lastName: 'Wood', email: 'ew@example.com', phone: '+1 (555) 010-3017', phoneType: 'mobile', type: 'lead', company: '', address: '88 Highland Park Blvd, Highland Park, TX 75205', latitude: 32.8332, longitude: -96.7942, timezone: 'America/Chicago', tags: ['high-value', 'estate'], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 18, full_name: 'Naomi Carter', first_name: 'Naomi', last_name: 'Carter', firstName: 'Naomi', lastName: 'Carter', email: 'nc@example.com', phone: '+1 (555) 010-3018', phoneType: 'mobile', type: 'customer', company: '', address: '15 Bluebonnet Ln, Prosper, TX 75078', latitude: 33.2362, longitude: -96.8011, timezone: 'America/Chicago', tags: [], created_at: daysAgo(70), updated_at: daysAgo(18) },
  { id: 19, full_name: 'Marcus Bell', first_name: 'Marcus', last_name: 'Bell', firstName: 'Marcus', lastName: 'Bell', email: 'mb@example.com', phone: '+1 (555) 010-3019', phoneType: 'mobile', type: 'customer', company: 'Bell Holdings', address: '2000 Industrial Way, Dallas, TX 75207', latitude: 32.7944, longitude: -96.8290, timezone: 'America/Chicago', tags: ['commercial'], created_at: daysAgo(110), updated_at: daysAgo(25) },
  { id: 20, full_name: 'Tina Murphy', first_name: 'Tina', last_name: 'Murphy', firstName: 'Tina', lastName: 'Murphy', email: 'tm@example.com', phone: '+1 (555) 010-3020', phoneType: 'mobile', type: 'lead', company: '', address: '777 Lakeside Dr, Rockwall, TX 75032', latitude: 32.9301, longitude: -96.4595, timezone: 'America/Chicago', tags: ['google-organic'], created_at: daysAgo(1), updated_at: daysAgo(1) },
];

// ============================================================================
// Pipelines + Stages
// ============================================================================

export const DEMO_PIPELINES = [
  {
    id: 'pipe_residential',
    name: 'Residential Roofing',
    job_type: 'Residential',
    is_default: true,
    stages: [
      { id: 'stage_lead', name: 'Lead', color: '#6B6B73', order: 0 },
      { id: 'stage_booked', name: 'Booked Estimate', color: '#2563A6', order: 1 },
      { id: 'stage_inspected', name: 'Inspected', color: '#7A4FB5', order: 2 },
      { id: 'stage_proposal', name: 'Proposal Sent', color: '#B8791D', order: 3 },
      { id: 'stage_signed', name: 'Signed', color: '#0E8A5F', order: 4 },
      { id: 'stage_production', name: 'Production', color: '#C7541F', order: 5 },
      { id: 'stage_invoiced', name: 'Invoiced', color: '#1F8A8A', order: 6 },
      { id: 'stage_closed', name: 'Closed', color: '#A0A0A8', order: 7 },
    ],
  },
  {
    id: 'pipe_commercial',
    name: 'Commercial Roofing',
    job_type: 'Commercial',
    is_default: false,
    stages: [
      { id: 'stage_c_lead', name: 'Lead', color: '#6B6B73', order: 0 },
      { id: 'stage_c_qualified', name: 'Qualified', color: '#2563A6', order: 1 },
      { id: 'stage_c_proposal', name: 'Proposal', color: '#B8791D', order: 2 },
      { id: 'stage_c_negotiation', name: 'Negotiation', color: '#7A4FB5', order: 3 },
      { id: 'stage_c_signed', name: 'Signed', color: '#0E8A5F', order: 4 },
      { id: 'stage_c_production', name: 'Production', color: '#C7541F', order: 5 },
      { id: 'stage_c_closed', name: 'Closed', color: '#A0A0A8', order: 6 },
    ],
  },
  {
    id: 'pipe_insurance',
    name: 'Insurance Claims',
    job_type: 'Insurance',
    is_default: false,
    stages: [
      { id: 'stage_i_filed', name: 'Claim Filed', color: '#6B6B73', order: 0 },
      { id: 'stage_i_inspection', name: 'Adjuster Inspection', color: '#2563A6', order: 1 },
      { id: 'stage_i_approved', name: 'Approved', color: '#0E8A5F', order: 2 },
      { id: 'stage_i_supplement', name: 'Supplement', color: '#B8791D', order: 3 },
      { id: 'stage_i_production', name: 'Production', color: '#C7541F', order: 4 },
      { id: 'stage_i_closed', name: 'Closed', color: '#A0A0A8', order: 5 },
    ],
  },
];

// ============================================================================
// Jobs (the demo's pipeline view — 24 jobs across stages)
// ============================================================================

const buildJob = (id: number, contactId: number, stage: string, jobValue: number, daysOld: number, customStages?: any) => {
  const contact = DEMO_CONTACTS.find((c) => c.id === contactId)!;
  return {
    id,
    name: `${contact.full_name} — ${stage === 'Closed' ? 'Closed Job' : 'Roof Project'}`,
    customer: contact.full_name,
    customerId: contactId,
    customer_id: contactId,
    contactId: contactId,
    contact_id: contactId,
    customerEmail: contact.email,
    customerPhone: contact.phone,
    address: contact.address,
    latitude: contact.latitude,
    longitude: contact.longitude,
    workflowStages: stage,
    workflow_stages: stage,
    status: stage === 'Closed' ? 'closed' : 'active',
    jobValue: String(jobValue),
    job_value: String(jobValue),
    claimAmount: contact.tags?.includes('insurance-claim') ? Math.round(jobValue * 1.05) : 0,
    claim_amount: contact.tags?.includes('insurance-claim') ? Math.round(jobValue * 1.05) : 0,
    deductible: contact.tags?.includes('insurance-claim') ? 1500 : 0,
    jobPipelineId: contact.tags?.includes('commercial') ? 'pipe_commercial' : 'pipe_residential',
    job_pipeline_id: contact.tags?.includes('commercial') ? 'pipe_commercial' : 'pipe_residential',
    jobStageId: customStages || `stage_${stage.toLowerCase().replace(/\s+/g, '_')}`,
    job_stage_id: customStages || `stage_${stage.toLowerCase().replace(/\s+/g, '_')}`,
    pipelineId: null,
    stageId: null,
    assignedToUserId: [2, 3, 4][id % 3],
    assigned_to_user_id: [2, 3, 4][id % 3],
    editedBy: 1,
    edited_by: 1,
    createdAt: daysAgo(daysOld),
    created_at: daysAgo(daysOld),
    updatedAt: daysAgo(Math.max(0, daysOld - 5)),
    updated_at: daysAgo(Math.max(0, daysOld - 5)),
    materialType: ['Asphalt Shingle', 'Metal Standing Seam', 'Tile'][id % 3],
    squares: 18 + (id % 12),
    pitch: ['4/12', '6/12', '8/12', '10/12'][id % 4],
    notes: '',
  };
};

export const DEMO_JOBS = [
  buildJob(101, 4, 'Lead', 14500, 4),
  buildJob(102, 6, 'Lead', 18200, 6),
  buildJob(103, 11, 'Lead', 11800, 3),
  buildJob(104, 14, 'Lead', 22000, 2),
  buildJob(105, 17, 'Lead', 48000, 5),
  buildJob(106, 20, 'Lead', 17400, 1),
  buildJob(107, 1, 'Booked Estimate', 19800, 14),
  buildJob(108, 7, 'Booked Estimate', 26400, 28),
  buildJob(109, 9, 'Booked Estimate', 21300, 10),
  buildJob(110, 3, 'Inspected', 28100, 8),
  buildJob(111, 8, 'Inspected', 15700, 25),
  buildJob(112, 16, 'Proposal Sent', 32500, 30),
  buildJob(113, 12, 'Proposal Sent', 19400, 18),
  buildJob(114, 13, 'Proposal Sent', 86000, 95),
  buildJob(115, 2, 'Signed', 24700, 18),
  buildJob(116, 5, 'Signed', 21900, 175),
  buildJob(117, 18, 'Production', 33200, 65),
  buildJob(118, 10, 'Production', 17600, 55),
  buildJob(119, 19, 'Production', 124500, 105),
  buildJob(120, 15, 'Invoiced', 19400, 45),
  buildJob(121, 5, 'Closed', 21900, 175),
  buildJob(122, 13, 'Closed', 78000, 200),
  buildJob(123, 19, 'Closed', 96000, 220),
  buildJob(124, 10, 'Closed', 14800, 180),
];

// ============================================================================
// Calendars + Calendar Groups + Appointments
// ============================================================================

export const DEMO_CALENDAR_GROUPS = [
  { id: 'cg_sales', name: 'Sales Team', description: 'Estimators and outside sales', user_id: '1', calendar_count: 3, created_at: daysAgo(120), updated_at: daysAgo(30) },
  { id: 'cg_production', name: 'Production', description: 'Crew leads and PMs', user_id: '1', calendar_count: 2, created_at: daysAgo(90), updated_at: daysAgo(15) },
];

export const DEMO_CALENDARS = [
  { id: 'cal_demo_inspection', name: 'On-Site Inspection', group_id: 'cg_sales', duration: 60, type: 'event', status: 'active', owner_id: '2', description: '60-min on-site inspection', color: '#2563A6', cal_url: 'https://demo.builderlync.com/book/inspection', created_at: daysAgo(120), updated_at: daysAgo(30) },
  { id: 'cal_demo_estimate', name: 'Estimate Walkthrough', group_id: 'cg_sales', duration: 90, type: 'event', status: 'active', owner_id: '2', description: 'In-home estimate review', color: '#B8791D', cal_url: 'https://demo.builderlync.com/book/estimate', created_at: daysAgo(110), updated_at: daysAgo(25) },
  { id: 'cal_demo_final', name: 'Final Walk-through', group_id: 'cg_sales', duration: 30, type: 'event', status: 'active', owner_id: '3', description: 'Post-completion walkthrough', color: '#0E8A5F', cal_url: 'https://demo.builderlync.com/book/final', created_at: daysAgo(80), updated_at: daysAgo(20) },
  { id: 'cal_demo_install', name: 'Installation', group_id: 'cg_production', duration: 480, type: 'round-robin', status: 'active', owner_id: '3', description: 'Full-day install slot', color: '#C7541F', cal_url: null, created_at: daysAgo(70), updated_at: daysAgo(10) },
  { id: 'cal_demo_call', name: 'Discovery Call', group_id: null, duration: 15, type: 'personal', status: 'active', owner_id: '1', description: '15-min phone qualifier', color: '#7A4FB5', cal_url: 'https://demo.builderlync.com/book/call', created_at: daysAgo(50), updated_at: daysAgo(5) },
];

export const DEMO_APPOINTMENTS = [
  { id: 'appt_1', title: 'On-Site Inspection — Davis', contact_id: 1, status: 'upcoming', appointment_time: hoursFromNow(2), end_time: hoursFromNow(3), calendar_id: 'cal_demo_inspection', owner_id: 2, location: '1402 Maple Ave, Plano, TX', notes: 'Bring drone for initial scan', created_at: daysAgo(2), updated_at: daysAgo(1), contacts: { id: 1, full_name: 'Maria Davis', first_name: 'Maria', last_name: 'Davis', email: 'maria.davis@example.com' }, calendars: { name: 'On-Site Inspection', color: '#2563A6' }, staff: { first_name: 'Maria', last_name: 'Lopez' } },
  { id: 'appt_2', title: 'Estimate Walkthrough — Henderson', contact_id: 2, status: 'upcoming', appointment_time: hoursFromNow(26), end_time: hoursFromNow(27.5), calendar_id: 'cal_demo_estimate', owner_id: 2, location: '4502 Birch Ln, Frisco, TX', notes: '', created_at: daysAgo(3), updated_at: daysAgo(1), contacts: { id: 2, full_name: 'Tom Henderson', first_name: 'Tom', last_name: 'Henderson', email: 'tom.h@example.com' }, calendars: { name: 'Estimate Walkthrough', color: '#B8791D' }, staff: { first_name: 'Maria', last_name: 'Lopez' } },
  { id: 'appt_3', title: 'On-Site Inspection — Patel', contact_id: 3, status: 'upcoming', appointment_time: hoursFromNow(50), end_time: hoursFromNow(51), calendar_id: 'cal_demo_inspection', owner_id: 3, location: '209 Cedar Ridge Dr, McKinney, TX', notes: 'Insurance adjuster will be on site at 11am', created_at: daysAgo(4), updated_at: daysAgo(2), contacts: { id: 3, full_name: 'Anish Patel', first_name: 'Anish', last_name: 'Patel', email: 'anish.patel@example.com' }, calendars: { name: 'On-Site Inspection', color: '#2563A6' }, staff: { first_name: 'Sam', last_name: 'Chen' } },
  { id: 'appt_4', title: 'Final Walk-through — Walker', contact_id: 5, status: 'upcoming', appointment_time: hoursFromNow(72), end_time: hoursFromNow(72.5), calendar_id: 'cal_demo_final', owner_id: 3, location: '12 Cottonwood Cir, Plano, TX', notes: 'Punch list review', created_at: daysAgo(7), updated_at: daysAgo(3), contacts: { id: 5, full_name: 'Jess Walker', first_name: 'Jess', last_name: 'Walker', email: 'jw@example.com' }, calendars: { name: 'Final Walk-through', color: '#0E8A5F' }, staff: { first_name: 'Sam', last_name: 'Chen' } },
  { id: 'appt_5', title: 'On-Site Inspection — Smith', contact_id: 4, status: 'upcoming', appointment_time: hoursFromNow(96), end_time: hoursFromNow(97), calendar_id: 'cal_demo_inspection', owner_id: 2, location: '8821 Pine Hollow, Allen, TX', notes: '', created_at: daysAgo(2), updated_at: daysAgo(2), contacts: { id: 4, full_name: 'Alex Smith', first_name: 'Alex', last_name: 'Smith', email: 'asmith@example.com' }, calendars: { name: 'On-Site Inspection', color: '#2563A6' }, staff: { first_name: 'Maria', last_name: 'Lopez' } },
  { id: 'appt_6', title: 'Estimate Walkthrough — Cohen', contact_id: 12, status: 'upcoming', appointment_time: hoursFromNow(120), end_time: hoursFromNow(121.5), calendar_id: 'cal_demo_estimate', owner_id: 2, location: '3300 Pecan Grove, Flower Mound, TX', notes: '', created_at: daysAgo(8), updated_at: daysAgo(4), contacts: { id: 12, full_name: 'Sara Cohen', first_name: 'Sara', last_name: 'Cohen', email: 'sc@example.com' }, calendars: { name: 'Estimate Walkthrough', color: '#B8791D' }, staff: { first_name: 'Maria', last_name: 'Lopez' } },
  { id: 'appt_7', title: 'Installation Day — Tran', contact_id: 16, status: 'upcoming', appointment_time: hoursFromNow(168), end_time: hoursFromNow(176), calendar_id: 'cal_demo_install', owner_id: 4, location: '4400 Sunflower Ct, Murphy, TX', notes: '3-tab tear-off + 30-yr arch', created_at: daysAgo(14), updated_at: daysAgo(7), contacts: { id: 16, full_name: 'Olivia Tran', first_name: 'Olivia', last_name: 'Tran', email: 'ot@example.com' }, calendars: { name: 'Installation', color: '#C7541F' }, staff: { first_name: 'Jess', last_name: 'Walker' } },
  { id: 'appt_8', title: 'Estimate Walkthrough — Ortiz', contact_id: 6, status: 'cancelled', appointment_time: daysAgo(1), end_time: daysAgo(1), calendar_id: 'cal_demo_estimate', owner_id: 2, location: '3340 Elm Crossing, Carrollton, TX', notes: 'Customer rescheduled', created_at: daysAgo(5), updated_at: daysAgo(1), contacts: { id: 6, full_name: 'Carla Ortiz', first_name: 'Carla', last_name: 'Ortiz', email: 'co@example.com' }, calendars: { name: 'Estimate Walkthrough', color: '#B8791D' }, staff: { first_name: 'Maria', last_name: 'Lopez' } },
  { id: 'appt_9', title: 'Final Walk-through — Lee', contact_id: 7, status: 'completed', appointment_time: daysAgo(3), end_time: daysAgo(3), calendar_id: 'cal_demo_final', owner_id: 3, location: '716 Magnolia Way, Frisco, TX', notes: 'Customer approved final invoice', created_at: daysAgo(10), updated_at: daysAgo(3), contacts: { id: 7, full_name: 'Devon Lee', first_name: 'Devon', last_name: 'Lee', email: 'dl@example.com' }, calendars: { name: 'Final Walk-through', color: '#0E8A5F' }, staff: { first_name: 'Sam', last_name: 'Chen' } },
];

// ============================================================================
// Proposals (sample proposal records — list view)
// ============================================================================

export const DEMO_PROPOSALS = [
  { id: 'prop_1', name: 'Davis — Roof Replacement Proposal', customer_name: 'Maria Davis', contact_id: 1, job_id: 107, status: 'sent', total: 19800, created_at: daysAgo(8), updated_at: daysAgo(5), sent_at: daysAgo(5), signed_at: null, address: '1402 Maple Ave, Plano, TX 75025', template_id: 'tpl_residential_full' },
  { id: 'prop_2', name: 'Henderson — Commercial Roof', customer_name: 'Tom Henderson', contact_id: 2, job_id: 115, status: 'signed', total: 24700, created_at: daysAgo(20), updated_at: daysAgo(18), sent_at: daysAgo(20), signed_at: daysAgo(18), address: '4502 Birch Ln, Frisco, TX 75034', template_id: 'tpl_commercial_full' },
  { id: 'prop_3', name: 'Patel — Storm Restoration', customer_name: 'Anish Patel', contact_id: 3, job_id: 110, status: 'draft', total: 28100, created_at: daysAgo(2), updated_at: daysAgo(1), sent_at: null, signed_at: null, address: '209 Cedar Ridge Dr, McKinney, TX 75070', template_id: 'tpl_insurance_full' },
  { id: 'prop_4', name: 'Tran — Roof Replacement', customer_name: 'Olivia Tran', contact_id: 16, job_id: 112, status: 'sent', total: 32500, created_at: daysAgo(10), updated_at: daysAgo(8), sent_at: daysAgo(8), signed_at: null, address: '4400 Sunflower Ct, Murphy, TX 75094', template_id: 'tpl_residential_full' },
  { id: 'prop_5', name: 'Cohen — Hailstorm Replacement', customer_name: 'Sara Cohen', contact_id: 12, job_id: 113, status: 'sent', total: 19400, created_at: daysAgo(6), updated_at: daysAgo(4), sent_at: daysAgo(4), signed_at: null, address: '3300 Pecan Grove, Flower Mound, TX 75022', template_id: 'tpl_insurance_full' },
  { id: 'prop_6', name: 'Reilly — Multi-Property Commercial', customer_name: 'James Reilly', contact_id: 13, job_id: 114, status: 'sent', total: 86000, created_at: daysAgo(40), updated_at: daysAgo(35), sent_at: daysAgo(35), signed_at: null, address: '900 Commerce St, Dallas, TX 75201', template_id: 'tpl_commercial_full' },
  { id: 'prop_7', name: 'Walker — Repeat Customer', customer_name: 'Jess Walker', contact_id: 5, job_id: 116, status: 'signed', total: 21900, created_at: daysAgo(180), updated_at: daysAgo(175), sent_at: daysAgo(180), signed_at: daysAgo(175), address: '12 Cottonwood Cir, Plano, TX 75024', template_id: 'tpl_residential_full' },
  { id: 'prop_8', name: 'Bell — Industrial Building', customer_name: 'Marcus Bell', contact_id: 19, job_id: 119, status: 'signed', total: 124500, created_at: daysAgo(110), updated_at: daysAgo(105), sent_at: daysAgo(110), signed_at: daysAgo(105), address: '2000 Industrial Way, Dallas, TX 75207', template_id: 'tpl_commercial_full' },
];

export const DEMO_PROPOSAL_TEMPLATES = [
  { id: 'tpl_residential_full', name: 'Residential — Full Replacement', summary: { sectionCount: 8, itemCount: 24, coverImage: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop' }, content: { settings: { coverImage: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop' } }, created_at: daysAgo(120), updated_at: daysAgo(40) },
  { id: 'tpl_commercial_full', name: 'Commercial — TPO/EPDM', summary: { sectionCount: 12, itemCount: 38, coverImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop' }, content: { settings: { coverImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop' } }, created_at: daysAgo(200), updated_at: daysAgo(60) },
  { id: 'tpl_insurance_full', name: 'Insurance Claim — Storm Damage', summary: { sectionCount: 10, itemCount: 32, coverImage: 'https://images.unsplash.com/photo-1605283176495-2a08a37b4d44?w=400&h=300&fit=crop' }, content: { settings: { coverImage: 'https://images.unsplash.com/photo-1605283176495-2a08a37b4d44?w=400&h=300&fit=crop' } }, created_at: daysAgo(150), updated_at: daysAgo(30) },
  { id: 'tpl_repair_simple', name: 'Repair — Single Section', summary: { sectionCount: 3, itemCount: 8, coverImage: '' }, content: { settings: { coverImage: '' } }, created_at: daysAgo(100), updated_at: daysAgo(20) },
  { id: 'tpl_metal_roof', name: 'Metal Standing-Seam Roof', summary: { sectionCount: 6, itemCount: 18, coverImage: 'https://images.unsplash.com/photo-1593114604024-12ee9293f5cd?w=400&h=300&fit=crop' }, content: { settings: { coverImage: 'https://images.unsplash.com/photo-1593114604024-12ee9293f5cd?w=400&h=300&fit=crop' } }, created_at: daysAgo(90), updated_at: daysAgo(15) },
];

// ============================================================================
// Measurements (EagleView / BuilderLync reports)
// ============================================================================

export const DEMO_MEASUREMENTS = [
  { id: 'meas_1', address: '1402 Maple Ave, Plano, TX 75025', reference_id: 'BL-2026-001', created_at: daysAgo(8), order_data: { orderReports: { reportAddresses: { latitude: 33.0185, longitude: -96.6960 } } }, response_data: { ReportIds: ['EV-DEMO-001'] }, status: 'completed', squares: 22.4, pitch: '6/12', total_area_sqft: 2240 },
  { id: 'meas_2', address: '4502 Birch Ln, Frisco, TX 75034', reference_id: 'BL-2026-002', created_at: daysAgo(20), order_data: { orderReports: { reportAddresses: { latitude: 33.1480, longitude: -96.8210 } } }, response_data: { ReportIds: ['EV-DEMO-002'] }, status: 'completed', squares: 28.1, pitch: '4/12', total_area_sqft: 2810 },
  { id: 'meas_3', address: '209 Cedar Ridge Dr, McKinney, TX 75070', reference_id: 'BL-2026-003', created_at: daysAgo(2), order_data: { orderReports: { reportAddresses: { latitude: 33.1972, longitude: -96.6398 } } }, response_data: { ReportIds: ['EV-DEMO-003'] }, status: 'completed', squares: 19.8, pitch: '8/12', total_area_sqft: 1980 },
  { id: 'meas_4', address: '4400 Sunflower Ct, Murphy, TX 75094', reference_id: 'BL-2026-004', created_at: daysAgo(10), order_data: { orderReports: { reportAddresses: { latitude: 33.0148, longitude: -96.6128 } } }, response_data: { ReportIds: ['EV-DEMO-004'] }, status: 'completed', squares: 31.2, pitch: '10/12', total_area_sqft: 3120 },
  { id: 'meas_5', address: '900 Commerce St, Dallas, TX 75201', reference_id: 'BL-2026-005', created_at: daysAgo(40), order_data: { orderReports: { reportAddresses: { latitude: 32.7787, longitude: -96.7969 } } }, response_data: { ReportIds: ['EV-DEMO-005'] }, status: 'completed', squares: 84.6, pitch: '0/12', total_area_sqft: 8460 },
];

// ============================================================================
// Material Orders (ABC Supply, SRS, QXO)
// ============================================================================

export const DEMO_MATERIAL_ORDERS = [
  { orderNumber: 'ABC-DEMO-1001', orderStatus: 'Delivered', orderDate: daysAgo(20), invoiceDate: daysAgo(18), branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 28, total: 4820.50, customer_name: 'Maria Davis', job_id: 107, ship_to: JSON.stringify({ address: { city: 'Plano', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1002', orderStatus: 'In Progress', orderDate: daysAgo(8), invoiceDate: daysAgo(7), branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 32, total: 5410.00, customer_name: 'Tom Henderson', job_id: 115, ship_to: JSON.stringify({ address: { city: 'Frisco', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1003', orderStatus: 'Pending', orderDate: daysAgo(2), invoiceDate: null, branch: '152', branchCityState: 'Plano, TX', orderType: 'Rush', productQty: 19, total: 3210.75, customer_name: 'Anish Patel', job_id: 110, ship_to: JSON.stringify({ address: { city: 'McKinney', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1004', orderStatus: 'Delivered', orderDate: daysAgo(35), invoiceDate: daysAgo(33), branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 45, total: 7820.25, customer_name: 'Olivia Tran', job_id: 117, ship_to: JSON.stringify({ address: { city: 'Murphy', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1005', orderStatus: 'Created', orderDate: daysAgo(1), invoiceDate: null, branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 22, total: 3950.00, customer_name: 'Sara Cohen', job_id: 113, ship_to: JSON.stringify({ address: { city: 'Flower Mound', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1006', orderStatus: 'Delivered', orderDate: daysAgo(60), invoiceDate: daysAgo(58), branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 38, total: 6420.50, customer_name: 'Devon Lee', job_id: 118, ship_to: JSON.stringify({ address: { city: 'Frisco', state: 'TX' } }) },
  { orderNumber: 'ABC-DEMO-1007', orderStatus: 'Delivered', orderDate: daysAgo(95), invoiceDate: daysAgo(92), branch: '152', branchCityState: 'Plano, TX', orderType: 'Standard', productQty: 142, total: 24820.00, customer_name: 'Marcus Bell', job_id: 119, ship_to: JSON.stringify({ address: { city: 'Dallas', state: 'TX' } }) },
];

// ============================================================================
// Invoices + Estimates (Payments module)
// ============================================================================

export const DEMO_INVOICES = [
  { id: 'inv_1', invoice_number: 'INV-DEMO-2026-0042', customer_name: 'Marcus Bell', contact_id: 19, job_id: 119, status: 'paid', total: 124500, balance: 0, issue_date: daysAgo(45), due_date: daysAgo(15), paid_date: daysAgo(20), created_at: daysAgo(45), payment_method: 'ACH' },
  { id: 'inv_2', invoice_number: 'INV-DEMO-2026-0058', customer_name: 'Jess Walker', contact_id: 5, job_id: 121, status: 'paid', total: 21900, balance: 0, issue_date: daysAgo(170), due_date: daysAgo(140), paid_date: daysAgo(155), created_at: daysAgo(170), payment_method: 'Credit Card' },
  { id: 'inv_3', invoice_number: 'INV-DEMO-2026-0094', customer_name: 'Olivia Tran', contact_id: 16, job_id: 117, status: 'sent', total: 33200, balance: 33200, issue_date: daysAgo(8), due_date: daysFromNow(22), paid_date: null, created_at: daysAgo(8), payment_method: null },
  { id: 'inv_4', invoice_number: 'INV-DEMO-2026-0102', customer_name: 'Brett Lawson', contact_id: 15, job_id: 120, status: 'sent', total: 19400, balance: 19400, issue_date: daysAgo(4), due_date: daysFromNow(26), paid_date: null, created_at: daysAgo(4), payment_method: null },
  { id: 'inv_5', invoice_number: 'INV-DEMO-2026-0107', customer_name: 'Anish Patel', contact_id: 3, job_id: 110, status: 'draft', total: 28100, balance: 28100, issue_date: null, due_date: null, paid_date: null, created_at: daysAgo(1), payment_method: null },
  { id: 'inv_6', invoice_number: 'INV-DEMO-2026-0033', customer_name: 'Tom Henderson', contact_id: 2, job_id: 115, status: 'overdue', total: 24700, balance: 24700, issue_date: daysAgo(50), due_date: daysAgo(20), paid_date: null, created_at: daysAgo(50), payment_method: null },
];

export const DEMO_TRANSACTIONS = [
  { id: 'txn_1', date: daysAgo(20), type: 'payment', description: 'Payment received — Bell Holdings', amount: 124500, account: 'Operating Checking', status: 'cleared', invoice_id: 'inv_1' },
  { id: 'txn_2', date: daysAgo(155), type: 'payment', description: 'Payment received — Walker', amount: 21900, account: 'Operating Checking', status: 'cleared', invoice_id: 'inv_2' },
  { id: 'txn_3', date: daysAgo(18), type: 'expense', description: 'ABC Supply — Plano #152', amount: -4820.50, account: 'Operating Checking', status: 'cleared', vendor: 'ABC Supply Co.' },
  { id: 'txn_4', date: daysAgo(7), type: 'expense', description: 'ABC Supply — Plano #152', amount: -5410.00, account: 'Operating Checking', status: 'cleared', vendor: 'ABC Supply Co.' },
  { id: 'txn_5', date: daysAgo(33), type: 'expense', description: 'ABC Supply — Plano #152', amount: -7820.25, account: 'Operating Checking', status: 'cleared', vendor: 'ABC Supply Co.' },
  { id: 'txn_6', date: daysAgo(10), type: 'expense', description: 'Google Ads — Roofing Plano', amount: -3210.00, account: 'Marketing Card', status: 'cleared', vendor: 'Google Ads' },
  { id: 'txn_7', date: daysAgo(10), type: 'expense', description: 'Meta Ads — Storm Restoration', amount: -2890.00, account: 'Marketing Card', status: 'cleared', vendor: 'Meta Ads' },
];

// ============================================================================
// Opportunities (sales-pipeline view)
// ============================================================================

export const DEMO_OPPORTUNITIES = DEMO_JOBS.filter((j) => j.status === 'active').map((j, idx) => ({
  id: `opp_${j.id}`,
  name: j.name,
  customer_name: j.customer,
  contact_id: j.contactId,
  pipeline_id: 'default',
  stage_id: j.jobStageId,
  stage_name: j.workflowStages,
  value: Number(j.jobValue),
  expected_close_date: daysFromNow(30 + (idx % 30)),
  assigned_to_user_id: j.assignedToUserId,
  status: 'open',
  source: ['google-ads', 'facebook-ads', 'referral', 'door-knock', 'storm-canvassing'][idx % 5],
  notes: '',
  created_at: j.createdAt,
  updated_at: j.updatedAt,
}));

// ============================================================================
// Marketing — campaigns
// ============================================================================

export const DEMO_CAMPAIGNS = [
  { id: 'camp_1', name: 'Spring Roof Tune-up Promo', type: 'email', status: 'sent', subject: 'Free spring roof check — book before April 15', sent_count: 1842, opened_count: 622, clicked_count: 187, bounced_count: 28, sent_at: daysAgo(45), created_at: daysAgo(50), audience: 'Past customers' },
  { id: 'camp_2', name: 'Hailstorm Follow-up — May 4', type: 'sms', status: 'sent', subject: '', sent_count: 384, opened_count: null, clicked_count: 71, bounced_count: 4, sent_at: daysAgo(2), created_at: daysAgo(2), audience: 'Affected ZIP codes' },
  { id: 'camp_3', name: 'Storm Restoration — Insurance Education', type: 'email', status: 'scheduled', subject: 'What your insurance won\'t tell you about hail damage', sent_count: 0, opened_count: 0, clicked_count: 0, bounced_count: 0, sent_at: null, scheduled_at: daysFromNow(2), created_at: daysAgo(1), audience: 'Recent leads' },
  { id: 'camp_4', name: 'Refer-a-Neighbor', type: 'email', status: 'draft', subject: 'Help your neighbor, earn $250', sent_count: 0, opened_count: 0, clicked_count: 0, bounced_count: 0, sent_at: null, created_at: daysAgo(3), audience: 'Recent customers' },
  { id: 'camp_5', name: 'Winter Pre-Season Inspection', type: 'sms', status: 'sent', subject: '', sent_count: 1024, opened_count: null, clicked_count: 142, bounced_count: 11, sent_at: daysAgo(180), created_at: daysAgo(185), audience: 'All customers' },
];

// ============================================================================
// Reputation — reviews
// ============================================================================

export const DEMO_REVIEWS = [
  { id: 'rev_1', source: 'google', author: 'Maria Davis', rating: 5, content: 'BuilderLync Demo replaced our roof after the May hailstorm. Crew was professional, on schedule, and the office team coordinated everything with our insurance carrier. Highly recommend.', received_at: daysAgo(8), responded: true, response: 'Thank you Maria! Glad we could help after the storm.', responded_at: daysAgo(7), business_response_url: 'https://www.google.com/maps' },
  { id: 'rev_2', source: 'google', author: 'Tom Henderson', rating: 5, content: 'Used them for our office building re-roof. Project came in on budget. The proposal had every line item explained, no surprises.', received_at: daysAgo(20), responded: true, response: 'Appreciate the kind words, Tom. Looking forward to your next project.', responded_at: daysAgo(19), business_response_url: 'https://www.google.com/maps' },
  { id: 'rev_3', source: 'google', author: 'Jess Walker', rating: 5, content: 'Second time using them — repeat for a reason. Sam led the crew and they treated my house like their own.', received_at: daysAgo(170), responded: true, response: 'Always a pleasure, Jess!', responded_at: daysAgo(170), business_response_url: 'https://www.google.com/maps' },
  { id: 'rev_4', source: 'facebook', author: 'Devon Lee', rating: 5, content: 'Did a great job handling our insurance claim. Worth every penny.', received_at: daysAgo(3), responded: false, response: null, responded_at: null, business_response_url: 'https://facebook.com' },
  { id: 'rev_5', source: 'google', author: 'Olivia Tran', rating: 4, content: 'Good work overall, slight delay on materials but they kept us informed. Roof looks great.', received_at: daysAgo(34), responded: true, response: 'Thanks for the patience and the feedback, Olivia.', responded_at: daysAgo(33), business_response_url: 'https://www.google.com/maps' },
  { id: 'rev_6', source: 'google', author: 'Marcus Bell', rating: 5, content: 'Handled our 84-square commercial flat roof. PM communication was top-tier — daily updates with photos.', received_at: daysAgo(105), responded: true, response: 'That\'s exactly the experience we aim to deliver. Thanks Marcus.', responded_at: daysAgo(104), business_response_url: 'https://www.google.com/maps' },
  { id: 'rev_7', source: 'yelp', author: 'Sara Cohen', rating: 5, content: 'Quick response after the hailstorm. They had someone on site the next morning to assess.', received_at: daysAgo(4), responded: false, response: null, responded_at: null, business_response_url: 'https://yelp.com' },
  { id: 'rev_8', source: 'google', author: 'Anish Patel', rating: 5, content: 'Highly recommend if you need someone who knows insurance claims inside-out. They walked us through the entire process.', received_at: daysAgo(2), responded: false, response: null, responded_at: null, business_response_url: 'https://www.google.com/maps' },
];

// ============================================================================
// Activity feed (Dashboard recent activity widget)
// ============================================================================

export const DEMO_ACTIVITY = [
  { id: 'act_1', type: 'proposal_signed', actor: 'Maria Lopez', actor_id: 2, target: 'Henderson — Commercial Roof', target_id: 'prop_2', timestamp: daysAgo(0.05) },
  { id: 'act_2', type: 'job_created', actor: 'Sam Chen', actor_id: 3, target: 'Patel — Storm Restoration', target_id: 110, timestamp: daysAgo(0.1) },
  { id: 'act_3', type: 'invoice_sent', actor: 'Maria Lopez', actor_id: 2, target: 'Tran — Roof Replacement', target_id: 'inv_3', timestamp: daysAgo(0.2) },
  { id: 'act_4', type: 'appointment_booked', actor: 'Booking widget', actor_id: null, target: 'Patel — Inspection Tomorrow 11am', target_id: 'appt_3', timestamp: daysAgo(0.3) },
  { id: 'act_5', type: 'review_received', actor: 'Google', actor_id: null, target: '5 stars from Walker', target_id: 'rev_3', timestamp: daysAgo(0.5) },
  { id: 'act_6', type: 'contact_added', actor: 'Demo Reviewer', actor_id: 1, target: 'Tina Murphy', target_id: 20, timestamp: daysAgo(1) },
  { id: 'act_7', type: 'measurement_completed', actor: 'EagleView', actor_id: null, target: 'Patel — 209 Cedar Ridge', target_id: 'meas_3', timestamp: daysAgo(2) },
];

// ============================================================================
// Tasks (Dashboard upcoming tasks widget)
// ============================================================================

export const DEMO_TASKS = [
  { id: 'task_1', title: 'Follow up with Davis on materials selection', due: hoursFromNow(4), priority: 'high', job: 'Davis — Roof Project', job_id: 107, assigned_to_user_id: 2, status: 'pending' },
  { id: 'task_2', title: 'Schedule final inspection — Henderson', due: hoursFromNow(28), priority: 'medium', job: 'Henderson — Commercial Roof', job_id: 115, assigned_to_user_id: 3, status: 'pending' },
  { id: 'task_3', title: 'Send invoice for Bell completion', due: hoursFromNow(48), priority: 'high', job: 'Bell — Industrial Building', job_id: 119, assigned_to_user_id: 2, status: 'pending' },
  { id: 'task_4', title: 'Review proposal for Patel', due: hoursFromNow(54), priority: 'medium', job: 'Patel — Storm Restoration', job_id: 110, assigned_to_user_id: 2, status: 'pending' },
  { id: 'task_5', title: 'Order shingles for Cohen install', due: hoursFromNow(72), priority: 'low', job: 'Cohen — Hailstorm', job_id: 113, assigned_to_user_id: 3, status: 'pending' },
];

// ============================================================================
// Notifications (TopBar bell)
// ============================================================================

export const DEMO_NOTIFICATIONS = [
  { id: 'notif_1', title: 'New review received', message: 'Anish Patel left a 5-star review on Google', type: 'review', is_read: false, created_at: daysAgo(0.05) },
  { id: 'notif_2', title: 'Proposal signed', message: 'Tom Henderson signed the Commercial Roof proposal', type: 'proposal', is_read: false, created_at: daysAgo(0.05) },
  { id: 'notif_3', title: 'Invoice overdue', message: 'INV-DEMO-2026-0033 to Tom Henderson is 20 days past due', type: 'payment', is_read: false, created_at: daysAgo(20) },
];

// ============================================================================
// Tags (used across contacts + jobs)
// ============================================================================

export const DEMO_TAGS = [
  { id: 'tag_hailstorm', name: 'hailstorm-2026', color: '#DC2626', count: 12 },
  { id: 'tag_insurance', name: 'insurance-claim', color: '#7A4FB5', count: 18 },
  { id: 'tag_commercial', name: 'commercial', color: '#2563A6', count: 8 },
  { id: 'tag_priority', name: 'priority', color: '#B8791D', count: 5 },
  { id: 'tag_referral', name: 'referral', color: '#0E8A5F', count: 14 },
  { id: 'tag_storm', name: 'storm-canvassing', color: '#C7541F', count: 9 },
  { id: 'tag_repeat', name: 'repeat-customer', color: '#1F8A8A', count: 22 },
  { id: 'tag_google', name: 'google-ads', color: '#3B82F6', count: 31 },
  { id: 'tag_facebook', name: 'facebook-ads', color: '#1877F2', count: 18 },
  { id: 'tag_organic', name: 'google-organic', color: '#34A853', count: 11 },
];

// ============================================================================
// Custom fields (Settings → Custom Fields)
// ============================================================================

export const DEMO_CUSTOM_FIELDS = [
  { id: 'cf_1', name: 'Insurance Carrier', entity: 'contact', field_type: 'text', is_required: false, options: null, position: 0, created_at: daysAgo(180) },
  { id: 'cf_2', name: 'Claim Number', entity: 'contact', field_type: 'text', is_required: false, options: null, position: 1, created_at: daysAgo(180) },
  { id: 'cf_3', name: 'Adjuster Contact', entity: 'job', field_type: 'text', is_required: false, options: null, position: 0, created_at: daysAgo(150) },
  { id: 'cf_4', name: 'Lead Source Detail', entity: 'contact', field_type: 'select', is_required: false, options: ['Google Ads', 'Facebook Ads', 'Referral', 'Storm Canvassing', 'Yard Sign', 'Door Knock'], position: 2, created_at: daysAgo(120) },
];
