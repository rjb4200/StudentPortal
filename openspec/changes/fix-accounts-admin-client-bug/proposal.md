## Why

The Account Management page (`/admin/accounts`) calls `createAdminClient()` (which uses `SUPABASE_SERVICE_ROLE_KEY`) directly in the browser. The service role key is not exposed to the client (no `NEXT_PUBLIC_` prefix), so the key is `undefined` at runtime. The Supabase client constructor throws an uncaught error inside `saveEdit()`, which means `setSaving(false)` never runs — causing the Save button to spin forever when creating or editing admin or preceptor accounts. Auth user operations (createUser, updateUserById, deleteUser) must move to server-side API routes where the service role key is available.

## What Changes

- Create three server-side API routes under `/api/admin/` that use the service role key:
  - `POST /api/admin/create-auth-user` — creates a Supabase Auth user with email, password, and role metadata.
  - `PUT /api/admin/update-auth-user` — changes an auth user's password.
  - `DELETE /api/admin/delete-auth-user` — deletes an auth user.
- Update the `saveEdit` and `deleteAccount` functions in the accounts page to call these API routes via `fetch()` instead of calling `createAdminClient()` directly.
- Remove the `createAdminClient` import from the accounts page (no longer needed client-side).

## Capabilities

### New Capabilities
- `fix-accounts-admin-client-bug`: Server-side API routes for auth user CRUD, fixing the spinner-forever bug on the Account Management page.

### Modified Capabilities
*(None — this is a bug fix with no requirement-level behavior change.)*

## Impact

- New files: `src/app/api/admin/create-auth-user/route.ts`, `src/app/api/admin/update-auth-user/route.ts`, `src/app/api/admin/delete-auth-user/route.ts`.
- Modified: `src/app/admin/accounts/page.tsx` — replace `createAdminClient()` calls with `fetch()` to new API routes.
