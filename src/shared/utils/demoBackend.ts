/**
 * Demo backend — HTTP-layer interception for the iframe-able demo environment.
 *
 * Architecture
 * ============
 *
 * When the app runs in staging mode (bl-v2.netlify.app or VITE_BYPASS_AUTH=1),
 * this module:
 *   1. Installs a custom axios adapter that catches every request before it
 *      hits the network, dispatches to a registry of URL-pattern handlers,
 *      and returns a mocked response.
 *   2. Provides `installDemoFetch()` to similarly wrap window.fetch for code
 *      paths that bypass axios.
 *   3. Exposes `demoStore` — a localStorage-backed CRUD layer wrapping the
 *      seed fixtures from `demoFixtures.ts`. Visitor edits persist within
 *      their browser session; `resetDemoData()` wipes localStorage and
 *      restores the fresh seed.
 *
 * Because almost every service file in the codebase ultimately calls into
 * `apiClient` (axios) or `fetch` (RTK Query, supabase wrapper), wiring at
 * this layer means we don't have to touch hundreds of individual service
 * files to make the demo work.
 *
 * Adding a new mocked endpoint
 * ============================
 * Add a `register(method, urlPattern, handler)` call below. The pattern
 * supports `:param` placeholders. The handler receives `{ params, body,
 * query }` and should return a value (or Promise).
 */

import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isStagingMode } from './stagingAuth';
import {
  DEMO_ORG, DEMO_USER, DEMO_STAFF, DEMO_ROLES, DEMO_CONTACTS,
  DEMO_PIPELINES, DEMO_JOBS, DEMO_CALENDARS, DEMO_CALENDAR_GROUPS,
  DEMO_APPOINTMENTS, DEMO_PROPOSALS, DEMO_PROPOSAL_TEMPLATES,
  DEMO_MEASUREMENTS, DEMO_MATERIAL_ORDERS, DEMO_INVOICES,
  DEMO_TRANSACTIONS, DEMO_OPPORTUNITIES, DEMO_CAMPAIGNS, DEMO_REVIEWS,
  DEMO_ACTIVITY, DEMO_TASKS, DEMO_NOTIFICATIONS, DEMO_TAGS,
  DEMO_CUSTOM_FIELDS,
} from './demoFixtures';

// ============================================================================
// localStorage-backed store
// ============================================================================

const STORE_PREFIX = 'builderlync.demo';
const STORE_KEYS = {
  contacts: `${STORE_PREFIX}.contacts`,
  jobs: `${STORE_PREFIX}.jobs`,
  calendars: `${STORE_PREFIX}.calendars`,
  calendarGroups: `${STORE_PREFIX}.calendarGroups`,
  appointments: `${STORE_PREFIX}.appointments`,
  proposals: `${STORE_PREFIX}.proposals`,
  measurements: `${STORE_PREFIX}.measurements`,
  materialOrders: `${STORE_PREFIX}.materialOrders`,
  invoices: `${STORE_PREFIX}.invoices`,
  transactions: `${STORE_PREFIX}.transactions`,
  opportunities: `${STORE_PREFIX}.opportunities`,
  campaigns: `${STORE_PREFIX}.campaigns`,
  reviews: `${STORE_PREFIX}.reviews`,
  staff: `${STORE_PREFIX}.staff`,
  roles: `${STORE_PREFIX}.roles`,
  pipelines: `${STORE_PREFIX}.pipelines`,
  customFields: `${STORE_PREFIX}.customFields`,
  notifications: `${STORE_PREFIX}.notifications`,
  tasks: `${STORE_PREFIX}.tasks`,
  tags: `${STORE_PREFIX}.tags`,
  org: `${STORE_PREFIX}.org`,
  user: `${STORE_PREFIX}.user`,
} as const;

type StoreKey = keyof typeof STORE_KEYS;

const seedFor: Record<StoreKey, any> = {
  contacts: DEMO_CONTACTS,
  jobs: DEMO_JOBS,
  calendars: DEMO_CALENDARS,
  calendarGroups: DEMO_CALENDAR_GROUPS,
  appointments: DEMO_APPOINTMENTS,
  proposals: DEMO_PROPOSALS,
  measurements: DEMO_MEASUREMENTS,
  materialOrders: DEMO_MATERIAL_ORDERS,
  invoices: DEMO_INVOICES,
  transactions: DEMO_TRANSACTIONS,
  opportunities: DEMO_OPPORTUNITIES,
  campaigns: DEMO_CAMPAIGNS,
  reviews: DEMO_REVIEWS,
  staff: DEMO_STAFF,
  roles: DEMO_ROLES,
  pipelines: DEMO_PIPELINES,
  customFields: DEMO_CUSTOM_FIELDS,
  notifications: DEMO_NOTIFICATIONS,
  tasks: DEMO_TASKS,
  tags: DEMO_TAGS,
  org: DEMO_ORG,
  user: DEMO_USER,
};

