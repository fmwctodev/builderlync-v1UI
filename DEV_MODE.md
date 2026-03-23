# Development Mode - Auth Bypass

This document describes the changes made to bypass authentication for development purposes.

## Changes Made

### 1. App.tsx
- Modified `RootRedirect` to skip all authentication checks
- Automatically redirects to `/org/dev-org/dashboard`
- Sets mock organization context in localStorage

### 2. ProtectedRoute.tsx
- Removed all authentication verification logic
- Now simply renders children without any checks
- Logs "DEV MODE: Bypassing authentication" to console

### 3. ProtectedOrgRoute.tsx
- Removed organization access verification
- Now simply renders children without any checks
- Logs "DEV MODE: Bypassing organization authentication" to console

### 4. OrgContext.tsx
- Added mock organization with ID `dev-org-id` and slug `dev-org`
- Mock org has enterprise tier with all modules enabled
- Skips all database calls for organization loading
- Organization context is immediately available

## Mock Organization Details

```typescript
{
  id: 'dev-org-id',
  name: 'Development Organization',
  slug: 'dev-org',
  subscription_status: 'active',
  subscription_tier: 'enterprise',
  enabled_modules: ['all']
}
```

## Usage

Simply start the development server and navigate to any route. You will automatically be redirected to the dashboard without needing to log in or create an organization.

```bash
npm run dev
```

## Reverting Changes

To restore authentication:

1. Revert changes in `src/App.tsx` - restore the original `RootRedirect` function
2. Revert changes in `src/shared/components/ProtectedRoute.tsx`
3. Revert changes in `src/shared/components/ProtectedOrgRoute.tsx`
4. Revert changes in `src/shared/context/OrgContext.tsx`

## Notes

- This is for development purposes only
- Database queries will still require proper authentication to work
- Some features that depend on real user data may not function correctly
- Console logs indicate when auth is being bypassed with "🔓 DEV MODE" prefix
