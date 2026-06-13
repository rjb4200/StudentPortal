## Context

The `admin-account-management` change introduced a bug: `createAdminClient()` is called in the browser-side accounts page. The admin client uses `SUPABASE_SERVICE_ROLE_KEY` which is not prefixed with `NEXT_PUBLIC_` and is therefore `undefined` in the browser. This causes an uncaught error that leaves the Save button spinner stuck.

## Goals / Non-Goals

**Goals:**
- Fix the spinner-forever bug when saving admin or preceptor accounts.
- Move auth user CRUD to server-side API routes where the service role key is safe.
- Keep the accounts page UI unchanged (same flow, same components).

**Non-Goals:**
- Changing the Supabase Auth API patterns.
- Adding authentication to the new API routes (they inherit middleware protection from `/api/admin` prefix — but actually they don't currently; need to add admin-only check in each route or use middleware).
- Changing the database-level CRUD for `admin_accounts` or `preceptors` (still uses browser client with anon key + RLS).

## Decisions

### 1. Three separate API routes, not one catch-all

`POST /api/admin/create-auth-user`, `PUT /api/admin/update-auth-user`, `DELETE /api/admin/delete-auth-user` — each does one thing.

**Rationale:** REST semantics. Each route is self-contained with clear inputs/outputs. Easier to debug than a single `/api/admin/auth` route with a switch on method + action body.

### 2. Routes protected by in-route admin check

Each route verifies the caller's auth session has `user_metadata.role = 'admin'` before executing the service-role operation.

**Rationale:** The `/api/admin/` prefix is not currently in the middleware matcher. Adding it would require a middleware change. In-route checks are simpler and self-documenting. The routes use the anon-key client for auth verification and the service-role client for admin operations.

### 3. Accounts page removes `createAdminClient` import

The `saveEdit` function replaces `const adminClient = createAdminClient()` with `fetch('/api/admin/...')` calls. The `deleteAccount` function does the same.

**Rationale:** Zero service-role-key usage in the browser. All auth user operations go through the API routes.

## Risks / Trade-offs

- **[Risk] API routes are publicly discoverable** → Mitigation: Each route verifies the caller is an admin via Supabase auth session before executing. Non-admin requests return 403.
- **[Risk] Password is sent in plaintext over HTTPS** → Mitigation: Supabase Auth handles password hashing server-side. The password is in the request body over HTTPS — same as the existing login flow.

## Migration Plan

1. Create three API routes.
2. Update accounts page to use `fetch()` instead of `createAdminClient()`.
3. Remove `createAdminClient` import from accounts page.
4. Run build and verify.

Rollback: Revert the accounts page to import `createAdminClient` and remove the API routes.
