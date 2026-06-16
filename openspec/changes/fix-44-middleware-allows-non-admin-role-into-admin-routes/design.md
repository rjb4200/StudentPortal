## Context

Middleware currently treats both `admin` and `preceptor` user metadata roles as valid for `/admin` route access. Several admin pages perform their own client-side role checks, and `/api/admin/*` routes check for `role === 'admin'`, but middleware is the server-side route boundary for admin pages and currently admits a non-admin role.

The intended access model is narrower: `/admin` belongs to true administrators only. The Preceptor area remains separate and may be opened by either preceptor users or administrators.

## Goals / Non-Goals

**Goals:**

- Make `/admin` and `/admin/*` admin-only in middleware.
- Keep `/preceptor` accessible by preceptor users and admin users.
- Consolidate role checks through a small shared helper to avoid drift between middleware, pages, and API routes.
- Preserve existing admin API route behavior as admin-only.
- Preserve current Supabase Auth role metadata model.

**Non-Goals:**

- Build new preceptor dashboard functionality.
- Replace `user_metadata.role` with a new role source.
- Redesign all authentication flows.
- Change database RLS policies.

## Decisions

1. Use a pure role helper instead of a Supabase-client helper.

   The shared helper should accept a user-like object or role value and answer simple questions such as `isAdmin`, `isPreceptor`, `canAccessAdmin`, and `canAccessPreceptor`. This keeps it safe for middleware, API routes, and client page guards without importing server-only code into client bundles.

2. Define route access as `/admin = admin only`, `/preceptor = admin or preceptor`.

   This directly fixes issue #44 while preserving the user decision that administrators may open the Preceptor area.

3. Keep API authorization strict.

   `/api/admin/*` routes already require admin role checks. Refactoring them to a helper should not weaken behavior or allow preceptors into admin APIs.

## Risks / Trade-offs

- `user_metadata.role` remains the current source of truth -> this change aligns existing behavior but does not solve the broader risk that user metadata can be user-editable depending on Supabase configuration.
- Client-side page guards are not a security boundary -> middleware and API route checks must remain authoritative.
- Some pages may duplicate role checks after the helper is introduced -> prefer updating obvious callers, but middleware and admin APIs are the critical enforcement points.

## Migration Plan

No database migration is required. Deploy as an application-code-only change and verify route behavior with `npm run build` plus manual or scripted role checks.

## Open Questions

- None blocking.
