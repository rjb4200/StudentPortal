## Why

Administrators do not have a centralized place to assess portal health, configuration readiness, storage usage, operational warnings, or high-level portal metrics. This makes routine troubleshooting harder and hides whether the daily expiration sweep is running successfully.

## What Changes

- Add an admin-only `/admin/system` dashboard that presents a minimal, honest view of current portal health using signals the application can actually measure.
- Add an admin-only system health API that aggregates database heartbeat, environment/configuration status, storage usage, summary metrics, recent audit activity, and cron sweep status.
- Add durable run history for the daily cron sweep so admins can see last success, last failure, duration, expired count, and stale-run warnings.
- Surface email delivery as configured/not configured and explicitly mark detailed delivery failure telemetry as unavailable until a future email telemetry change.
- Link the system dashboard from the existing admin command center menu.

## Capabilities

### New Capabilities
- `system-health-operations-dashboard`: Admin-facing dashboard and API for database, storage, configuration, scheduled job, operational alert, and summary metric visibility.

### Modified Capabilities
- `data-management`: Daily cron sweep records durable run history for success and failure so system health can report last cron success/failure and stale execution.

## Impact

- Admin UI: new `/admin/system` route and navigation entry from `/admin`.
- Admin API: new authenticated system health endpoint for aggregated operational state.
- Cron: `/api/cron/sweep` records success/failure metadata for the expiration job.
- Database: new table for system job run history with RLS/admin-read access.
- Supabase types: regenerate or manually update database types after the migration.
- Verification: `npm run build` and relevant unit tests for health aggregation/cron recording logic if introduced.