const readStore = <T = any>(key: StoreKey): T => {
  if (typeof window === 'undefined') return seedFor[key] as T;
  try {
    const raw = window.localStorage.getItem(STORE_KEYS[key]);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // fallthrough to seed
  }
  return JSON.parse(JSON.stringify(seedFor[key])) as T;
};

const writeStore = <T = any>(key: StoreKey, value: T): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORE_KEYS[key], JSON.stringify(value));
};

const newId = (prefix = 'demo'): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

export const demoStore = {
  list: <T = any>(key: StoreKey): T[] => {
    const v = readStore<any>(key);
    return Array.isArray(v) ? v : ([] as T[]);
  },
  get: <T = any>(key: StoreKey, id: string | number): T | null => {
    const list = demoStore.list<any>(key);
    return list.find((item) => String(item.id) === String(id)) ?? null;
  },
  create: <T = any>(key: StoreKey, data: any, idType: 'numeric' | 'string' = 'string'): T => {
    const list = demoStore.list<any>(key);
    const id =
      idType === 'numeric'
        ? Math.max(0, ...list.map((i: any) => Number(i.id) || 0)) + 1
        : data.id || newId(String(key));
    const created = {
      ...data,
      id,
      created_at: data.created_at || nowIso(),
      updated_at: nowIso(),
    };
    writeStore(key, [created, ...list]);
    return created as T;
  },
  update: <T = any>(key: StoreKey, id: string | number, updates: any): T | null => {
    const list = demoStore.list<any>(key);
    const idx = list.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) return null;
    const updated = { ...list[idx], ...updates, id: list[idx].id, updated_at: nowIso() };
    list[idx] = updated;
    writeStore(key, list);
    return updated as T;
  },
  remove: (key: StoreKey, id: string | number): boolean => {
    const list = demoStore.list<any>(key);
    const next = list.filter((item) => String(item.id) !== String(id));
    if (next.length === list.length) return false;
    writeStore(key, next);
    return true;
  },
  reset: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORE_KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};

export const resetDemoData = () => {
  demoStore.reset();
  // Also blow away ad-hoc demo settings stored elsewhere by features
  if (typeof window !== 'undefined') {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('builderlync.'))
      .forEach((k) => {
        // Don't wipe auth bypass token (would log the visitor out)
        if (k.includes('auth')) return;
        window.localStorage.removeItem(k);
      });
  }
};

// ============================================================================
// URL pattern matching
// ============================================================================

interface HandlerContext {
  params: Record<string, string>;
  body: any;
  query: Record<string, string>;
  url: string;
  method: string;
}

type Handler = (ctx: HandlerContext) => any | Promise<any>;
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Route {
  method: Method;
  pattern: string;
  regex: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

const buildRegex = (pattern: string): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
  // Strip query string from pattern
  const [pathPart] = pattern.split('?');
  const escaped = pathPart
    .replace(/[.*+?^${}()|[\]\\]/g, (m) => (m === ':' ? m : `\\${m}`))
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '([^/?]+)';
    });
  return { regex: new RegExp(`^${escaped}/?$`), paramNames };
};

const register = (method: Method, pattern: string, handler: Handler) => {
  const { regex, paramNames } = buildRegex(pattern);
  routes.push({ method, pattern, regex, paramNames, handler });
};

const matchRoute = (method: string, url: string): { route: Route; params: Record<string, string>; query: Record<string, string> } | null => {
  // Strip leading host + /api prefix variations
  let path = url
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/api/, '')
    .replace(/^\/v\d+/, '');

  // Strip query string
  let queryString = '';
  const qIdx = path.indexOf('?');
  if (qIdx !== -1) {
    queryString = path.slice(qIdx + 1);
    path = path.slice(0, qIdx);
  }
  if (!path.startsWith('/')) path = `/${path}`;

  const query: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => {
      query[k] = v;
    });
  }

  for (const route of routes) {
    if (route.method !== method.toUpperCase()) continue;
    const m = path.match(route.regex);
    if (m) {
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { route, params, query };
    }
  }
  return null;
};

// ============================================================================
// Route handlers — covers the most-traveled API patterns across modules
// ============================================================================

