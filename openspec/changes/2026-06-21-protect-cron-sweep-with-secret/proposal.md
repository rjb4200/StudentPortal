## Why

`/api/cron/sweep` is publicly callable and uses the Supabase service-role admin client to update expired students and write audit log entries. Any internet caller can repeatedly trigger privileged maintenance work.

## What Changes

- Add `CRON_SECRET` environment variable check to `src/app/api/cron/sweep/route.ts`.
- Require `Authorization: Bearer ${CRON_SECRET}` header before executing any privileged work.
- Return `401` when the secret is missing or invalid, before initializing the admin client.

## Capabilities

### New Capabilities
*(None — security hardening of existing endpoint.)*

### Modified Capabilities
- `authentication-authorization`: Cron sweep endpoint now requires a bearer secret to execute.

## Impact

- Modified: `src/app/api/cron/sweep/route.ts` — add auth check at the top of the GET handler.
- The `CRON_SECRET` env var must be set in Vercel project settings and `.env.local` for local testing.
- Vercel cron configuration (`vercel.json`) must be updated separately to send the `Authorization` header.
- No database changes.
