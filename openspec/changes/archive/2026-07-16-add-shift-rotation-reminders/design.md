## Context

The portal stores student ride dates and times but has no representation of the department's recurring 24/48 rotation. The student calendar and Admin Daily Operations queue therefore lack the on-duty Chief context needed for scheduling. Student account approval and scheduled-ride emails are already generated server-side, while Vercel invokes the existing expiration sweep once per day.

The rotation starts at 0700 America/New_York on July 16, 2026: First Shift (R Brown), Second Shift (S Bellot), and Third Shift (M Martin). A full student ride also begins at 0700, so its schedule date determines the applicable crew.

## Goals / Non-Goals

**Goals:**

- Derive one consistent crew-shift result for dashboard, admin, and email surfaces.
- Make the daily reminder safe to retry without duplicate delivery.
- Use the active Station 1 resource-document URL rather than a hard-coded asset path.
- Preserve existing scheduling approval, cancellation, and expiration behavior.

**Non-Goals:**

- Make the rotation editable in this change.
- Add a department-wide crew calendar or external iCal events for every rotation day.
- Change the student onboarding, resource-library UI, or authentication flows.
- Add SMS reminders or modify existing schedule approval/rejection/cancellation emails.

## Decisions

### Decision: Centralize the fixed 0700 Eastern rotation in a pure helper

A shared helper will calculate First, Second, or Third Shift from a schedule date using the July 16, 2026 0700 America/New_York anchor. It will expose the shift label, Chief name, and presentation color token for calendar and admin surfaces. The date used for a ride is its stored start date; a full ride's following-morning end does not change its assigned crew.

Alternatives considered:
- Duplicate date arithmetic in the dashboard, admin queue, and cron: simple initially, but prone to inconsistent Chief assignments.
- Store a row for each calendar date: supports exceptions, but unnecessarily creates recurring operational data for this fixed three-shift cycle.

### Decision: Keep student schedule status visually primary

The existing schedule status remains the calendar cell background and state indicator. The rotation is rendered as a compact secondary tag so an orange/yellow/gray crew color cannot be mistaken for pending/approved/cancelled status.

Alternatives considered:
- Color the entire cell by crew shift: hides the schedule lifecycle state students need to understand.
- Render rotation only on dates with rides: removes useful planning context and conflicts with the requested all-days calendar view.

### Decision: Resolve the Station 1 link from active resource data

Server-side email paths will retrieve the active `Station 1 - Downtown HQ Map` document URL from the existing resource tables. This keeps approval and reminder links aligned with the admin-managed resource, including future storage uploads. If no active usable URL is configured, email delivery still proceeds with Station 1 reporting instructions and logs the missing-map condition.

Alternatives considered:
- Hard-code `/resources/station-1-map.pdf`: the file is not present in the checkout and would drift from the managed resource library.
- Add a new map URL setting: duplicates the existing resource-document source of truth.

### Decision: Use a dedicated reminder cron and persistent delivery ledger

Add a Vercel cron route at 1800 UTC daily. It will calculate tomorrow's date in America/New_York, select approved rides for that date, and attempt one reminder per ride. A `schedule_reminders` table will have a unique key per schedule and reminder type; the job claims/inserts the record before sending so repeated executions cannot send a duplicate email. Job results will be recorded in `system_job_runs` separately from expiration telemetry.

Alternatives considered:
- Extend the expiration sweep: combines unrelated failure domains and obscures reminder health.
- Record delivery only after sending: retries can duplicate email when a process fails between provider delivery and persistence.
- Depend on Vercel's once-daily invocation: manual runs and platform retries can still duplicate delivery.

## Risks / Trade-offs

- [UTC cron timing changes by an hour at daylight-saving transitions] -> 1800 UTC meets the accepted +/- one-hour requirement; all ride-date selection remains America/New_York.
- [A Station 1 map document is inactive or missing] -> retain essential reporting instructions, omit only the link, and record an operational error for correction.
- [A new reminder table requires live schema coordination] -> add a numbered migration, apply it to the live Supabase project, regenerate database types, then deploy cron code.
- [A fixed anchor cannot represent future rotation exceptions] -> keep the helper small and covered by boundary-date tests; add configurable overrides only in a future change if needed.

## Migration Plan

1. Create and apply the reminder-delivery table, uniqueness constraint, indexes, and RLS policies; regenerate types.
2. Add and test the rotation and Eastern-date helpers.
3. Add calendar/admin tags and approval-email reporting content.
4. Deploy the protected reminder route and Vercel 1800 UTC cron configuration.
5. Validate a dry-run-equivalent eligible schedule in production and inspect the job-run record and delivery ledger.

Rollback consists of removing the Vercel reminder cron before rolling back application code. The delivery ledger can remain for audit purposes; dropping it requires a separate reviewed migration.

## Open Questions

- None for this scoped change. The rotation anchor, Chief assignments, reporting location, and acceptable cron timing are defined.