// ---- Org / user / auth -----------------------------------------------------
register('GET', '/profile', () => ({ data: readStore('user') }));
register('GET', '/profile/me', () => ({ data: readStore('user') }));
register('GET', '/profile/organization', () => ({ data: readStore('org') }));
register('GET', '/organizations', () => ({ data: [readStore('org')] }));
register('GET', '/organizations/:id', () => ({ data: readStore('org') }));

// ---- Auth -----------------------------------------------------------------
register('POST', '/auth/login', () => ({ data: { user: readStore('user'), token: 'demo-token' } }));
register('POST', '/auth/refresh', () => ({ data: { token: 'demo-token' } }));
register('POST', '/auth/logout', () => ({ data: { success: true } }));

// ---- Contacts -------------------------------------------------------------
register('GET', '/contacts', ({ query }) => {
  let list = demoStore.list<any>('contacts');
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((c) => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }
  if (query.type && query.type !== 'all') {
    list = list.filter((c) => c.type === query.type);
  }
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 50);
  const start = (page - 1) * limit;
  return { data: { contacts: list.slice(start, start + limit), pagination: { page, limit, total: list.length, totalPages: Math.ceil(list.length / limit) } } };
});
register('GET', '/contacts/:id', ({ params }) => ({ data: demoStore.get('contacts', params.id) }));
register('POST', '/contacts', ({ body }) => ({ data: demoStore.create('contacts', { ...body, full_name: body.full_name || `${body.firstName || body.first_name} ${body.lastName || body.last_name}`.trim() }, 'numeric') }));
register('PUT', '/contacts/:id', ({ params, body }) => ({ data: demoStore.update('contacts', params.id, body) }));
register('PATCH', '/contacts/:id', ({ params, body }) => ({ data: demoStore.update('contacts', params.id, body) }));
register('DELETE', '/contacts/:id', ({ params }) => ({ data: { success: demoStore.remove('contacts', params.id) } }));
register('POST', '/contacts/bulk-delete', ({ body }) => {
  const ids: any[] = body.ids || [];
  ids.forEach((id) => demoStore.remove('contacts', id));
  return { data: { success: true, deleted: ids.length } };
});
register('GET', '/contacts/search', ({ query }) => {
  const q = (query.q || query.search || '').toLowerCase();
  const list = demoStore.list<any>('contacts').filter((c) => c.full_name?.toLowerCase().includes(q));
  return { data: list };
});

// ---- Jobs -----------------------------------------------------------------
register('GET', '/jobs', ({ query }) => {
  let list = demoStore.list<any>('jobs');
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((j) => j.name?.toLowerCase().includes(q) || j.customer?.toLowerCase().includes(q) || j.address?.toLowerCase().includes(q));
  }
  if (query.status && query.status !== 'all') {
    list = list.filter((j) => j.status === query.status || j.workflowStages === query.status);
  }
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 25);
  const start = (page - 1) * limit;
  return { data: { jobs: list.slice(start, start + limit), pagination: { page, limit, total: list.length, totalPages: Math.ceil(list.length / limit) } } };
});
register('GET', '/jobs/:id', ({ params }) => ({ data: demoStore.get('jobs', params.id) }));
register('POST', '/jobs', ({ body }) => ({ data: demoStore.create('jobs', body, 'numeric') }));
register('PUT', '/jobs/:id', ({ params, body }) => ({ data: demoStore.update('jobs', params.id, body) }));
register('PATCH', '/jobs/:id', ({ params, body }) => ({ data: demoStore.update('jobs', params.id, body) }));
register('DELETE', '/jobs/:id', ({ params }) => ({ data: { success: demoStore.remove('jobs', params.id) } }));

// ---- Pipelines / stages ---------------------------------------------------
register('GET', '/pipelines', () => ({ data: demoStore.list('pipelines') }));
register('GET', '/job-pipelines', () => ({ data: demoStore.list('pipelines') }));
register('GET', '/pipelines/:id', ({ params }) => ({ data: demoStore.get('pipelines', params.id) }));
register('POST', '/pipelines', ({ body }) => ({ data: demoStore.create('pipelines', body) }));
register('PUT', '/pipelines/:id', ({ params, body }) => ({ data: demoStore.update('pipelines', params.id, body) }));
register('DELETE', '/pipelines/:id', ({ params }) => ({ data: { success: demoStore.remove('pipelines', params.id) } }));

// ---- Calendars ------------------------------------------------------------
register('GET', '/profile/calendars', () => ({ data: demoStore.list('calendars') }));
register('GET', '/calendars', () => ({ data: demoStore.list('calendars') }));
register('POST', '/profile/calendars', ({ body }) => ({ data: demoStore.create('calendars', body) }));
register('PUT', '/profile/calendars/:id', ({ params, body }) => ({ data: demoStore.update('calendars', params.id, body) }));
register('DELETE', '/profile/calendars/:id', ({ params }) => ({ data: { success: demoStore.remove('calendars', params.id) } }));

