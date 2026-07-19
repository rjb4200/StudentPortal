## Why

Administrators can currently block scheduling only one calendar date at a time, making closures such as station training, holidays, or two-week operational periods unnecessarily repetitive to configure. Administrators need one action to block an inclusive span while retaining the ability to reopen individual dates later.

## What Changes

- Add an admin range-blocking action with start and end dates plus an optional student-visible reason.
- Create an independent global block for every calendar date in the inclusive range.
- Show the range's day count and scheduling impact before the administrator confirms the action.
- Preserve existing global blocks and all existing schedules; no schedule status changes are made by range blocking.
- Keep the current individual-date removal action as the way to reopen a date.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `global-schedule-availability`: Authorized admins can create global blocks for inclusive date ranges while preserving the existing single-date block and individual-date removal behavior.

## Impact

- Admin scheduling calendar UI and its schedule-block API validation and handling.
- `schedule_blocks` storage writes, without changing the existing per-date availability model.
- Student availability data and request prevention continue to use the existing blocked-date behavior.
