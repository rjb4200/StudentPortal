## Why

The `/api/admin/refresh-schema` endpoint is unused — no app code, admin UI, deployment script, or external tooling calls it. It exposes a service-role-backed admin RPC to the internet.

## What Changes

- Delete `src/app/api/admin/refresh-schema/route.ts` and the now-empty directory.
- The `refresh_pgrst_schema` RPC and its migration remain in the database for manual use during migrations/debugging.

## Capabilities

### New Capabilities
*(None — removal of unused code.)*

### Modified Capabilities
*(None — no functionality depends on this endpoint.)*

## Impact

- Deleted: `src/app/api/admin/refresh-schema/route.ts`
- No app code references the route.
- No database changes.