register('GET', '/profile/calendar-groups', () => ({ data: demoStore.list('calendarGroups') }));
register('POST', '/profile/calendar-groups', ({ body }) => ({ data: demoStore.create('calendarGroups', body) }));
register('PUT', '/profile/calendar-groups/:id', ({ params, body }) => ({ data: demoStore.update('calendarGroups', params.id, body) }));
register('DELETE', '/profile/calendar-groups/:id', ({ params }) => ({ data: { success: demoStore.remove('calendarGroups', params.id) } }));

// ---- Appointments / events ------------------------------------------------
register('GET', '/profile/appointments', ({ query }) => {
  let list = demoStore.list<any>('appointments');
  if (query.status && query.status !== 'all') list = list.filter((a) => a.status === query.status);
  return { data: list };
});
register('GET', '/events', ({ query }) => {
  let list = demoStore.list<any>('appointments');
  if (query.status && query.status !== 'all') list = list.filter((a) => a.status === query.status);
  return { data: list };
});
register('GET', '/profile/appointments/:id', ({ params }) => ({ data: demoStore.get('appointments', params.id) }));
register('POST', '/profile/appointments', ({ body }) => ({ data: demoStore.create('appointments', body) }));
register('PUT', '/profile/appointments/:id', ({ params, body }) => ({ data: demoStore.update('appointments', params.id, body) }));
register('PATCH', '/profile/appointments/:id', ({ params, body }) => ({ data: demoStore.update('appointments', params.id, body) }));
register('DELETE', '/profile/appointments/:id', ({ params }) => ({ data: { success: demoStore.remove('appointments', params.id) } }));

// ---- Proposals ------------------------------------------------------------
register('GET', '/proposals', () => ({ data: demoStore.list('proposals') }));
register('GET', '/proposals/:id', ({ params }) => ({ data: demoStore.get('proposals', params.id) }));
register('POST', '/proposals', ({ body }) => ({ data: demoStore.create('proposals', body) }));
register('PUT', '/proposals/:id', ({ params, body }) => ({ data: demoStore.update('proposals', params.id, body) }));
register('DELETE', '/proposals/:id', ({ params }) => ({ data: { success: demoStore.remove('proposals', params.id) } }));
register('POST', '/proposals/:id/send', ({ params }) => ({ data: { ...(demoStore.update('proposals', params.id, { status: 'sent', sent_at: nowIso() }) || {}), success: true } }));

register('GET', '/proposals/templates', () => ({ data: DEMO_PROPOSAL_TEMPLATES }));
register('GET', '/proposal-templates', () => ({ data: DEMO_PROPOSAL_TEMPLATES }));

// ---- Measurements ---------------------------------------------------------
register('GET', '/measurements', () => ({ data: demoStore.list('measurements') }));
register('GET', '/measurements/:id', ({ params }) => ({ data: demoStore.get('measurements', params.id) }));
register('POST', '/measurements', ({ body }) => ({ data: demoStore.create('measurements', body) }));

// ---- Material orders (ABC Supply) ----------------------------------------
register('GET', '/abc-supply/orders/history', ({ query }) => {
  let list = demoStore.list<any>('materialOrders');
  if (query.status) list = list.filter((o) => o.orderStatus.toLowerCase() === query.status.toLowerCase());
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q));
  }
  return {
    success: true,
    data: { items: list, pagination: { itemsPerPage: 20, pageNumber: 1, totalPages: 1, totalItems: list.length } },
  };
});
register('GET', '/abc-supply/status', () => ({ data: { connected: true, account: 'BuilderLync Demo - Plano #152' }, connected: true }));
register('GET', '/srs/status', () => ({ data: { connected: true } }));
register('GET', '/qxo/status', () => ({ data: { connected: true, profileData: { accountBranch: { branchNumber: '152', branchName: 'QXO Plano', address: { city: 'Plano', state: 'TX' }, branchPhone: '+1 (972) 555-0152' } } } }));

// ---- Invoices / Estimates / Payments -------------------------------------
register('GET', '/invoices', () => ({ data: demoStore.list('invoices') }));
register('GET', '/invoices/:id', ({ params }) => ({ data: demoStore.get('invoices', params.id) }));
register('POST', '/invoices', ({ body }) => ({ data: demoStore.create('invoices', body) }));
register('PUT', '/invoices/:id', ({ params, body }) => ({ data: demoStore.update('invoices', params.id, body) }));
register('POST', '/invoices/:id/send', ({ params }) => ({ data: { ...(demoStore.update('invoices', params.id, { status: 'sent', issue_date: nowIso() }) || {}), success: true } }));

