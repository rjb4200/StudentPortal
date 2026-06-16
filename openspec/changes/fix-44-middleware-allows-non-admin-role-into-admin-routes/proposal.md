## Why

GitHub issue #44 reports that middleware currently allows non-admin roles, specifically preceptor-style roles, into `/admin` routes. Admin pages and admin APIs already mostly assume true-admin-only access, so middleware must enforce that rule at the server boundary instead of relying on client-side redirects.

## What Changes

- Restrict `/admin` and all `/admin/*` routes to users whose role is exactly `admin`.
- Keep `/preceptor` accessible to preceptor users and admin users, so administrators can open the Preceptor area for oversight and troubleshooting.
- Add a small shared role authorization helper so admin/preceptor route checks use consistent role semantics across middleware, page guards, and API routes.
- Update login/admin redirect behavior so preceptor users are routed to `/preceptor`, admin users are routed to `/admin`, and other roles are denied or sent to the appropriate non-admin area.
- Preserve existing `/api/admin/*` admin-only behavior while refactoring repeated role checks to use the shared helper where practical.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication-authorization`: Role-based route access requirements change so `/admin` is admin-only and `/preceptor` explicitly allows admin or preceptor users.

## Impact

- Middleware route guard for `/admin` and potentially `/preceptor`.
- Client-side role checks in admin and preceptor pages.
- Admin API route authorization helper usage.
- Login redirect behavior for admin and preceptor roles.
- No database migration is expected.
