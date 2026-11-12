# Design

## Context

See `proposal.md` for motivation. Constraints that shape the approach:

- `schedules` holds one row per student shift (`date`, `shift_type`, `start_time`, `end_time`, `status`, `preceptor_id`), with `status` in `pending | approved | rejected | cancelled`.
- `preceptor-rotation` (in progress) assigns an optional preceptor at approval and treats that pairing as immutable after approval.
- First Due exposes an official REST API at this tenant's own host, but the published surface has **no write** for Events & Activities and API access is not in the contract.
- The First Due **web session persists for roughly a year**, which makes it viable as an automation credential but raises the cost of leaking it.
- Students are represented in First Due as Events, not personnel records.
- The department is in Kentucky and operates in `America/New_York`.
- The repo already has Vercel cron routes, `system_job_runs` durable history, Resend email, and an admin System Health page.

## Goals / Non-Goals

**Goals:**

- A daily, idempotent projection of approved schedules into First Due Events.
- A write path and a verify path that are structurally independent.
- An alert on every condition that would otherwise fail silently.
- Documentation of the real First Due surface in the repo, including the unverified parts.

**Non-Goals:**

- Real-time posting at approval time.
- Creating or editing First Due personnel, shifts, or apparatus.
- Reconciling deletions initiated in First Due back into the portal.
- General-purpose First Due API client beyond what the sync needs.

## Decisions

### 1. Event identity is the ledger link, not the event body

One First Due Event per `schedules.id`, and the sync ledger holds the mapping from schedule id to First Due event id. The event title carries the human label (`Student Ride — <name>`, shift, times) and, after cancellation, the `[CANCELLED]` prefix. The description carries only student, shift, and preceptor — no portal token.

- **Why:** the operator does not want internal identifiers in the crew-facing description. The ledger is already the durable source of truth for what was posted, so identity does not need to live on the event.
- **Trade-off:** if the ledger is lost, existing events cannot be recognized and could be duplicated. The ledger is small, durable, and backed up with the portal database.
- **Alternative rejected:** a hidden token field — the web surface exposes no suitable hidden field; notes and title are both crew-visible.

### 2. One daily reconciliation over a five-day window, plus immediate cancellation

A single daily run reconciles the next five days in Eastern time. Cancellations do not wait for it: they are pushed immediately from the cancellation routes.

```
05:00 ET daily
  expected = approved schedules where date ∈ {today … today+4} (America/New_York)
  for each expected: token exists? skip : create
  for each linked event whose schedule left approved: mark [CANCELLED]
  verify: re-read window, compare token sets

on schedule cancel/reject (request after() hook, non-blocking)
  ledger link? no → no-op
  fresh getActivityInfo → token matches? → cancel + ledger 'cancelled'
```

- **Why:** embedding the run in the existing daily sweep adds no cron entry, while a five-day window posts each ride days ahead. Cancelling inside the request that changes the schedule means a same-day cancellation lands within seconds instead of the next morning.
- **Ledger, not window:** immediate cancellation resolves the event by `first_due_event_links.event_id`, so it works for dates outside the sync window and cannot touch events the portal did not create.
- **Known gap:** a shift approved mid-day for a same-day ride posts the following morning. Accepted for v1; the reconciler self-heals it.
- **Alternative rejected:** extra cron entries (Vercel plan limit) or per-approval webhooks for everything (more moving parts; the reconciler is still required).

### 3. Writer and verifier are different paths

Writes go through the captured shadow session. Verification uses `GET /event-log/getActivityInfo`, a fresh read whose response includes `notes`; the documented `/event-log/activities` returns 403 on this tenant and cannot serve until permissions are granted. The write and verify calls differ in method, endpoint, and response projection.

- **Why:** a recorded environment only proves what was captured; only a live read proves current state. Config selects write and verify paths and the run asserts they differ.
- **Alternative rejected:** trusting the write's own response — that is how shadow integrations fail silently.

### 4. Credentials are server-only, with runtime login

Credentials live in server-only environment secrets, never in client bundles, logs, API responses, or git. The client authenticates at runtime with the login email and password (browser-like headers), keeps the cookie in memory, and retries once when a request is rejected. `FIRST_DUE_SESSION` is an optional bootstrap and is recovered automatically. Every run begins with a cheap window read; an unauthorized or login-page response that cannot be recovered stops the run before any write.