register('GET', '/transactions', () => ({ data: demoStore.list('transactions') }));

// ---- Opportunities --------------------------------------------------------
register('GET', '/opportunities', () => ({ data: demoStore.list('opportunities') }));
register('GET', '/opportunities/:id', ({ params }) => ({ data: demoStore.get('opportunities', params.id) }));
register('POST', '/opportunities', ({ body }) => ({ data: demoStore.create('opportunities', body) }));
register('PUT', '/opportunities/:id', ({ params, body }) => ({ data: demoStore.update('opportunities', params.id, body) }));
register('PATCH', '/opportunities/:id', ({ params, body }) => ({ data: demoStore.update('opportunities', params.id, body) }));
register('DELETE', '/opportunities/:id', ({ params }) => ({ data: { success: demoStore.remove('opportunities', params.id) } }));

// ---- Marketing / campaigns / forms ---------------------------------------
register('GET', '/campaigns', ({ query }) => {
  let list = demoStore.list<any>('campaigns');
  if (query.type) list = list.filter((c) => c.type === query.type);
  if (query.status) list = list.filter((c) => c.status === query.status);
  return { data: list };
});
register('GET', '/campaigns/:id', ({ params }) => ({ data: demoStore.get('campaigns', params.id) }));
register('POST', '/campaigns', ({ body }) => ({ data: demoStore.create('campaigns', body) }));
register('POST', '/campaigns/:id/send', ({ params }) => ({ data: { ...(demoStore.update('campaigns', params.id, { status: 'sent', sent_at: nowIso() }) || {}), success: true } }));
register('POST', '/campaigns/:id/pause', ({ params }) => ({ data: { ...(demoStore.update('campaigns', params.id, { status: 'paused' }) || {}), success: true } }));
register('POST', '/campaigns/:id/duplicate', ({ params }) => {
  const orig = demoStore.get<any>('campaigns', params.id);
  if (!orig) return { data: null };
  return { data: demoStore.create('campaigns', { ...orig, name: `${orig.name} (copy)`, status: 'draft' }) };
});
register('DELETE', '/campaigns/:id', ({ params }) => ({ data: { success: demoStore.remove('campaigns', params.id) } }));

register('GET', '/forms', () => ({ data: [] }));
register('GET', '/funnels', () => ({ data: [] }));

// ---- Reputation / Reviews -------------------------------------------------
register('GET', '/reviews', () => ({ data: demoStore.list('reviews') }));
register('GET', '/reviews/:id', ({ params }) => ({ data: demoStore.get('reviews', params.id) }));
register('POST', '/reviews/:id/respond', ({ params, body }) => ({
  data: demoStore.update('reviews', params.id, { responded: true, response: body.response, responded_at: nowIso() }),
}));
register('POST', '/reviews/request', ({ body }) => ({ data: { success: true, sent_to: body.contactId || body.contact_id } }));

// ---- Sierra AI / Vapi -----------------------------------------------------
const SIERRA_AGENTS = [
  { id: 'agent_demo_inbound', agent_id: 'agent_demo_inbound', organization_id: DEMO_ORG.id, name: 'After-Hours Inbound', description: 'Answers calls when the office is closed and books appointments to the next-available slot.', agent_type: 'voice', status: 'active', voice_id: 'en-US-Wavenet-F', phone_number: '+1 (555) 010-2031', channels: { voice: { enabled: true, configured: true } }, knowledge_base_ids: ['kb_demo_1', 'kb_demo_2'], stats: { callsHandled: 84, appointmentsBooked: 17, successRate: 0.78, avgDuration: 134 }, created_at: nowIso(), updated_at: nowIso() },
  { id: 'agent_demo_qualifier', agent_id: 'agent_demo_qualifier', organization_id: DEMO_ORG.id, name: 'Lead Qualifier', description: 'Pre-qualifies inbound leads before routing to a human estimator.', agent_type: 'voice', status: 'active', voice_id: 'en-US-Wavenet-D', phone_number: '+1 (555) 010-3199', channels: { voice: { enabled: true, configured: true } }, knowledge_base_ids: ['kb_demo_3'], stats: { callsHandled: 142, appointmentsBooked: 38, successRate: 0.84, avgDuration: 218 }, created_at: nowIso(), updated_at: nowIso() },
  { id: 'agent_demo_chat', agent_id: 'agent_demo_chat', organization_id: DEMO_ORG.id, name: 'Website Chat Concierge', description: 'Embedded chat widget on the marketing site.', agent_type: 'chat', status: 'active', channels: { webchat: { enabled: true, configured: true } }, knowledge_base_ids: ['kb_demo_4', 'kb_demo_5'], stats: { messagesHandled: 421, appointmentsBooked: 51, successRate: 0.71 }, created_at: nowIso(), updated_at: nowIso() },
  { id: 'agent_demo_review', agent_id: 'agent_demo_review', organization_id: DEMO_ORG.id, name: 'Review Requestor', description: 'Sends post-job review requests via SMS 48 hours after invoice payment.', agent_type: 'sms', status: 'paused', phone_number: '+1 (555) 010-4422', channels: { sms: { enabled: true, configured: true } }, knowledge_base_ids: [], stats: { messagesHandled: 0 }, created_at: nowIso(), updated_at: nowIso() },
];
register('GET', '/agents', () => ({ data: SIERRA_AGENTS }));
register('GET', '/agents/:id', ({ params }) => ({ data: SIERRA_AGENTS.find((a) => a.id === params.id) }));
register('GET', '/vapi/agents', () => ({ data: SIERRA_AGENTS }));
register('GET', '/vapi/agents/:id', ({ params }) => ({ data: SIERRA_AGENTS.find((a) => a.id === params.id) }));

