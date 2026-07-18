## Context

Students currently load only their own schedules into the dashboard calendar, while Daily Operations loads every schedule for status-based administration. There is no calendar-wide availability record: the schedule request API checks student eligibility and class dates, then inserts using the service-role client. The student calendar is therefore only a usability layer and cannot independently protect against a manually submitted request.

This change introduces a global, single-date closure that applies to every student and does not alter schedules created before the closure. It also adds a date-oriented admin surface alongside the existing daily operational queue.

## Goals / Non-Goals

**Goals:**
- Prevent all new shift requests on globally blocked dates through both UI and database enforcement.
- Preserve pending, approved, rejected, and cancelled schedules that existed when a date was blocked.
- Let admins resolve one pending request and block its date atomically.
- Show optional block reasons to students and clearly flag pending schedules on blocked dates to admins.
- Provide a responsive monthly admin calendar with date-level schedule details and block management.

**Non-Goals:**
- Blocking date ranges, recurring closures, class-specific closures, site-specific closures, or time-of-day capacity limits.
- Automatically rejecting, cancelling, or notifying existing schedules when a date is blocked.
- Changing iCal content, existing shift cancellation behavior, or schedule-status values.

## Decisions

### Store global availability separately from schedules

Create a `schedule_blocks` table keyed by a unique calendar date, with an optional reason and audit metadata for the creating admin. A row represents an organization-wide closure; it is not a pseudo-student schedule and does not use `schedule_status`.

This separates a shared availability rule from a student-owned request, supports a simple unique-date constraint, and avoids corrupting schedule counts and history. Adding a `blocked` schedule status was rejected because it would require a student association and would not accurately represent a global closure.

### Enforce blocks at both the application and database layers

The student dashboard fetches global block records to gray out unbooked blocked dates, prevent opening the request flow, and display optional reasons. The shift request API checks the date before insertion for a clear error response. A `BEFORE INSERT` trigger on `schedules` also rejects inserts for blocked dates, making the rule authoritative for the existing service-role path and any future writer.

Client-only enforcement was rejected because the modal has a date input and HTTP requests can bypass visual restrictions. API-only enforcement was rejected because it does not provide the requested gray unavailable calendar state.

### Preserve every pre-existing schedule without grandfather flags

Blocking affects only future inserts. The table and trigger do not modify existing `schedules` rows, so approved and pending requests remain valid for later admin action. The admin calendar derives the attention state by joining or grouping pending schedules whose date exists in `schedule_blocks`.

Recording an explicit grandfather flag on each schedule was rejected because the insertion timestamp and unchanged existing rows already establish the required behavior, while a flag introduces backfill and lifecycle complexity without changing any decision.

### Make combined actions transactional and idempotent

`Approve and Block Day` and `Reject and Block Day` use one server-authorized database operation to update the selected pending schedule and insert the date block in the same transaction. The block insert is idempotent for a date already blocked. The existing status-transition and email behavior remains applicable to the selected schedule after the transaction succeeds.

Two independent API writes were rejected because a schedule could be resolved without the closure being created, or a closure could be created while the requested resolution fails.

### Add Calendar as a primary admin section

The Admin Command Center gains a URL-addressable Calendar section. Its month grid shows blocked dates, schedule-status counts, and a selected-date detail panel containing block controls and all schedules for that date. Pending schedules on a blocked date are visually prominent and remain actionable through the existing approval workflow.

Replacing Daily Operations was rejected because the Action Required queue remains the fastest place to process heterogeneous work. Keeping the existing Shift Management table preserves historical filtering while the calendar becomes the date-oriented operational view.

### Expose only the global availability data students need

Students receive blocked dates and optional reasons, not creator identity or internal audit metadata. RLS permits authenticated student reads of the global availability projection/table and limits creation, update, and removal to users with protected admin `app_metadata.role`. Server endpoints independently verify admin access before performing block changes.

## Risks / Trade-offs

- [A student has an existing schedule on a blocked date and mistakes the block for cancellation] → Preserve the schedule’s status/time presentation and add a separate blocked-day indicator with explanatory copy.
- [A manual request races an admin creating a block] → The database trigger rejects an insert once the block transaction commits; the client shows the returned unavailable-date message.
- [A combined action is retried after a network timeout] → Use idempotent block insertion and safe schedule-status handling so retrying cannot create duplicate blocks.
- [The admin calendar becomes slow with growing schedule history] → Query the displayed month plus selected-date detail, index schedules by date and index the unique block date, rather than loading unbounded history.
- [Reasons contain operationally sensitive content] → Mark the reason as student-visible at entry and limit it to concise validated text; creator metadata remains admin-only.

## Migration Plan

1. Add the global block table, unique date constraint, date index, RLS policies, schedule-insert guard trigger, and any transactional RPC in a numbered migration.
2. Apply the migration to the live Supabase project, regenerate `database.types.ts`, and verify new-request rejection and preserved existing schedules with SQL tests.
3. Deploy server validation and admin block APIs before exposing block controls.
4. Deploy student and admin calendar interfaces, then verify responsive behavior, combined actions, and the blocked-date request failure path.
5. Roll back application controls if needed without deleting block rows; remove specific blocks only through an explicit admin action. A schema rollback must first remove the schedule trigger/function before the table.

## Open Questions

- None for the first release. Date ranges, recurring closures, and scoped blocks are intentionally deferred.
