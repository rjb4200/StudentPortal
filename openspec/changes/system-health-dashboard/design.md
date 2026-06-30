## Context

The app already has pieces of operational visibility: `/api/health` checks database responsiveness, `/api/cron/sweep` expires student access daily, environment modules validate required Supabase settings, admin pages expose operational queues, and audit logging records some high-risk actions. These signals are scattered and do not give administrators a single status view.

Issue #80 asks for a broad health and operations dashboard. The chosen scope is a minimal honest dashboard: report only signals the app can measure today, add narrow telemetry for last cron success/failure, and explicitly mark email delivery failure telemetry as not yet tracked rather than pretending console logs are queryable history.

Current constraints:
- Admin access is protected by Supabase Auth user metadata and middleware for `/admin` routes.
- Server-only service-role access is available through `createAdminClient()`.
- Supabase storage usage can be estimated from `storage.objects` object counts and metadata byte sizes.
- The live database has a `notification_queue` table, but local migrations do not define it and app code does not use it. This change should not rely on that drifted table for dashboard behavior.

## Goals / Non-Goals

**Goals:**
- Provide an admin-only `/admin/system` page with a concise health summary, checks, alerts, cron status, and portal metrics.
- Provide an admin-only API endpoint that aggregates system health data server-side.
- Record durable run history for the daily cron sweep, including success and failure rows.
- Warn when the daily cron sweep is stale or failing.
- Keep email status honest by showing configuration status and a clear note that detailed email delivery telemetry is not currently tracked.

**Non-Goals:**
- Do not build full email retry, queue processing, or permanent failure tracking.
- Do not integrate with Resend delivery webhooks or Vercel deployment APIs.
- Do not build alert delivery, paging, push notifications, or external monitoring.
- Do not resolve existing admin authorization reliance on user metadata.
- Do not rely on the live-only `notification_queue` table unless a separate migration reconciles it.

## Decisions

### Add a small `system_job_runs` table for cron telemetry

Use a new table dedicated to system job run history instead of overloading `audit_log`.

Rationale:
- `audit_log` is human/action oriented and currently only records successful cron expiration when rows are changed.
- Health needs structured fields: job name, status, start/finish timestamps, duration, summary JSON, and error text.
- A dedicated table makes “last success,” “last failure,” and stale-run checks straightforward.

Alternative considered: write cron heartbeat rows to `audit_log`. This would avoid a migration but would require parsing unstructured action text and still would not cleanly represent failure metadata.

Proposed columns:
- `id uuid primary key default gen_random_uuid()`
- `job_name text not null`
- `status text not null check (status in ('success', 'failure'))`
- `started_at timestamptz not null`
- `finished_at timestamptz not null`
- `duration_ms integer not null`
- `summary jsonb not null default '{}'::jsonb`
- `error_message text`
- `created_at timestamptz not null default now()`

RLS should be enabled. Admins should be able to read rows. Inserts should happen server-side through the service-role admin client from the cron route.

### Aggregate dashboard data through an admin API route

Create a server route such as `/api/admin/system-health` instead of querying everything directly from the client.

Rationale:
- Some checks require service-role or server-only environment visibility.
- The client should not receive secret values, only presence/validity summaries.
- Server aggregation keeps dashboard rendering simple and avoids duplicating admin auth logic in client queries.

The API should return safe structured data only, for example:
- `overallStatus`: `healthy | warning | attention`
- `checks`: database, storage, auth, email, environment
- `jobs`: cron sweep last success/failure/staleness
- `metrics`: active students, pending approvals, active instructors, active training sites, recent errors/activity
- `alerts`: computed warning list

### Keep `/api/health` as a lightweight public heartbeat

Do not replace `/api/health`. The system dashboard API may reuse the same basic database-read concept but should remain admin-only and richer.

Rationale:
- `/api/health` already has a simple responsibility and may be useful for external uptime checks.
- The dashboard has privileged operational details and belongs under admin authentication.

### Treat email delivery as configuration-only in this change

The dashboard should report whether `RESEND_API_KEY` is configured and state that detailed delivery failure history is not tracked yet.

Rationale:
- Existing `sendEmail()` returns `{ ok, error }`, but most callers ignore the result or only log to console.
- Console logs are not durable app data.
- The existing `notifications-alerts` spec includes retries/permanent failure behavior, but the implemented app is currently best-effort only. This change should not broaden into full email telemetry.

### Compute storage usage from Supabase storage metadata

Use `storage.objects` grouped by bucket to show object counts and total bytes when available. Show bucket config and usage warnings using conservative thresholds.

Rationale:
- Supabase storage bucket metadata is available server-side through Postgres/storage APIs.
- The app currently uses public buckets for branding and onboarding assets, so object count and bytes are useful diagnostics.
- Project-level Supabase storage quota may not be available through app APIs, so the dashboard should avoid claiming exact account quota usage unless available.

## Risks / Trade-offs

- Schema drift around `notification_queue` could confuse future work → Do not use it for this dashboard; document email telemetry as unavailable until a separate reconciliation change.
- Cron failure logging can miss failures before route code executes, such as Vercel not invoking the route at all → Stale-run warnings mitigate this by flagging no recent run history.
- Recording failure rows inside the cron route can fail if the database is unavailable → Return a failure response and rely on stale-run warnings for outages where no row can be written.
- Storage usage may not equal billable project quota → Label it as bucket/object usage, not full Supabase plan usage.
- Admin API aggregation could become slow if it scans large tables → Use count queries, small limits, and indexed status/date fields; avoid returning full records.

## Migration Plan

1. Add a Supabase migration for `system_job_runs` with RLS enabled and admin read policy.
2. Apply the migration to the live Supabase project and update `src/lib/supabase/database.types.ts`.
3. Update `/api/cron/sweep` to wrap the sweep in timing/error recording and insert a `system_job_runs` row for success/failure.
4. Add admin-only system health aggregation endpoint.
5. Add `/admin/system` UI and link it from the admin command center menu.
6. Verify with `npm run build` and targeted tests if health aggregation or cron run recording is extracted into testable helpers.

Rollback:
- Remove the `/admin/system` link/page and system health endpoint if needed.
- Leave `system_job_runs` in place harmlessly, or drop it in a follow-up migration if the feature is fully reverted.

## Open Questions

- What exact stale threshold should the dashboard use for the daily cron sweep: 24 hours, 26 hours, or 36 hours? The design recommends 26 hours to allow schedule jitter.
- Should recent errors be based only on structured `system_job_runs` failures and failed API responses recorded later, or should audit entries matching failure text also be counted for the first version?
