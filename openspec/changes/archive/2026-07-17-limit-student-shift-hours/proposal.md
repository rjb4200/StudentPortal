## Why

Students must not request ride time after 2200. The existing Full Shift option creates a 24-hour 0700-to-0700 request, and the API accepts arbitrary times even when the UI hides them.

## What Changes

- Replace the 24-hour Full Shift student option with an Extended Shift preset from 0700 to 2200.
- Restrict custom student shift start and end times to the 0700-2200 window and require an end time later than the start time.
- Enforce the same rules in server-side request validation.
- Preserve existing historical shift records, including 24-hour rides, without migration or modification.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `shift-time-selectors`: Replace Full Shift with Extended Shift and limit all new student-requested hours to 0700-2200.
- `scheduling-calendar`: Align calendar shift-request behavior with the new Extended Shift preset and custom-time cutoff.
- `shift-rotation`: Remove the obsolete 0700-to-0700 Full Shift example from the rotation rules.

## Impact

- Affected code: student shift modal, shared time options, schedule-request validation and tests.
- Data model: no schema change; existing schedule data remains valid.
- Verification: `npm run test` and `npm run build`.
