## Context

`schedule_blocks` stores one row per blocked calendar date, while the admin calendar posts one selected date at a time. Student availability reads and request enforcement already operate per date, and individual block removal is part of the established workflow. Administrators need to close consecutive operational periods without losing the ability to reopen an exception day independently.

## Goals / Non-Goals

**Goals:**
- Let an authorized admin create blocks for every date in an inclusive start-to-end range through one action.
- Retain the existing per-date `schedule_blocks` data model and all student-facing availability behavior.
- Present range length, existing blocks, and existing schedule counts before confirmation.
- Preserve individual-date removal as the reopening workflow.

**Non-Goals:**
- Do not introduce named block groups, bulk range removal, recurring closures, or weekday-only expansion.
- Do not alter, cancel, approve, or reject schedules that predate a block.
- Do not change the student scheduling or calendar interfaces beyond the availability data they already consume.

## Decisions

### Expand a range into independent daily blocks

The range endpoint will validate an inclusive start and end date and create one block record per date using the supplied optional reason. Existing records remain unchanged rather than being overwritten. This matches the present availability checks and means any date can later be removed normally.

Alternative: store start/end intervals in a new range table. Rejected because availability checks, calendar rendering, overlap rules, and exception-day reopening would all become more complex.

### Perform writes atomically

All range-date inserts will occur in a single database operation so an invalid or failed write cannot leave a partially blocked period. The operation will return a summary separating newly created and already-blocked dates.

Alternative: have the browser submit one request per day. Rejected because it can partially succeed, creates unnecessary requests, and makes accurate feedback harder.

### Keep individual removal unchanged

No range identity is stored. The existing single-day removal control stays the sole way to reopen an unavailable date, including a day originally created through a range action.

Alternative: associate dates with a batch identifier. Rejected because the agreed workflow does not require bulk removal and would complicate blocks shared by overlapping closures.

### Show operational impact before creation

The admin calendar will calculate the inclusive date count and show existing schedule counts and already-blocked dates for the chosen range before confirmation. Existing schedules remain unchanged, so the preview is informational rather than a conflict that blocks creation.

## Risks / Trade-offs

- [Large requested ranges create many rows] → Bound the maximum range length in validation and make the limit clear in UI feedback.
- [A preexisting block could have a different reason] → Preserve that record and report it as already blocked rather than overwriting its reason.
- [Schedules may exist within a closure] → Surface pending and approved counts before confirmation while retaining current non-destructive behavior.
- [Concurrent block creation] → Use conflict-safe inserts and report dates that were already blocked.

## Migration Plan

1. Deploy the server-side range operation and its validation with the existing `schedule_blocks` table unchanged.
2. Deploy the admin calendar range controls and preview.
3. Verify student availability and direct schedule-request rejection across all dates in a created range.
4. Roll back the UI and range endpoint if necessary; rows created by a range remain safely manageable through existing individual removal controls.

## Open Questions

None. The agreed scope is inclusive calendar-date ranges and individual-date reopening.
