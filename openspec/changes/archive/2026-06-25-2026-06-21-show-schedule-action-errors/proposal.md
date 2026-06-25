## Why

When an admin approves, rejects, or cancels a schedule request via the daily ops panel, the `handleScheduleAction` function ignores the API response. Failed status changes are silent — the UI reloads as if the action succeeded even when the database update failed.

## What Changes

- Add a `scheduleActionError` state variable to `DailyOps`.
- Update `handleScheduleAction` to check the API response and throw on failure.
- Only reload schedules on successful API response.
- Display a clear error message in the pending schedules section when an action fails.

## Capabilities

### New Capabilities
*(None — error handling improvement for existing functionality.)*

### Modified Capabilities
- `admin-shift-management`: Schedule action errors are now surfaced in the daily ops UI instead of being silently ignored.

## Impact

- Modified: `src/components/admin/daily-ops.tsx` — added error state, response checking, and error display.
- No new dependencies, no database changes, no environment variable changes.