// ---- Twilio (call logs for Reporting) -------------------------------------
const DEMO_TWILIO_CALLS = [
  { id: 'call_demo_1', sid: 'call_demo_1', received_at: hoursFromNowDate(-2), startTime: hoursFromNowDate(-2), contact_name: 'Maria Davis', from_number: '+1 (555) 010-3001', to_number: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 218, recording_url: 'https://example.com/recording-demo-1.mp3' },
  { id: 'call_demo_2', sid: 'call_demo_2', received_at: hoursFromNowDate(-3), startTime: hoursFromNowDate(-3), contact_name: 'Tom Henderson', from_number: '+1 (555) 010-3002', to_number: '+1 (555) 010-3199', direction: 'inbound', status: 'completed', duration: 134 },
  { id: 'call_demo_3', sid: 'call_demo_3', received_at: hoursFromNowDate(-5), startTime: hoursFromNowDate(-5), contact_name: 'Unknown', from_number: '+1 (555) 010-9912', to_number: '+1 (555) 010-2031', direction: 'inbound', status: 'no-answer', duration: 0 },
  { id: 'call_demo_4', sid: 'call_demo_4', received_at: hoursFromNowDate(-7), startTime: hoursFromNowDate(-7), contact_name: 'Sam Chen', from_number: '+1 (555) 010-4422', to_number: '+1 (555) 010-3009', direction: 'outbound', status: 'completed', duration: 92 },
  { id: 'call_demo_5', sid: 'call_demo_5', received_at: hoursFromNowDate(-26), startTime: hoursFromNowDate(-26), contact_name: 'Jess Walker', from_number: '+1 (555) 010-3005', to_number: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 412, recording_url: 'https://example.com/recording-demo-2.mp3' },
];
function hoursFromNowDate(n: number) {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
}
register('GET', '/twilio/calls', () => ({ data: DEMO_TWILIO_CALLS }));
register('GET', '/twilio/numbers', () => ({ data: [{ phoneNumber: '+1 (555) 010-2031', friendlyName: 'Main Line', sid: 'PN_DEMO_1' }, { phoneNumber: '+1 (555) 010-3199', friendlyName: 'Lead Qualifier', sid: 'PN_DEMO_2' }] }));

// ---- Storm canvassing -----------------------------------------------------
register('GET', '/storm-events', () => ({ data: [] })); // staging mocks already cover this in stormEventsApi
register('GET', '/turfs', () => ({ data: [] }));
register('GET', '/doors', () => ({ data: [] }));

// ---- QuickBooks integration (mocked as connected) ------------------------
register('GET', '/quickbooks/status', () => ({ data: { connected: true, realmId: 'DEMO-REALM', companyName: DEMO_ORG.name, lastSync: nowIso() } }));
register('GET', '/quickbooks/connection-status', () => ({ data: { connected: true } }));
register('POST', '/quickbooks/sync', () => ({ data: { success: true, synced: 12, lastSync: nowIso() } }));
register('POST', '/quickbooks/disconnect', () => ({ data: { success: true } }));

