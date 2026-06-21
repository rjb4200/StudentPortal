## Why

The `/preceptor` page performs role enforcement in client-side `useEffect` only. Middleware protects `/dashboard` and `/admin` but not `/preceptor`. Client-side redirects are not sufficient access control — once real preceptor data is added, unauthenticated or unauthorized users may observe sensitive content before redirect.

## What Changes

- Add `/preceptor/:path*` to the middleware matcher.
- Add a preceptor route guard in middleware: redirect anonymous users to `/login`, return `403` for users without preceptor/admin role.
- Keep the existing client-side `canAccessPreceptor` check in `preceptor/page.tsx` as a UX fallback.

## Capabilities

### New Capabilities
*(None — security hardening of existing route.)*

### Modified Capabilities
- `authentication-authorization`: Middleware now covers `/preceptor` routes with server-side access control.

## Impact

- Modified: `src/middleware.ts` — import `canAccessPreceptor`, add `/preceptor` route block, update matcher.
- No new dependencies, no database changes, no environment variable changes.
