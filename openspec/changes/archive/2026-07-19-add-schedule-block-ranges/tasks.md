## 1. Atomic Range Blocking

- [x] 1.1 Add and apply a Supabase migration that provides a conflict-safe, atomic range-block operation over the existing per-date `schedule_blocks` records, including a bounded inclusive range and an impact summary.
- [x] 1.2 Regenerate `src/lib/supabase/database.types.ts` after applying the migration.
- [x] 1.3 Extend server-side validation and the admin schedule-block API to authorize range creation, validate start/end dates and reasons, and return newly blocked, already-blocked, pending-schedule, and approved-schedule counts.
- [x] 1.4 Preserve the existing single-date create and individual-date removal behavior.

## 2. Admin Calendar Experience

- [x] 2.1 Add start and end date controls to the admin scheduling calendar for an inclusive blocking period.
- [x] 2.2 Display an impact preview with the inclusive day count, already-blocked count, pending and approved schedule counts, and non-destructive behavior before confirmation.
- [x] 2.3 Submit a confirmed period through one range request and refresh the calendar with a concise success or failure result.
- [x] 2.4 Retain the current individual-date removal control so exception days can be reopened independently.

## 3. Verification

- [x] 3.1 Add focused validation and API tests for valid single-day and multi-day ranges, invalid/reversed or oversized ranges, already-blocked dates, and atomic failure behavior.
- [x] 3.2 Add focused admin calendar tests for preview counts, confirmation, success feedback, and individual reopening after a range block.
- [x] 3.3 Verify student availability and direct schedule requests are denied for every date created through a range while preexisting schedules retain their status.
- [x] 3.4 Run `npm run test`.
- [x] 3.5 Run `npm run build`.
