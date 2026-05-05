/**
 * Staging auth bypass — auto-logs in a mock user on staging hosts so
 * QA / design review can navigate the app without real credentials.
 *
 * Activation:
 *   - Hostname matches one of `STAGING_HOSTS` (bl-v2.netlify.app, localhost, 127.0.0.1)
 *   - OR Vite env var `VITE_BYPASS_AUTH` is set to "1" / "true"
 *
 * NEVER active on production hostnames. Bypass is a one-shot bootstrap:
 * if a real user is already in the auth slice (via prior login), the
 * bootstrap is a no-op so real-user testing still works.
 */

import type { User } from '../store/services/authApi';

// ============================================================================
// HOSTNAMES
// ============================================================================

/**
 * Hostnames where the bypass auto-activates. Add new staging URLs here.
 * Production hostnames (`app.builderlync.com`, etc.) MUST never appear.
 */
export const STAGING_HOSTS = [
  'bl-v2.netlify.app',
  'localhost',
  '127.0.0.1',
];

/**
 * Hostname patterns where the bypass also activates. Matches by suffix or
 * regex — Netlify deploy previews use hostnames like
 * `deploy-preview-42--bl-v2.netlify.app`.
 */
const STAGING_HOST_PATTERNS: RegExp[] = [
  /^deploy-preview-\d+--[a-z0-9-]+\.netlify\.app$/i,
  /^[a-z0-9-]+--bl-v2\.netlify\.app$/i,
];

// ============================================================================
// MOCK USER + ORG (used only on staging)
// ============================================================================

export const STAGING_MOCK_TOKEN =
  'staging-bypass-token-do-not-use-in-prod';

export const STAGING_MOCK_USER: User = {
  id: 1,
  firstName: 'Staging',
  lastName: 'Reviewer',
  email: 'staging+reviewer@builderlync.com',
  companyName: 'BuilderLync Staging',
  companySlug: 'staging-org',
  organizationId: 1,
  organization_id: 1,
  // NOTE: deliberately no `role` field. `permissions.isParentUser()` checks
  // `!user.role` to grant blanket access — keeping role undefined makes the
  // staging user pass every `canAccessModule()` / `hasPermission()` check
  // without needing to enumerate every module's permission object.
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-05-04T00:00:00.000Z',
  // Permission flags so ProtectedRoute lets the user past billing gate:
  is_beta_user: true,
  user_type: 'staff',
  subscription_status: 'active',
  has_active_subscription: true,
  user_metadata: {
    organization_id: 1,
    company_name: 'BuilderLync Staging',
    full_name: 'Staging Reviewer',
  },
};

export const STAGING_MOCK_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'BuilderLync Staging',
  slug: 'staging-org',
  logo_url: undefined,
  primary_color: '#dc2626',
  enabled_modules: ['all'],
  subscription_status: 'active',
  subscription_tier: 'enterprise',
};

// ============================================================================
// DETECTION
// ============================================================================

/**
 * Returns true when the app should run in staging-bypass mode.
 *
 * Checked on every call so feature-flag changes via env var take effect on
 * page reload.
 */
export function isStagingEnvironment(): boolean {
  // 1. Explicit env var wins (works in any environment, including prod opt-in)
  const flag = (import.meta as { env?: Record<string, string | undefined> }).env
    ?.VITE_BYPASS_AUTH;
  if (flag === '1' || flag === 'true') return true;
  if (flag === '0' || flag === 'false') return false;

  // 2. Hostname-based fallback
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  if (STAGING_HOSTS.includes(host)) return true;
  if (STAGING_HOST_PATTERNS.some((re) => re.test(host))) return true;

  return false;
}

/**
 * One-line check that callers (OrgContext, ProtectedRoute) can use to
 * shortcut their auth gates. Memoized for the lifetime of the page since
 * the answer never changes mid-session.
 */
let _cachedIsStaging: boolean | null = null;
export function isStagingMode(): boolean {
  if (_cachedIsStaging === null) _cachedIsStaging = isStagingEnvironment();
  return _cachedIsStaging;
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

/**
 * If we're on staging AND no real user is logged in, populate auth state
 * with the mock user. Idempotent — safe to call on every render of App.
 *
 * Effects:
 *   1. Dispatches `loginSuccess` with the mock user + token
 *   2. Sets `currentOrganizationSlug` in localStorage (RootRedirect reads this)
 *   3. Returns true if bypass activated, false otherwise
 *
 * The dispatch parameter is loose-typed because the actual action creator
 * lives in a per-module store (roof-runner has its own). Caller passes the
 * correct dispatch.
 */
export function bootstrapStagingAuth(
  dispatch: (action: { type: string; payload: { user: User; token: string } }) => void,
  currentUser: User | null,
  currentToken: string | null,
): boolean {
  if (!isStagingMode()) return false;

  // Don't override a real session if one already exists
  if (currentUser && currentToken && currentToken !== STAGING_MOCK_TOKEN) {
    return false;
  }

  // Don't re-dispatch if mock is already in place
  if (currentToken === STAGING_MOCK_TOKEN) {
    // Still ensure the org slug is set in localStorage (in case it was cleared)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('currentOrganizationSlug', STAGING_MOCK_ORG.slug);
      window.localStorage.setItem('currentOrganizationId', STAGING_MOCK_ORG.id);
    }
    return true;
  }

  // First-time bootstrap on this page load
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('currentOrganizationSlug', STAGING_MOCK_ORG.slug);
    window.localStorage.setItem('currentOrganizationId', STAGING_MOCK_ORG.id);
    // Telemetry breadcrumb so it's visible in console which mode the app booted in
    // eslint-disable-next-line no-console
    console.warn(
      '%c[BuilderLync] STAGING AUTH BYPASS ACTIVE',
      'background:#dc2626;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold',
      `\nMock user: ${STAGING_MOCK_USER.email}\nMock org: ${STAGING_MOCK_ORG.slug}\nDisable by setting VITE_BYPASS_AUTH=0`,
    );
  }

  dispatch({
    type: 'auth/loginSuccess',
    payload: {
      user: STAGING_MOCK_USER,
      token: STAGING_MOCK_TOKEN,
    },
  });

  return true;
}
