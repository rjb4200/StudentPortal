## Why

The iCal calendar feeds (`/api/calendar/[studentId]` and `/api/calendar/all`) currently emit all shifts as all-day events (`VALUE=DATE`), regardless of the `start_time` and `end_time` on the schedule record. Shifts appear as flat banners at the top of each day in Google Calendar and Apple Calendar rather than occupying their actual scheduled time blocks. The time information exists only in the SUMMARY/description text, making it invisible to calendar clients for scheduling, conflict detection, and time-based notifications.

## What Changes

- Modify `generateICalFeed()` in `src/lib/ical.ts` to emit `DTSTART`/`DTEND` with full date-time values (`TZID=America/New_York:YYYYMMDDTHHMMSS`) when `start_time` and `end_time` are present on a schedule record
- Add next-day logic: when the end time's 24-hour value is less than or equal to the start time's 24-hour value, the end date advances by one day (handles overnight shifts like Night and Full)
- Keep `VALUE=DATE` format as fallback for shifts without `start_time`/`end_time`
- Preserve existing SUMMARY, DESCRIPTION, CATEGORIES, and COLOR fields unchanged

## Capabilities

### New Capabilities
<!-- None — this is a refinement of existing iCal behavior -->

### Modified Capabilities
- `scheduling-calendar`: Modify the "iCal feed includes time ranges" requirement — shift events SHALL render as timed events at their scheduled hours when `start_time` and `end_time` are present, rather than as all-day events

## Impact

- `src/lib/ical.ts` — rewrite event generation loop to use `TZID` format when times are present, add overnight detection
- Both iCal feed API routes — no changes needed (they already pass `start_time`/`end_time`)
- `src/lib/time-formats.ts` — no changes needed (`to24Hour()` already handles conversion)
- Calendar clients: existing subscribers will pick up the new format on next refresh (backward compatible — clients that don't support timed events fall back to all-day display)
