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
// Polymorphic empty response — used as the fallback for unmatched routes.
//
// Returns an empty array that ALSO answers .data, .items, .results, .total
// etc. so callers reaching for any common shape get a safe empty value:
//
//   - callers doing `result.filter(...)` get [].filter → works (returns [])
//   - callers doing `result.map(...)` get [].map → works
//   - callers doing `result.length` get 0
//   - callers doing `result.data` get []
//   - callers doing `result.data.filter(...)` get [].filter → works
//   - callers doing `result.items`, `.results`, `.records`, `.rows` → []
//   - callers doing `result.total`, `.totalPages`, `.page`, `.limit` → numbers
//   - callers doing `result.success` → true
//
// Without this, uncovered endpoints would crash any page that does
// `<list>.filter(...)` or `<list>.map(...)` on the response body.
// ============================================================================
const polymorphicEmpty = (): any => {
  const arr: any = [];
  arr.data = [];
  arr.items = [];
  arr.results = [];
  arr.records = [];
  arr.rows = [];
  arr.total = 0;
  arr.totalPages = 1;
  arr.totalItems = 0;
  arr.page = 1;
  arr.limit = 50;
  arr.itemsPerPage = 50;
  arr.pageNumber = 1;
  arr.success = true;
  arr.connected = false;
  arr.message = 'demo-no-route';
  arr.pagination = { page: 1, limit: 50, total: 0, totalPages: 1, itemsPerPage: 50, pageNumber: 1, totalItems: 0 };
  return arr;
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

// ---- Sierra AI primary URL prefix (vapiApi uses /ai-agents/*) -----------
register('GET', '/ai-agents', () => ({ data: SIERRA_AGENTS, success: true }));
register('GET', '/ai-agents/:id', ({ params }) => ({ data: SIERRA_AGENTS.find((a) => a.id === params.id) || SIERRA_AGENTS[0], success: true }));
register('POST', '/ai-agents', ({ body }) => ({
  data: { ...body, id: newId('agent'), agent_id: newId('agent'), organization_id: DEMO_ORG.id, status: 'draft', created_at: nowIso(), updated_at: nowIso(), stats: {} },
  success: true,
}));
register('PATCH', '/ai-agents/:id', ({ params, body }) => {
  const existing = SIERRA_AGENTS.find((a) => a.id === params.id) || SIERRA_AGENTS[0];
  return { data: { ...existing, ...body, id: params.id, updated_at: nowIso() }, success: true };
});
register('PUT', '/ai-agents/:id', ({ params, body }) => {
  const existing = SIERRA_AGENTS.find((a) => a.id === params.id) || SIERRA_AGENTS[0];
  return { data: { ...existing, ...body, id: params.id, updated_at: nowIso() }, success: true };
});
register('DELETE', '/ai-agents/:id', () => ({ data: { success: true }, success: true }));

// Phone numbers (Twilio numbers attached to agents)
const SIERRA_PHONE_NUMBERS = [
  { id: 'pn_demo_1', sid: 'PN_DEMO_1', friendlyName: 'Main Line', phoneNumber: '+1 (555) 010-2031', phone_number: '+1 (555) 010-2031', agent_id: 'agent_demo_inbound', is_assigned: true, capabilities: { voice: true, SMS: true, MMS: true } },
  { id: 'pn_demo_2', sid: 'PN_DEMO_2', friendlyName: 'Lead Qualifier', phoneNumber: '+1 (555) 010-3199', phone_number: '+1 (555) 010-3199', agent_id: 'agent_demo_qualifier', is_assigned: true, capabilities: { voice: true, SMS: true, MMS: false } },
  { id: 'pn_demo_3', sid: 'PN_DEMO_3', friendlyName: 'Review Requestor', phoneNumber: '+1 (555) 010-4422', phone_number: '+1 (555) 010-4422', agent_id: 'agent_demo_review', is_assigned: true, capabilities: { voice: false, SMS: true, MMS: true } },
  { id: 'pn_demo_4', sid: 'PN_DEMO_4', friendlyName: 'Available', phoneNumber: '+1 (555) 010-7720', phone_number: '+1 (555) 010-7720', agent_id: null, is_assigned: false, capabilities: { voice: true, SMS: true, MMS: true } },
];
register('GET', '/ai-agents/phone-numbers', () => ({ data: SIERRA_PHONE_NUMBERS, success: true }));
register('POST', '/ai-agents/phone-numbers', ({ body }) => ({ data: { ...body, id: newId('pn'), sid: `PN_${newId('demo').toUpperCase()}`, is_assigned: false, agent_id: null }, success: true }));
register('POST', '/ai-agents/phone-numbers/assign', ({ body }) => ({ data: { ...body, success: true }, success: true }));
register('POST', '/ai-agents/phone-numbers/unassign', ({ body }) => ({ data: { ...body, success: true }, success: true }));
register('DELETE', '/ai-agents/phone-numbers/:id', () => ({ data: { success: true }, success: true }));

// Voices (ElevenLabs / Vapi voice catalog)
const VAPI_VOICES = [
  { id: 'voice_wavenet_f', voice_id: 'en-US-Wavenet-F', name: 'Aria', gender: 'female', accent: 'US English', language: 'en-US', description: 'Warm, professional. Best for inbound customer-service flows.', sample_url: 'https://example.com/voice-aria.mp3', preview_url: 'https://example.com/voice-aria.mp3' },
  { id: 'voice_wavenet_d', voice_id: 'en-US-Wavenet-D', name: 'Marcus', gender: 'male', accent: 'US English', language: 'en-US', description: 'Confident, sales-tone. Best for lead qualification.', sample_url: 'https://example.com/voice-marcus.mp3', preview_url: 'https://example.com/voice-marcus.mp3' },
  { id: 'voice_wavenet_b', voice_id: 'en-US-Wavenet-B', name: 'Cooper', gender: 'male', accent: 'US English', language: 'en-US', description: 'Friendly, conversational. Good general-purpose voice.', sample_url: 'https://example.com/voice-cooper.mp3', preview_url: 'https://example.com/voice-cooper.mp3' },
  { id: 'voice_wavenet_h', voice_id: 'en-US-Wavenet-H', name: 'Sienna', gender: 'female', accent: 'US English', language: 'en-US', description: 'Energetic, youthful. Best for outbound campaigns.', sample_url: 'https://example.com/voice-sienna.mp3', preview_url: 'https://example.com/voice-sienna.mp3' },
  { id: 'voice_wavenet_a', voice_id: 'en-GB-Wavenet-A', name: 'Olivia', gender: 'female', accent: 'British English', language: 'en-GB', description: 'Polished, British accent. High-end customer-service tone.', sample_url: 'https://example.com/voice-olivia.mp3', preview_url: 'https://example.com/voice-olivia.mp3' },
  { id: 'voice_wavenet_c', voice_id: 'es-US-Wavenet-A', name: 'Sofia', gender: 'female', accent: 'US Spanish', language: 'es-US', description: 'Bilingual Spanish/English. For Hispanic-market customers.', sample_url: 'https://example.com/voice-sofia.mp3', preview_url: 'https://example.com/voice-sofia.mp3' },
];
register('GET', '/vapi/voices', () => ({ data: VAPI_VOICES, success: true }));
register('GET', '/voices', () => ({ data: VAPI_VOICES, success: true }));
register('GET', '/ai-agents/:id/voice', () => ({ data: { voice_id: 'en-US-Wavenet-F', settings: { stability: 0.65, similarity_boost: 0.75, speed: 1.0, pitch: 0 } }, success: true }));

// Knowledge base entries
const SIERRA_KB_ENTRIES = [
  { id: 'kb_demo_1', name: 'BuilderLync — Service Areas', type: 'url', source: 'https://builderlync-demo.com/service-areas', status: 'indexed', tokens: 412, last_synced_at: daysFromNowDate(-2) },
  { id: 'kb_demo_2', name: 'Insurance Claim FAQ', type: 'url', source: 'https://builderlync-demo.com/insurance-faq', status: 'indexed', tokens: 1842, last_synced_at: daysFromNowDate(-3) },
  { id: 'kb_demo_3', name: 'Roofing-Materials-Datasheet.pdf', type: 'file', source: 'roofing-materials-datasheet.pdf', status: 'indexed', tokens: 2104, last_synced_at: daysFromNowDate(-7) },
  { id: 'kb_demo_4', name: 'Pricing-2026.pdf', type: 'file', source: 'pricing-2026.pdf', status: 'indexed', tokens: 884, last_synced_at: daysFromNowDate(-1) },
  { id: 'kb_demo_5', name: 'Crew Schedule API', type: 'url', source: 'https://builderlync-demo.com/api/schedule', status: 'syncing', tokens: 0, last_synced_at: null },
];
register('GET', '/ai-agents/:id/knowledge-base', () => ({ data: SIERRA_KB_ENTRIES, success: true }));
register('GET', '/knowledge-base', () => ({ data: SIERRA_KB_ENTRIES, success: true }));
register('POST', '/ai-agents/:id/knowledge-base/url', ({ body }) => ({ data: { ...body, id: newId('kb'), type: 'url', status: 'syncing', tokens: 0, last_synced_at: null }, success: true }));
register('POST', '/ai-agents/:id/knowledge-base/file', ({ body }) => ({ data: { ...body, id: newId('kb'), type: 'file', status: 'syncing', tokens: 0, last_synced_at: null }, success: true }));
register('DELETE', '/ai-agents/:id/knowledge-base/:kbId', () => ({ data: { success: true }, success: true }));

// Conversations / call history (Sierra AI conversation log)
const SIERRA_CONVERSATIONS = [
  { id: 'conv_demo_1', agent_id: 'agent_demo_inbound', contact_name: 'Maria Davis', contact_phone: '+1 (555) 010-3001', direction: 'inbound', duration: 218, status: 'completed', outcome: 'appointment_booked', started_at: hoursFromNowDate(-2), ended_at: hoursFromNowDate(-1.94), transcript_url: 'https://example.com/transcript-1.txt', recording_url: 'https://example.com/recording-1.mp3', summary: 'Caller asking about hailstorm inspection. Booked Tuesday 10am inspection.' },
  { id: 'conv_demo_2', agent_id: 'agent_demo_qualifier', contact_name: 'Tom Henderson', contact_phone: '+1 (555) 010-3002', direction: 'inbound', duration: 134, status: 'completed', outcome: 'qualified_handoff', started_at: hoursFromNowDate(-3), ended_at: hoursFromNowDate(-2.96), transcript_url: 'https://example.com/transcript-2.txt', recording_url: null, summary: 'Commercial property owner. Qualified — routed to Maria Lopez.' },
  { id: 'conv_demo_3', agent_id: 'agent_demo_inbound', contact_name: 'Unknown', contact_phone: '+1 (555) 010-9912', direction: 'inbound', duration: 0, status: 'missed', outcome: 'no_answer', started_at: hoursFromNowDate(-5), ended_at: hoursFromNowDate(-5), transcript_url: null, recording_url: null, summary: 'No answer — voicemail dropped.' },
  { id: 'conv_demo_4', agent_id: 'agent_demo_chat', contact_name: 'Web Visitor', contact_phone: null, direction: 'inbound', duration: 412, status: 'completed', outcome: 'appointment_booked', started_at: hoursFromNowDate(-26), ended_at: hoursFromNowDate(-25.93), transcript_url: 'https://example.com/transcript-4.txt', recording_url: null, summary: 'Web visitor asking about pricing. Walked through options, booked estimate.' },
  { id: 'conv_demo_5', agent_id: 'agent_demo_qualifier', contact_name: 'Jess Walker', contact_phone: '+1 (555) 010-3005', direction: 'inbound', duration: 305, status: 'completed', outcome: 'appointment_booked', started_at: hoursFromNowDate(-50), ended_at: hoursFromNowDate(-49.92), transcript_url: 'https://example.com/transcript-5.txt', recording_url: 'https://example.com/recording-5.mp3', summary: 'Repeat customer asking about new project. Booked.' },
];
register('GET', '/ai-agents/conversations', ({ query }) => {
  let list = SIERRA_CONVERSATIONS;
  if (query.agent_id) list = list.filter((c) => c.agent_id === query.agent_id);
  if (query.status) list = list.filter((c) => c.status === query.status);
  return { data: list, success: true };
});
register('GET', '/ai-agents/:id/conversations', ({ params }) => ({ data: SIERRA_CONVERSATIONS.filter((c) => c.agent_id === params.id), success: true }));

// Call logs (per-agent call log endpoint)
register('GET', '/ai-agents/call-logs', ({ query }) => {
  const enriched = SIERRA_CONVERSATIONS.map((c) => ({
    id: c.id,
    sid: c.id,
    agent_id: c.agent_id,
    received_at: c.started_at,
    startTime: c.started_at,
    endTime: c.ended_at,
    contact_name: c.contact_name,
    from_number: c.contact_phone,
    direction: c.direction,
    status: c.status === 'missed' ? 'no-answer' : c.status,
    duration: c.duration,
    recording_url: c.recording_url,
  }));
  return { data: query.agent_id ? enriched.filter((c) => c.agent_id === query.agent_id) : enriched, success: true };
});

// Twilio integration check (called by Sierra AI before showing voice flows)
register('GET', '/ai-agents/twilio/check', () => ({ data: { connected: true, accountSid: 'AC_DEMO_TWILIO', friendlyName: 'BuilderLync Demo', balance: '$42.50', balance_currency: 'USD', status: 'active' }, success: true }));

// Client tools (custom function-calling tools for an agent)
register('GET', '/ai-agents/:id/client-tools', () => ({ data: [], success: true }));
register('POST', '/ai-agents/:id/client-tools', ({ body }) => ({ data: { ...body, id: newId('tool'), created_at: nowIso() }, success: true }));
register('PATCH', '/ai-agents/client-tools/:id', ({ params, body }) => ({ data: { id: params.id, ...body, updated_at: nowIso() }, success: true }));
register('DELETE', '/ai-agents/client-tools/:id', () => ({ data: { success: true }, success: true }));

// Recording status toggle
register('PATCH', '/ai-agents/:id/recording-status', ({ params, body }) => ({ data: { id: params.id, recording_enabled: body.recording_enabled ?? true }, success: true }));

// Webchat / widget configuration
register('GET', '/ai-agents/:id/widget', ({ params }) => ({ data: { agent_id: params.id, embed_token: 'demo-embed-token', primary_color: '#E11D2A', greeting: 'Hi there! Need help with your roof?', enabled: true }, success: true }));
register('PUT', '/ai-agents/:id/widget', ({ params, body }) => ({ data: { agent_id: params.id, ...body }, success: true }));

// Scraped websites (for KB ingestion)
register('GET', '/scraped-websites', () => ({ data: [{ id: 'site_1', url: 'https://builderlync-demo.com', title: 'BuilderLync Demo', last_crawled_at: daysFromNowDate(-1), pages_indexed: 24, status: 'indexed' }], success: true }));
register('POST', '/scraped-websites', ({ body }) => ({ data: { ...body, id: newId('site'), status: 'crawling', last_crawled_at: null, pages_indexed: 0 }, success: true }));

// ---- Job Cam --------------------------------------------------------------
const DEMO_JOBCAM_MEDIA = [
  { id: 'media_1', url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800', thumbnail: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'davis-front-elevation.jpg', size_bytes: 2_140_000, job_id: 107, contact_id: 1, uploaded_by_user_id: 4, uploaded_by_name: 'Jess Walker', tag: 'before', notes: 'Front elevation showing hail damage to ridge cap', latitude: 33.0185, longitude: -96.6960, captured_at: daysFromNowDate(-3), created_at: daysFromNowDate(-3) },
  { id: 'media_2', url: 'https://images.unsplash.com/photo-1605283176495-2a08a37b4d44?w=800', thumbnail: 'https://images.unsplash.com/photo-1605283176495-2a08a37b4d44?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'davis-rear-slope.jpg', size_bytes: 1_980_000, job_id: 107, contact_id: 1, uploaded_by_user_id: 4, uploaded_by_name: 'Jess Walker', tag: 'before', notes: 'Rear slope — visible granule loss', latitude: 33.0185, longitude: -96.6960, captured_at: daysFromNowDate(-3), created_at: daysFromNowDate(-3) },
  { id: 'media_3', url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', thumbnail: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'henderson-flat-roof-overview.jpg', size_bytes: 3_240_000, job_id: 115, contact_id: 2, uploaded_by_user_id: 3, uploaded_by_name: 'Sam Chen', tag: 'before', notes: 'Commercial flat roof overview — TPO replacement candidate', latitude: 33.1480, longitude: -96.8210, captured_at: daysFromNowDate(-12), created_at: daysFromNowDate(-12) },
  { id: 'media_4', url: 'https://images.unsplash.com/photo-1593114604024-12ee9293f5cd?w=800', thumbnail: 'https://images.unsplash.com/photo-1593114604024-12ee9293f5cd?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'tran-completed-install.jpg', size_bytes: 2_890_000, job_id: 117, contact_id: 16, uploaded_by_user_id: 4, uploaded_by_name: 'Jess Walker', tag: 'after', notes: 'Completed install — 30-yr architectural shingle', latitude: 33.0148, longitude: -96.6128, captured_at: daysFromNowDate(-2), created_at: daysFromNowDate(-2) },
  { id: 'media_5', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'bell-flashing-detail.jpg', size_bytes: 1_640_000, job_id: 119, contact_id: 19, uploaded_by_user_id: 3, uploaded_by_name: 'Sam Chen', tag: 'progress', notes: 'Step flashing at chimney — properly woven', latitude: 32.7944, longitude: -96.8290, captured_at: daysFromNowDate(-30), created_at: daysFromNowDate(-30) },
  { id: 'media_6', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'patel-drone-overview.jpg', size_bytes: 4_120_000, job_id: 110, contact_id: 3, uploaded_by_user_id: 2, uploaded_by_name: 'Maria Lopez', tag: 'before', notes: 'Drone overview — multi-layer tear-off needed', latitude: 33.1972, longitude: -96.6398, captured_at: daysFromNowDate(-7), created_at: daysFromNowDate(-7) },
  { id: 'media_7', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'walker-final-walkthrough.jpg', size_bytes: 2_410_000, job_id: 121, contact_id: 5, uploaded_by_user_id: 3, uploaded_by_name: 'Sam Chen', tag: 'after', notes: 'Final walkthrough — punch list complete', latitude: 33.0522, longitude: -96.7461, captured_at: daysFromNowDate(-150), created_at: daysFromNowDate(-150) },
  { id: 'media_8', url: 'https://images.unsplash.com/photo-1572931089-09a36b748f63?w=800', thumbnail: 'https://images.unsplash.com/photo-1572931089-09a36b748f63?w=200', type: 'image', mime_type: 'image/jpeg', filename: 'cohen-hailstone-evidence.jpg', size_bytes: 1_280_000, job_id: 113, contact_id: 12, uploaded_by_user_id: 2, uploaded_by_name: 'Maria Lopez', tag: 'evidence', notes: '1.75" hailstone — for insurance claim documentation', latitude: 33.0146, longitude: -97.0972, captured_at: daysFromNowDate(-2), created_at: daysFromNowDate(-2) },
];
register('GET', '/job-cam/stats', () => ({ data: { total_photos: 482, total_videos: 28, total_jobs_with_media: 24, storage_used_mb: 1284, storage_limit_mb: 5120, recent_uploads_7d: 67 }, success: true }));
register('GET', '/job-cam/media', ({ query }) => {
  let list = DEMO_JOBCAM_MEDIA;
  if (query.job_id) list = list.filter((m) => String(m.job_id) === query.job_id);
  if (query.tag) list = list.filter((m) => m.tag === query.tag);
  return { data: list, success: true, total: list.length };
});
register('GET', '/job-cam/media/:id', ({ params }) => ({ data: DEMO_JOBCAM_MEDIA.find((m) => m.id === params.id) || DEMO_JOBCAM_MEDIA[0], success: true }));
register('POST', '/job-cam/media', ({ body }) => ({ data: { ...body, id: newId('media'), created_at: nowIso() }, success: true }));
register('POST', '/job-cam/media/:id/approve', () => ({ data: { success: true }, success: true }));
register('DELETE', '/job-cam/media/:id', () => ({ data: { success: true }, success: true }));
register('GET', '/job-cam/templates', () => ({
  data: [
    { id: 'jct_1', name: 'Pre-Production Inspection', sections: ['Front elevation', 'Rear slope', 'Left slope', 'Right slope', 'Flashing detail', 'Vents'], required_photos: 8 },
    { id: 'jct_2', name: 'Post-Install Documentation', sections: ['Final overview', 'Ridge cap', 'Flashing detail', 'Punch list items'], required_photos: 6 },
    { id: 'jct_3', name: 'Insurance Claim Evidence', sections: ['Hailstone scale shot', 'Damaged shingle close-up', 'Wide-angle damage', 'Address marker'], required_photos: 12 },
  ],
  success: true,
}));
register('GET', '/job-cam/reports', () => ({
  data: [
    { id: 'jcr_1', name: 'Davis — Pre-Production Photos', job_id: 107, template_id: 'jct_1', status: 'complete', photo_count: 8, created_at: daysFromNowDate(-3) },
    { id: 'jcr_2', name: 'Henderson — Pre-Production Photos', job_id: 115, template_id: 'jct_1', status: 'complete', photo_count: 11, created_at: daysFromNowDate(-12) },
    { id: 'jcr_3', name: 'Tran — Post-Install Documentation', job_id: 117, template_id: 'jct_2', status: 'complete', photo_count: 7, created_at: daysFromNowDate(-2) },
    { id: 'jcr_4', name: 'Cohen — Insurance Claim Evidence', job_id: 113, template_id: 'jct_3', status: 'in_progress', photo_count: 5, created_at: daysFromNowDate(-2) },
  ],
  success: true,
}));
register('GET', '/job-cam/checklists', () => ({ data: [], success: true }));
register('GET', '/job-cam/share-links', () => ({ data: [], success: true }));

// ---- ABC Supply (extended product catalog) --------------------------------
const ABC_SUPPLY_ITEMS = [
  { id: 'abc_001', sku: 'GAF-TIM-CHA', name: 'GAF Timberline HDZ — Charcoal', category: 'shingles', brand: 'GAF', unit: 'bundle', price: 41.20, in_stock: true, branch: '152' },
  { id: 'abc_002', sku: 'GAF-TIM-WTH', name: 'GAF Timberline HDZ — Weathered Wood', category: 'shingles', brand: 'GAF', unit: 'bundle', price: 41.20, in_stock: true, branch: '152' },
  { id: 'abc_003', sku: 'GAF-TIM-PEW', name: 'GAF Timberline HDZ — Pewter Gray', category: 'shingles', brand: 'GAF', unit: 'bundle', price: 41.20, in_stock: true, branch: '152' },
  { id: 'abc_004', sku: 'OC-DUR-BLK', name: 'Owens Corning Duration — Onyx Black', category: 'shingles', brand: 'Owens Corning', unit: 'bundle', price: 39.85, in_stock: true, branch: '152' },
  { id: 'abc_005', sku: 'OC-DUR-DRI', name: 'Owens Corning Duration — Driftwood', category: 'shingles', brand: 'Owens Corning', unit: 'bundle', price: 39.85, in_stock: true, branch: '152' },
  { id: 'abc_006', sku: 'CER-LAN-WTH', name: 'CertainTeed Landmark — Weathered Wood', category: 'shingles', brand: 'CertainTeed', unit: 'bundle', price: 38.50, in_stock: true, branch: '152' },
  { id: 'abc_007', sku: 'GAF-TIG-ROO', name: 'GAF Tiger Paw Roofing Underlayment', category: 'underlayment', brand: 'GAF', unit: 'roll', price: 105.00, in_stock: true, branch: '152' },
  { id: 'abc_008', sku: 'GR-D-15', name: 'Grace Ice & Water Shield 36" x 75\'', category: 'underlayment', brand: 'Grace', unit: 'roll', price: 98.50, in_stock: true, branch: '152' },
  { id: 'abc_009', sku: 'GAF-RID-CHA', name: 'GAF Seal-A-Ridge — Charcoal', category: 'ridge_cap', brand: 'GAF', unit: 'bundle', price: 56.30, in_stock: true, branch: '152' },
  { id: 'abc_010', sku: 'GAF-RID-WTH', name: 'GAF Seal-A-Ridge — Weathered Wood', category: 'ridge_cap', brand: 'GAF', unit: 'bundle', price: 56.30, in_stock: true, branch: '152' },
  { id: 'abc_011', sku: 'AML-DRI-BRN', name: 'Amerimax Drip Edge 5" — Brown', category: 'flashing', brand: 'Amerimax', unit: 'piece', price: 11.40, in_stock: true, branch: '152' },
  { id: 'abc_012', sku: 'AML-DRI-WHT', name: 'Amerimax Drip Edge 5" — White', category: 'flashing', brand: 'Amerimax', unit: 'piece', price: 11.40, in_stock: true, branch: '152' },
  { id: 'abc_013', sku: 'GAF-COB-12', name: 'GAF Cobra Ridge Vent (12 ft roll)', category: 'ventilation', brand: 'GAF', unit: 'roll', price: 64.20, in_stock: true, branch: '152' },
  { id: 'abc_014', sku: 'AIRH-BX', name: 'AirHawk Box Vent — Aluminum', category: 'ventilation', brand: 'AirHawk', unit: 'piece', price: 18.75, in_stock: true, branch: '152' },
  { id: 'abc_015', sku: 'GR-NAILS-114', name: 'Roofing Nails 1-1/4" Galvanized (50 lb)', category: 'fasteners', brand: 'Grip-Rite', unit: 'box', price: 72.00, in_stock: true, branch: '152' },
  { id: 'abc_016', sku: 'GR-CAPS-1', name: 'Plastic Cap Nails 1" (3000 ct)', category: 'fasteners', brand: 'Grip-Rite', unit: 'box', price: 38.50, in_stock: true, branch: '152' },
  { id: 'abc_017', sku: 'BST-PIPE-3', name: 'Boot Pipe Flashing 3" — Lead', category: 'flashing', brand: 'Best', unit: 'piece', price: 24.90, in_stock: true, branch: '152' },
  { id: 'abc_018', sku: 'BST-PIPE-4', name: 'Boot Pipe Flashing 4" — Lead', category: 'flashing', brand: 'Best', unit: 'piece', price: 28.40, in_stock: true, branch: '152' },
  { id: 'abc_019', sku: 'STA-STT-WHT', name: 'Starter Strip — White (per bundle)', category: 'shingles', brand: 'GAF', unit: 'bundle', price: 41.50, in_stock: true, branch: '152' },
  { id: 'abc_020', sku: 'GAF-WSC-BLK', name: 'GAF WeatherBlocker Hip & Ridge — Black', category: 'ridge_cap', brand: 'GAF', unit: 'bundle', price: 58.90, in_stock: false, branch: '152' },
];
register('GET', '/abc-supply/items', ({ query }) => {
  let list = ABC_SUPPLY_ITEMS;
  if (query.category) list = list.filter((i) => i.category === query.category);
  if (query.brand) list = list.filter((i) => i.brand === query.brand);
  return { data: list, success: true, total: list.length };
});
register('GET', '/abc-supply/search', ({ query }) => {
  const q = (query.q || query.search || '').toLowerCase();
  const list = q ? ABC_SUPPLY_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)) : ABC_SUPPLY_ITEMS;
  return { data: list, success: true, total: list.length };
});
register('GET', '/abc-supply/branches', () => ({
  data: [
    { id: '152', name: 'ABC Supply — Plano #152', address: '1500 N Central Expy, Plano, TX 75074', phone: '+1 (972) 555-0152', distance_mi: 2.4, hours: 'Mon-Fri 6a-5p · Sat 7a-12p' },
    { id: '147', name: 'ABC Supply — Frisco #147', address: '8200 Preston Rd, Frisco, TX 75034', phone: '+1 (972) 555-0147', distance_mi: 8.1, hours: 'Mon-Fri 6a-5p · Sat 7a-12p' },
    { id: '188', name: 'ABC Supply — Garland #188', address: '4400 W Walnut St, Garland, TX 75042', phone: '+1 (972) 555-0188', distance_mi: 14.7, hours: 'Mon-Fri 6a-5p · Sat 7a-12p' },
    { id: '203', name: 'ABC Supply — Carrollton #203', address: '2300 Kelly Blvd, Carrollton, TX 75006', phone: '+1 (972) 555-0203', distance_mi: 11.2, hours: 'Mon-Fri 6a-5p · Sat 7a-12p' },
  ],
  success: true,
}));
register('GET', '/abc-supply/cart', () => ({ data: { items: [], total: 0, item_count: 0 }, success: true }));
register('POST', '/abc-supply/cart/add', ({ body }) => ({ data: { ...body, success: true }, success: true }));

// SRS / QXO product catalogs (mirror ABC structure)
register('GET', '/srs/items', () => ({ data: ABC_SUPPLY_ITEMS, success: true }));
register('GET', '/srs/search', ({ query }) => {
  const q = (query.q || query.search || '').toLowerCase();
  return { data: q ? ABC_SUPPLY_ITEMS.filter((i) => i.name.toLowerCase().includes(q)) : ABC_SUPPLY_ITEMS, success: true };
});
register('GET', '/qxo/items', () => ({ data: ABC_SUPPLY_ITEMS, success: true }));
register('GET', '/qxo/search', ({ query }) => {
  const q = (query.q || query.search || '').toLowerCase();
  return { data: q ? ABC_SUPPLY_ITEMS.filter((i) => i.name.toLowerCase().includes(q)) : ABC_SUPPLY_ITEMS, success: true };
});
register('GET', '/qxo/orders/history', () => ({ success: true, data: { items: [], pagination: { itemsPerPage: 20, pageNumber: 1, totalPages: 1, totalItems: 0 } } }));
register('GET', '/srs/orders/history', () => ({ success: true, data: { items: [], pagination: { itemsPerPage: 20, pageNumber: 1, totalPages: 1, totalItems: 0 } } }));

// Helper for handlers above (computed offset relative to now)
function daysFromNowDate(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

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
      // Unmatched route — return a polymorphic empty response so callers
      // can safely do `.filter`/`.map`/`.data`/`.items`/`.total` etc.
      // without crashing. This is the demo-mode equivalent of "show
      // empty state, don't throw".
      const fallback: AxiosResponse = {
        data: polymorphicEmpty(),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      // eslint-disable-next-line no-console
      console.debug('[demo] unmatched route, returning empty success:', method, url);
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

    // Skip interception for non-API URLs (analytics scripts, fonts, images, CDNs).
    // We only want to intercept calls to the app backend. Heuristic: URL
    // includes `/api/` or matches a registered route after path normalization.
    const looksLikeApiCall = /\/api\//.test(url) || url.startsWith('/') || matchRoute(method, url) !== null;
    if (!looksLikeApiCall) return originalFetch(input, init);

    const match = matchRoute(method, url);
    const body = (() => {
      const raw = init?.body;
      if (!raw) return {};
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return {}; }
      }
      return raw as any;
    })();

    if (!match) {
      // Unmatched API call — return polymorphic empty rather than letting
      // the original fetch hit a real backend (which would 404 or CORS-fail
      // from the iframe). Same shape contract as the axios adapter fallback.
      // eslint-disable-next-line no-console
      console.debug('[demo fetch] unmatched route, returning empty success:', method, url);
      await new Promise((r) => setTimeout(r, 80));
      return new Response(JSON.stringify(polymorphicEmpty()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