// ---- Google integrations (Analytics, Ads, Business Profile) --------------
register('GET', '/google-analytics/status', () => ({ data: { connected: true, propertyId: 'DEMO-GA4', accountName: 'BuilderLync Demo' } }));
register('GET', '/google-ads/status', () => ({ data: { connected: true, customerId: '123-456-7890', accountName: 'BuilderLync Demo' } }));
register('GET', '/google-business/status', () => ({ data: { connected: true, locationId: 'DEMO-GBP' } }));
register('GET', '/facebook-ads/status', () => ({ data: { connected: true, adAccountId: 'act_DEMO', accountName: 'BuilderLync Demo' } }));
register('GET', '/tiktok-ads/status', () => ({ data: { connected: false } }));
register('GET', '/eagleview/status', () => ({ data: { connected: true } }));
register('GET', '/eagleview/report', () => ({ success: true, data: { ReportDownloadLink: 'https://example.com/demo-report.pdf' } }));

// ---- Staff / Roles --------------------------------------------------------
register('GET', '/staff', () => ({ data: demoStore.list('staff') }));
register('GET', '/staff/:id', ({ params }) => ({ data: demoStore.get('staff', params.id) }));
register('POST', '/staff', ({ body }) => ({ data: demoStore.create('staff', body, 'numeric') }));
register('PUT', '/staff/:id', ({ params, body }) => ({ data: demoStore.update('staff', params.id, body) }));
register('DELETE', '/staff/:id', ({ params }) => ({ data: { success: demoStore.remove('staff', params.id) } }));

register('GET', '/roles', () => ({ data: demoStore.list('roles') }));
register('POST', '/roles', ({ body }) => ({ data: demoStore.create('roles', body) }));
register('PUT', '/roles/:id', ({ params, body }) => ({ data: demoStore.update('roles', params.id, body) }));
register('DELETE', '/roles/:id', ({ params }) => ({ data: { success: demoStore.remove('roles', params.id) } }));

// ---- Custom fields / Tags / Notifications ---------------------------------
register('GET', '/custom-fields', ({ query }) => {
  let list = demoStore.list<any>('customFields');
  if (query.entity) list = list.filter((cf) => cf.entity === query.entity);
  return { data: list };
});
register('POST', '/custom-fields', ({ body }) => ({ data: demoStore.create('customFields', body) }));
register('PUT', '/custom-fields/:id', ({ params, body }) => ({ data: demoStore.update('customFields', params.id, body) }));
register('DELETE', '/custom-fields/:id', ({ params }) => ({ data: { success: demoStore.remove('customFields', params.id) } }));

register('GET', '/tags', () => ({ data: demoStore.list('tags') }));
register('POST', '/tags', ({ body }) => ({ data: demoStore.create('tags', body) }));

register('GET', '/notifications', () => ({ data: demoStore.list('notifications') }));
register('POST', '/notifications/:id/read', ({ params }) => ({ data: demoStore.update('notifications', params.id, { is_read: true }) }));
register('POST', '/notifications/read-all', () => {
  const list = demoStore.list<any>('notifications').map((n) => ({ ...n, is_read: true }));
  writeStore('notifications', list);
  return { data: { success: true } };
});

// ---- Tasks ----------------------------------------------------------------
register('GET', '/tasks', () => ({ data: demoStore.list('tasks') }));
register('POST', '/tasks', ({ body }) => ({ data: demoStore.create('tasks', body) }));
register('PUT', '/tasks/:id', ({ params, body }) => ({ data: demoStore.update('tasks', params.id, body) }));
register('DELETE', '/tasks/:id', ({ params }) => ({ data: { success: demoStore.remove('tasks', params.id) } }));

// ---- Dashboard widgets / activity ----------------------------------------
register('GET', '/dashboard/widgets', () => ({
  data: [
    { id: 1, widget_key: 'kpi_total_revenue', name: 'Total Revenue', category: 'kpi', default_visible: true, default_position: 0 },
    { id: 2, widget_key: 'kpi_open_jobs', name: 'Open Jobs', category: 'kpi', default_visible: true, default_position: 1 },
    { id: 3, widget_key: 'kpi_active_proposals', name: 'Active Proposals', category: 'kpi', default_visible: true, default_position: 2 },
    { id: 4, widget_key: 'kpi_conversion_rate', name: 'Conversion Rate', category: 'kpi', default_visible: true, default_position: 3 },
    { id: 5, widget_key: 'recent_activity', name: 'Recent Activity', category: 'feed', default_visible: true, default_position: 4 },
    { id: 6, widget_key: 'upcoming_tasks', name: 'Upcoming Tasks', category: 'feed', default_visible: true, default_position: 5 },
  ],
}));
register('GET', '/dashboard/preferences/:userId', () => ({
  data: [
    { widget_key: 'kpi_total_revenue', is_visible: true, position: 0 },
    { widget_key: 'kpi_open_jobs', is_visible: true, position: 1 },
    { widget_key: 'kpi_active_proposals', is_visible: true, position: 2 },
    { widget_key: 'kpi_conversion_rate', is_visible: true, position: 3 },
    { widget_key: 'recent_activity', is_visible: true, position: 4 },
    { widget_key: 'upcoming_tasks', is_visible: true, position: 5 },
  ],
}));
register('POST', '/dashboard/preferences/:userId', () => ({ data: { success: true } }));
register('GET', '/activity', () => ({ data: demoStore.list('notifications').concat(DEMO_ACTIVITY) }));
register('GET', '/activity-feed', () => ({ data: DEMO_ACTIVITY }));

