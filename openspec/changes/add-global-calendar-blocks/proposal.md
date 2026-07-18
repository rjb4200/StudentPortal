## Why

Administrators cannot currently close a calendar date to future student scheduling, and scheduling oversight is split between an approval queue and a filterable table rather than a date-oriented operational view. Training staff need a global way to block dates while preserving already-submitted schedules and a calendar that exposes pending, approved, and blocked-day workload together.

## What Changes

- Add global, single-date calendar blocks that prevent new student shift requests on the blocked date.
- Allow an admin to optionally record a block reason; show that reason to students when present.
- Preserve schedules that existed before a date is blocked, regardless of their status. Existing pending requests remain pending and are explicitly highlighted to administrators.
- Add `Approve and Block Day` and `Reject and Block Day` actions to pending schedule requests; each performs the selected request outcome and creates the global block as one operation.
- Add an Admin Calendar primary section for monthly schedule oversight, blocked-date management, per-day schedule details, and visibility of pending schedules on blocked days.
- Render blocked dates as unavailable in the student calendar while retaining visibility of the student's existing schedule and blocked-day notice when applicable.
- Enforce calendar blocks in the scheduling request path and database layer so a request cannot be created by bypassing the client UI.

## Capabilities

### New Capabilities
- `global-schedule-availability`: Global blocked-date records, student-visible reasons, and authoritative prevention of new schedule requests.

### Modified Capabilities
- `scheduling-calendar`: Student calendar availability and schedule-request behavior changes for globally blocked dates.
- `admin-shift-management`: Admin schedule management gains a calendar view, blocked-date controls, and blocked-day pending-request visibility.
- `admin-command-center`: The primary admin navigation gains a Calendar section and expanded schedule-request actions.

## Impact

- Affected UI: student dashboard calendar and shift request modal; Admin Command Center navigation, Daily Operations action queue, and a new admin calendar surface.
- Affected APIs: student schedule request and admin schedule-action flows, plus block management endpoints or equivalent server actions.
- Affected data: a new RLS-protected global date-block table, validation, generated Supabase types, and a database trigger or equivalent authoritative guard.
- Existing schedules, approval semantics, cancellation, notification behavior, and iCal feeds remain intact; blocking does not cancel, reject, or otherwise mutate records that already exist.
