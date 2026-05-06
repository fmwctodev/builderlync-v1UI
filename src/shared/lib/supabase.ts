/**
 * Supabase shim — frontend Supabase access was removed in favour of the
 * backend API. This module previously exported `null`, which crashed any
 * code that did `supabase.from(...)` or `supabase.auth.getUser()` at
 * runtime ("Cannot read properties of null (reading 'auth')").
 *
 * To keep legacy modules (Storm Canvassing, parts of Marketing) loadable
 * without a real Supabase client, we export a noop stub that mimics the
 * Supabase JS surface with a chainable query builder. Every chain
 * resolves to `{ data: [], error: null }` (or `{ data: null, error: null }`
 * for single-row queries). Auth methods return `null` users.
 *
 * When the backend API endpoints for these modules ship, individual
 * services should be migrated off this stub one at a time. Until then,
 * the stub keeps the UI shells renderable so QA + design review can walk
 * the modules without backend.
 */

type SupabaseResult<T = unknown> = { data: T; error: null };

// ============================================================================
// Chainable query stub
//
// Implements the most common methods of `supabase.from(...).select()...`
// chain. Every method returns `this` so chaining works; awaiting any
// thenable returns `{ data: [], error: null }` (list) or `{ data: null,
// error: null }` (single).
// ============================================================================
class QueryStub {
  private _isSingle = false;
  private _isMaybeSingle = false;

  // Modifiers — all no-ops, return `this` for chainability
  select(_columns?: string, _options?: any) { return this; }
  insert(_values: any) { return this; }
  update(_values: any) { return this; }
  upsert(_values: any, _options?: any) { return this; }
  delete() { return this; }
  eq(_col: string, _val: any) { return this; }
  neq(_col: string, _val: any) { return this; }
  gt(_col: string, _val: any) { return this; }
  gte(_col: string, _val: any) { return this; }
  lt(_col: string, _val: any) { return this; }
  lte(_col: string, _val: any) { return this; }
  like(_col: string, _val: any) { return this; }
  ilike(_col: string, _val: any) { return this; }
  is(_col: string, _val: any) { return this; }
  in(_col: string, _val: any[]) { return this; }
  contains(_col: string, _val: any) { return this; }
  containedBy(_col: string, _val: any) { return this; }
  rangeGt(_col: string, _val: any) { return this; }
  rangeLt(_col: string, _val: any) { return this; }
  not(_col: string, _op: string, _val: any) { return this; }
  or(_filters: string) { return this; }
  match(_query: any) { return this; }
  filter(_col: string, _op: string, _val: any) { return this; }
  order(_col: string, _options?: any) { return this; }
  limit(_count: number) { return this; }
  range(_from: number, _to: number) { return this; }

  // Terminators
  single<T = any>(): Promise<SupabaseResult<T | null>> {
    this._isSingle = true;
    return Promise.resolve({ data: null, error: null });
  }
  maybeSingle<T = any>(): Promise<SupabaseResult<T | null>> {
    this._isMaybeSingle = true;
    return Promise.resolve({ data: null, error: null });
  }

  // Awaiting the chain itself returns `{ data: [], count: 0, error: null }`.
  // Some callers destructure `count` from the result (e.g. paginated lists).
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve({
      data: this._isSingle || this._isMaybeSingle ? null : [],
      error: null,
      count: 0,
    }).then(onfulfilled as any, onrejected as any);
  }
}

// ============================================================================
// Channel / realtime stub
// ============================================================================
class ChannelStub {
  on(_event: string, _filter: any, _handler?: (payload: any) => void) { return this; }
  subscribe(_callback?: (status: string) => void) { return this; }
  unsubscribe() { return Promise.resolve('ok'); }
  send(_payload: any) { return Promise.resolve('ok'); }
}

// ============================================================================
// Auth stub
// ============================================================================
const authStub = {
  getUser: async () => ({ data: { user: null }, error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  signInWithPassword: async (_credentials: any) => ({ data: { user: null, session: null }, error: null }),
  signUp: async (_credentials: any) => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: (_callback: any) => ({
    data: { subscription: { unsubscribe: () => undefined } },
  }),
  refreshSession: async () => ({ data: { session: null, user: null }, error: null }),
  setSession: async (_args: any) => ({ data: { session: null, user: null }, error: null }),
  updateUser: async (_args: any) => ({ data: { user: null }, error: null }),
  resetPasswordForEmail: async (_email: string) => ({ data: {}, error: null }),
};

// ============================================================================
// Storage stub
// ============================================================================
const storageStub = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: any) => ({ data: null, error: null }),
    download: async (_path: string) => ({ data: null, error: null }),
    list: async (_path?: string) => ({ data: [], error: null }),
    remove: async (_paths: string[]) => ({ data: [], error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
    createSignedUrl: async (_path: string, _expiresIn: number) => ({ data: { signedUrl: '' }, error: null }),
  }),
};

// ============================================================================
// Top-level client stub
// ============================================================================
export const supabase = {
  from: (_table: string) => new QueryStub(),
  rpc: async (_fn: string, _args?: any) => ({ data: null, error: null }),
  channel: (_name: string) => new ChannelStub(),
  removeChannel: async (_channel: any) => 'ok' as const,
  removeAllChannels: async () => [] as const,
  getChannels: () => [] as any[],
  auth: authStub,
  storage: storageStub,
  // Some legacy code reads supabase.functions.invoke(...)
  functions: {
    invoke: async (_name: string, _options?: any) => ({ data: null, error: null }),
  },
};

// ============================================================================
// Legacy named exports — kept for compatibility
// ============================================================================
export async function getCurrentUser() {
  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  return null;
}

export async function updatePassword(_currentPassword: string, _newPassword: string) {
  throw new Error('Use backend API for password update');
}

export async function signOutEverywhere() {
  throw new Error('Use backend API for sign out');
}
