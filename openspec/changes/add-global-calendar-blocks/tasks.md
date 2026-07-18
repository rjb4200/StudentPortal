## 1. Data Model and Database Enforcement

- [x] 1.1 Create a numbered Supabase migration for the global single-date schedule-block table, unique date constraint, optional student-visible reason, audit metadata, indexes, and RLS policies.
- [x] 1.2 Add an authoritative database guard that rejects new `schedules` inserts for globally blocked dates without modifying existing schedule rows.
- [x] 1.3 Add a transactional, idempotent database operation for resolving a pending schedule as approved or rejected while creating its global date block.
- [x] 1.4 Apply the migration to the live Supabase project and verify block creation, preserved existing schedules, rejected new inserts, and authorized access with SQL queries.
- [x] 1.5 Regenerate `src/lib/supabase/database.types.ts` from the live Supabase schema.

## 2. Server Actions and Validation

- [x] 2.1 Add validation schemas for block creation, block updates/removal, and the combined schedule-resolution-and-block actions.
- [x] 2.2 Update the student schedule request route to return a clear unavailable-date error before attempting an insert on a blocked date.
- [x] 2.3 Update the admin schedule-action route to authorize and invoke the transactional combined actions while preserving existing approval, rejection, cancellation, and email behavior.
- [x] 2.4 Add authorized admin APIs or server actions for calendar block creation, editing, removal, and calendar data retrieval.
- [x] 2.5 Add route and validation tests for blocked-date rejection, non-admin denial, idempotent blocks, combined-action atomicity, and preserved unrelated pending schedules.

## 3. Student Scheduling Experience

- [x] 3.1 Load global block dates and optional reasons with student dashboard scheduling data using the least-privileged client access path.
- [x] 3.2 Update the student calendar grid to gray and disable blocked dates that do not contain the student's existing schedule, including accessible unavailable-date text.
- [x] 3.3 Preserve existing pending and approved schedule presentation on blocked dates and add a visible blocked-day indicator with the optional reason.
- [x] 3.4 Prevent the primary schedule action, date click, date picker, and submit flow from selecting a blocked date; display the server error for a concurrent block.
- [x] 3.5 Add component or unit coverage for blocked unbooked dates, existing schedules on blocked dates, and request errors.

## 4. Admin Calendar and Approval Queue

- [x] 4.1 Add a URL-addressable Calendar primary section to the Admin Command Center and shared admin navigation.
- [x] 4.2 Implement a responsive monthly admin calendar showing blocked dates and per-day counts for pending, approved, rejected, and cancelled schedules.
- [x] 4.3 Implement selected-date details with block reason management and schedule rows containing student, time, and status information.
- [x] 4.4 Highlight pending schedules on globally blocked dates in both calendar summaries and date details without automatically changing their status.
- [x] 4.5 Add `Approve and Block Day` and `Reject and Block Day` controls to pending Action Required schedule items, including error feedback and refresh behavior.
- [x] 4.6 Retain the existing Shift Management history table and verify it remains consistent after schedule and block actions.

## 5. Verification and Release

- [x] 5.1 Run `npm run test` and address failures related to scheduling, validation, and admin actions.
- [ ] 5.2 Run `npm run build` and verify the student and admin calendar layouts at desktop and mobile widths.
- [ ] 5.3 Perform an end-to-end manual check: block an empty date, try a new student request, preserve an existing pending request, approve and block one request, reject and block another, and remove a block.
- [x] 5.4 Run Supabase security and performance advisors after the migration; resolve any new findings or document unrelated pre-existing findings.
