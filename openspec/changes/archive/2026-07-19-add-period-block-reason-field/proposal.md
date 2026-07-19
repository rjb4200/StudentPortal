## Why

The period-blocking form uses a reason value whose only visible input is located in the separate single-day block card. Administrators need a reason field directly in the period form so they can clearly explain a closure to students.

## What Changes

- Add a student-visible optional reason field to the Block scheduling period card.
- Keep the period reason independent from the selected-day block reason.
- Preserve existing optional reason and range-block API behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `global-schedule-availability`: Period-block creation presents its own optional student-visible reason input.

## Impact

- Admin scheduling calendar client state and range-block request payload.
- No database, API contract, or student calendar changes.
