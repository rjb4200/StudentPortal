## Context

`src/app/admin/setup/page.tsx` uses a `useEffect` that dispatches `supabase.auth.getUser()` asynchronously while also calling `loadWelcome()` and `loadHelpEmail()` synchronously in the same effect. The middleware (`src/middleware.ts`) already gates `/admin/:path*` with a server-side auth check, returning 403 for non-admins. The client-side check is a redundant belt-and-suspenders that introduces the race.

## Goals / Non-Goals

**Goals:**
- Ensure `loadWelcome()` and `loadHelpEmail()` only execute after `canAccessAdmin()` passes
- Replace the client-side redirect with a local error state

**Non-Goals:**
- Changing the middleware behavior
- Modifying any config component (`QuizConfig`, `RegistrationFieldsConfig`, etc.)
- Changing the admin auth check mechanism (`canAccessAdmin`)

## Decisions

### Decision 1: Move data loading inside `.then()`

Move `loadWelcome()` and `loadHelpEmail()` from after the `getUser().then(...)` call to inside the `.then()` callback, after the auth check passes and before `setLoading(false)`.

**Rationale**: The simplest possible fix. No new functions, no restructuring — just reorder the existing calls.

### Decision 2: Replace `window.location.href` redirect with error state

Add a `rejected` state variable. If `canAccessAdmin()` fails, set `rejected = true` and show an "Access Denied" message instead of triggering a full-page redirect. The middleware already returns 403 for non-admins; if somehow a non-admin reaches the client, a redirect duplicates what the server already does and creates a flash of content.

**Alternative considered**: Keep the `window.location.href` redirect but move it after data loading. Rejected — the server already handles the redirect at the middleware level. A client redirect that fires after the page partially renders is worse than a clean error state.

## Risks / Trade-offs

- **Error state vs redirect**: If an admin's session expires between middleware and client mount, they see "Access Denied" instead of being redirected to `/login`. → Mitigation: They can manually navigate to `/login` or refresh. The middleware will catch them on next page load.