// ---- Support / tickets ----------------------------------------------------
register('GET', '/support/tickets', () => ({ data: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 1 } }));
register('POST', '/support/tickets', ({ body }) => ({ data: { id: newId('ticket'), ticket_number: `TKT-${Math.floor(Math.random() * 10000)}`, ...body, created_at: nowIso() } }));

// ---- Files (File Manager) -------------------------------------------------
register('GET', '/files', () => ({ data: [] }));
register('GET', '/folders', () => ({ data: [] }));
register('GET', '/cloud-drive/connection', () => ({ data: { connected: false } }));

// ---- Workflow templates / Automations ------------------------------------
register('GET', '/workflow-templates', () => ({ data: [] }));
register('GET', '/automations', () => ({ data: [] }));
register('GET', '/workflows', () => ({ data: [] }));

// ============================================================================
// Axios adapter — installs into the central `api` instance
// ============================================================================

export const demoAxiosAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
  return new Promise((resolve, reject) => {
    const method = (config.method || 'get').toUpperCase();
    const url = config.url || '';

    const match = matchRoute(method, url);
    if (!match) {
      // Unmatched route — return a noop empty success so unrelated pages
      // don't crash when calling endpoints we haven't mocked yet. This is
      // the demo-mode equivalent of "show empty state, don't throw".
      const fallback: AxiosResponse = {
        data: { data: Array.isArray(config.data) ? [] : { data: [] }, success: true, message: 'demo-no-route' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      // eslint-disable-next-line no-console
      console.debug('[demo] unmatched route, returning empty success:', method, url);
      // Add a tiny artificial latency so loading states are visible.
      setTimeout(() => resolve(fallback), 80);
      return;
    }

    const body = (() => {
      if (!config.data) return {};
      if (typeof config.data === 'string') {
        try { return JSON.parse(config.data); } catch { return {}; }
      }
      return config.data;
    })();

    const ctx: HandlerContext = {
      params: match.params,
      body,
      query: match.query,
      url,
      method,
    };

    Promise.resolve()
      .then(() => match.route.handler(ctx))
      .then((data) => {
        const response: AxiosResponse = {
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
        // Latency 80-180ms — feels like a real network call without slowing demo
        setTimeout(() => resolve(response), 80 + Math.floor(Math.random() * 100));
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[demo] handler error:', err, 'for', method, url);
        reject(err);
      });
  });
};

// ============================================================================
// fetch() interception — for code paths that bypass axios (RTK Query base
// queries, supabase, raw fetch). Wraps window.fetch so demo handlers
// intercept first, falling through to real fetch on miss.
// ============================================================================

let fetchInstalled = false;

export const installDemoFetch = () => {
  if (fetchInstalled || typeof window === 'undefined') return;
  fetchInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!isStagingMode()) return originalFetch(input, init);

    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    const method = (init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET') || 'GET').toUpperCase();

    const match = matchRoute(method, url);
    if (!match) return originalFetch(input, init);

    const body = (() => {
      const raw = init?.body;
      if (!raw) return {};
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
      }
      return raw as any;
    })();

    const ctx: HandlerContext = { params: match.params, body, query: match.query, url, method };

    try {
      const data = await match.route.handler(ctx);
      // Simulate latency
      await new Promise((r) => setTimeout(r, 80 + Math.floor(Math.random() * 100)));
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[demo fetch] handler error:', err, 'for', method, url);
      return new Response(JSON.stringify({ error: 'demo-handler-error' }), { status: 500 });
    }
  }) as typeof window.fetch;
};

// ============================================================================
// One-shot installer
// ============================================================================

let initialized = false;
export const installDemoBackend = () => {
  if (initialized || !isStagingMode()) return;
  initialized = true;
  installDemoFetch();
};

// Auto-install on module load when staging mode is on
installDemoBackend();
