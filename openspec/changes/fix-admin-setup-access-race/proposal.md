## Why

The admin setup page (`/admin/setup`) calls `loadWelcome()` and `loadHelpEmail()` outside the `supabase.auth.getUser().then()` callback in its `useEffect`, meaning setup data queries fire before the admin access check completes. This creates a race condition where data can be fetched before the user is confirmed as an authorized admin.

## What Changes

- Move `loadWelcome()` and `loadHelpEmail()` inside the `.then()` callback in `src/app/admin/setup/page.tsx`, after the `canAccessAdmin()` check passes
- Replace the redundant client-side `window.location.href = '/login'` redirect with an error state — the middleware already gates `/admin/*` at the server level

## Capabilities

### Modified Capabilities
- `admin-onboarding-setup-page`: Setup data loading SHALL occur only after admin access is confirmed; unauthorized access SHALL display an error rather than triggering a client-side redirect

## Impact

- **Modified**: `src/app/admin/setup/page.tsx` only
- **Zero changes** to middleware, API routes, config components, or database
