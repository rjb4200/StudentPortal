## Why

`/api/admin/refresh-schema` creates the Supabase service-role admin client and calls `refresh_pgrst_schema` RPC without verifying the caller is an admin. Any internet caller can execute this admin maintenance operation.

## What Changes

- Add server-side admin verification to `src/app/api/admin/refresh-schema/route.ts` using the same pattern other admin API routes use (`createServerClient` + `canAccessAdmin`).
- Return `403` for anonymous or non-admin callers before initializing the admin client or executing the RPC.

## Capabilities

### New Capabilities
*(None — this is a security fix, not a new feature.)*

### Modified Capabilities
- `authentication-authorization`: Admin API routes now consistently enforce authentication on the refresh-schema endpoint.

## Impact

- Modified: `src/app/api/admin/refresh-schema/route.ts` — add admin auth check at the top of the handler.
- No new dependencies, no database changes, no environment variable changes.