- **Why:** the web session expires in roughly half an hour, so a static cookie cannot survive to a daily cron. Runtime login makes the daily job self-sufficient without a vendor change.
- **Trade-off:** the login invalidates other sessions for the same user, so a dedicated service account is preferable; and the login endpoints may change (covered by the canary and alerts).
- **Alternative rejected:** a static session only (observed to expire), or extra cron entries (no spare Vercel cron).

### 5. Cancellation marks, deletion is a fallback

Prefix the title with `[CANCELLED]`; the ledger link is untouched. Delete only when the title cannot be updated and the ledger links the event to a schedule. Events not in the ledger are never modified or deleted.

- **Why:** preserves an audit trail and guarantees the automation cannot touch First Due content it did not create.

### 6. Time is stored in ET, converted once at the boundary

Window membership and wall-clock times resolve in `America/New_York` using a DST-aware library. The web surface takes local wall-clock strings (`MM/DD/YYYY HH:mm:ss`), so the shadow path sends Eastern time directly and does not convert to UTC; only a future move to the documented API would require UTC. The sync runs inside the existing `0 0 * * *` sweep; at that instant Eastern time is still the previous calendar day (19:00/20:00), so the window helper resolves "today" in Eastern rather than UTC.

- **Why:** the web surface interprets these strings in tenant-local time, so a UTC conversion would shift every ride.

### 7. Ledger plus existing job history

A dedicated ledger records `schedule_id`, token, First Due event identity, state (`planned | posted | verified | cancelled | drifted`), and timestamps. Run outcomes go into `system_job_runs`, which the System Health page already reads.

- **Why:** verification is a set comparison over the ledger, and reusing job history avoids a second health mechanism.

### 8. Alerts are typed, not generic

Three alert classes — `AUTH` (canary failed), `DRIFT` (write reported success but token absent, or payload unparsable), `SUMMARY` (expected vs. posted counts). Delivered by Resend email and Pushover; failures to deliver are logged but never block the run.

- **Why:** "script needs updating" must arrive as a specific, actionable message.
- **Alternative rejected:** relying on the System Health page alone — nobody watches a dashboard overnight.

### 9. Documentation ships with the change

`docs/integrations/first-due/` captures the official surface, the event model, the portal-to-event field mapping, and the captured shadow surface with capture provenance and a breakage warning. The capture step also records the **event type lookup** loaded when the new-event form opens, because a valid type identifier is a hidden dependency of the write.

## Risks / Trade-offs

- **Shadow surface changes silently** → canary, post-write re-read, and `DRIFT`/update-required alerts; documented breakage warning; write/verify path config makes swapping to an official endpoint a config change.
- **Year-long session leaks** → server-only storage, gitignored captures, dedicated First Due user where roles allow, kill switch.
- **Same-day late approvals lag a day** → accepted; optional approval-time trigger noted as a follow-up.
- **Duplicate events from partial failures** → token lookup before create; ledger state reconciled each run.
- **First Due rejects title edits** → fallback to deletion of token-bearing events only, recorded in the ledger.
- **Timezone/DST errors** → single zone module, UTC conversion at one boundary, a DST-crossing scenario in the spec.

## Migration Plan

1. Write the First Due docs and field mapping; record what is documented vs. captured.
2. Capture the Events & Activities create/list flows once, manually, in a throwaway account context; store captures outside git.
3. Ship the sync in read-only mode (plan + verify + alert, no writes) and let it run daily until a week of expected sets is clean.
4. Enable writes behind the kill switch; observe the first cancelled and rescheduled shift.
5. Add First Due job status and alerts to System Health.
6. Rollback: flip the kill switch off. The ledger and docs remain useful read-only; no First Due data is removed by rollback.

## Open Questions

- Which First Due event type identifier should carry student rides, and does the tenant expose a lookup endpoint for it?
- Does the documented `GET /event-log/activities` authenticate for this tenant, or does verification also run over the shadow session?
- Does the First Due UI permit title edits on an event after creation, i.e. is the marker path or the deletion path the normal cancellation?
- Does the tenant allow a dedicated automation user limited to Events & Activities?
