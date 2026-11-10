# Proposal

## Why

Approved student ride sign-ups currently live only in the portal. The Training Major must re-enter every rider into First Due by hand so the crew and the Events & Activities calendar reflect who is riding that day. Manual entry is slow, easy to forget, and drifts from the approved schedule. First Due exposes an official API, but it is read-only for Events & Activities on this tenant and API access is not part of the contract, so the write path must be proven and documented before it can be trusted.

## What Changes

- Document the First Due surface this integration depends on: the official read endpoints, the tenant's real response shapes, the event model, and the field mapping from portal schedules.
- Add a **daily reconciliation** that projects each approved student shift into one First Due **Event** (Events & Activities): one event per schedule row, titled for the student and shift, tagged with a stable portal correlation token.
- Post events through the **shadow session surface** (the First Due web session, which stays valid for roughly a year) while verifying through a **different, fresh read**. Writer and verifier are never the same path.
- **Verify** every posted event by re-reading the target window and comparing correlation tokens; mark verification drift and raise an admin alert instead of failing silently.
- **Cancel** events by appending `[CANCELLED]` to the title; delete only events that carry a portal correlation token when an edit is refused.
- Run against a **48-hour Eastern-time window** so overnight and prior-day approvals are posted before the ride, and treat jitter as a reconciliation gap rather than an error.
- Add a **session canary** that fails closed: if the stored First Due session is rejected, no writes run and an alert fires.
- Surface First Due sync status and operational alerts in the existing admin System Health view, using the existing durable job history.

## Capabilities

### New Capabilities

- `first-due-events-sync`: one First Due Event per approved student shift, posted with a stable correlation token through the shadow session, reconciled daily over an Eastern-time window, cancellable by marker, and idempotent on re-run.
- `first-due-integration-health`: long-lived session credential handling, a fail-closed canary, independent write/verify paths, drift detection, and admin alerting on auth loss or contract drift.

### Modified Capabilities

- `system-health-operations-dashboard`: scheduled job health and operational alerts cover the First Due events sync in addition to the daily expiration sweep.

## Impact

- **Database** — a sync ledger linking `schedules.id` to the First Due event identity, token, and sync state; reuse of `system_job_runs` for job history.
- **API/Jobs** — a new cron route for the daily reconciliation; a server-only First Due client that owns the stored session and the shadow request shape.
- **Configuration** — server-only First Due session secret, sync window, write/verify path selection, Pushover credentials, and a sync kill switch.
- **Admin UI** — System Health gains First Due sync status and alerts.
- **Docs** — new `docs/integrations/first-due/` covering the official API, the event model, the field mapping, and the captured shadow surface with provenance and breakage warnings.
- **Risk** — the shadow surface is undocumented and may change without notice; this change treats drift as an alertable condition rather than assuming stability.
- **Non-goals** — creating First Due personnel records (students are events, not personnel), writing to shift assignments, and per-approval real-time posting.
