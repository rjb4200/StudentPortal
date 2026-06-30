## 1. Database And Types

- [x] 1.1 Add a Supabase migration for `system_job_runs` with structured job run fields, indexes for `job_name`/timestamps, RLS enabled, and admin read access.
- [x] 1.2 Apply the migration to the live Supabase project per repository instructions.
- [x] 1.3 Regenerate or manually update `src/lib/supabase/database.types.ts` for `system_job_runs`.

## 2. Cron Run Telemetry

- [x] 2.1 Update `/api/cron/sweep` to measure start time, finish time, duration, and expired student count.
- [x] 2.2 Record a `success` `system_job_runs` row when the sweep completes, including `summary.expired`.
- [x] 2.3 Catch sweep failures, attempt to record a `failure` `system_job_runs` row with `error_message`, and return an error response.
- [x] 2.4 Preserve existing cron authorization behavior using `CRON_SECRET`.

## 3. System Health API

- [x] 3.1 Add an admin-only `/api/admin/system-health` route using the existing cookie-based admin session pattern.
- [x] 3.2 Aggregate database heartbeat status, summary metrics, recent audit activity, storage bucket/object usage, environment configuration status, email configuration status, app version/build context, and cron run history.
- [x] 3.3 Compute operational alerts for database failure, missing configuration, stale or failed cron, and storage metadata warnings.
- [x] 3.4 Ensure the API never returns raw secret values or service-role credentials.

## 4. Admin Dashboard UI

- [x] 4.1 Add `/admin/system` page that fetches the system health API and handles loading, error, and refresh states.
- [x] 4.2 Render overall status, service checks, operational alerts, scheduled job status, storage usage, summary metrics, recent activity, and app version/build information.
- [x] 4.3 Show email delivery as configured/not configured and clearly state that detailed delivery failure telemetry is not currently tracked.
- [x] 4.4 Add a link to `/admin/system` in the Admin Command Center menu.
- [x] 4.5 Ensure the page layout works on desktop and mobile while preserving the existing admin visual language.

## 5. Verification

- [x] 5.1 Add targeted unit tests for extracted health aggregation or cron telemetry helpers if implementation extracts testable pure functions.
- [x] 5.2 Run `npm run test` if tests are added or affected.
- [x] 5.3 Run `npm run build`.
- [x] 5.4 Review the dashboard behavior against the OpenSpec scenarios before marking the change complete.
