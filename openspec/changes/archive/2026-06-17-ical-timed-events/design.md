## Context

The `generateICalFeed()` function in `src/lib/ical.ts` produces the iCal (`.ics`) text for both the per-student feed at `/api/calendar/[studentId]` and the aggregate admin feed at `/api/calendar/all`. Both API routes already fetch `start_time` and `end_time` from the `schedules` table and pass them through to the feed generator via the `ScheduleRecord` interface.

The current implementation unconditionally uses `DTSTART;VALUE=DATE:YYYYMMDD` format, which renders every shift as an all-day event regardless of whether times are available. The time information only appears in the SUMMARY and DESCRIPTION text fields.

The `to24Hour()` function from `src/lib/time-formats.ts` converts 12-hour time strings (e.g., "7:00 AM") to 24-hour format (e.g., "0700"), which is a building block for constructing iCal datetime values.

## Goals / Non-Goals

**Goals:**
- Emit `DTSTART`/`DTEND` with full date-time values (`TZID=America/New_York:YYYYMMDDTHHMMSS`) when `start_time` and `end_time` are present
- Handle overnight shifts by advancing the end date when the end time is earlier than or equal to the start time in 24-hour comparison
- Fall back to `VALUE=DATE` for shifts without times
- Preserve all existing SUMMARY, DESCRIPTION, CATEGORIES, COLOR, and UID fields

**Non-Goals:**
- Adding VTIMEZONE component definitions (TZID reference is sufficient for modern calendar clients)
- Changing the student calendar grid display (already shows times)
- Modifying the email notifications
- Changing how times are stored in the database

## Decisions

### 1. Use TZID=America/New_York without VTIMEZONE definition

**Decision**: Reference the timezone by IANA identifier (`TZID=America/New_York`) without including a full VTIMEZONE component with daylight saving rules.

**Alternatives considered**:
- *UTC conversion*: Would require converting from Eastern to UTC, adding complexity for DST handling. Calendar clients handle TZID references natively and display in the user's local time.
- *Full VTIMEZONE with DST rules*: More technically correct but adds ~15 lines of boilerplate per feed. TZID references are universally supported by Google Calendar and Apple Calendar.

**Rationale**: Minimal implementation that calendar clients handle correctly. The TZID parameter tells the client which timezone the times are in, and the client converts to the viewer's local timezone on display.

### 2. Overnight detection via 24-hour comparison

**Decision**: Compare the 24-hour values of `end_time` and `start_time`. If `end24 <= start24`, advance the end date by one day. This covers: Night shifts (7PM ≤ 7PM → false, wait — 1900 > 0700 so this wouldn't trigger... let me reconsider), Full shifts (7AM ≤ 7AM → true), and Custom overnight shifts (e.g., 9PM to 3AM: 0300 ≤ 2100 → true).

Wait — Night shift: start 7:00 PM (1900), end 7:00 AM (0700). 0700 ≤ 1900 → true. So the end date advances. That's correct.

Full shift: start 7:00 AM (0700), end 7:00 AM (0700). 0700 ≤ 0700 → true. End date advances. Correct.

Day shift: start 7:00 AM (0700), end 7:00 PM (1900). 1900 ≤ 0700 → false. Same day. Correct.

Custom same-day: start 9:00 AM (0900), end 5:00 PM (1700). 1700 ≤ 0900 → false. Same day. Correct.

**Rationale**: The `<=` comparison correctly identifies all shift types that span midnight. No need to inspect `shift_type` — the times alone determine overnight status.

### 3. Keep VALUE=DATE fallback

**Decision**: When `start_time` or `end_time` is null/undefined, emit `DTSTART;VALUE=DATE:YYYYMMDD` and `DTEND;VALUE=DATE:YYYYMMDD` as before. This handles legacy records created before the time selector feature (migration 008) and any edge cases where times aren't set.

**Rationale**: Graceful degradation. Existing subscribers won't see broken events for records without times.

### 4. No changes to API routes

**Decision**: Both `/api/calendar/[studentId]` and `/api/calendar/all` already fetch `start_time` and `end_time` from the `schedules` table and pass them through the `ScheduleRecord` interface. No route changes needed.

**Rationale**: The change is purely in the iCal text generation. The data contract between routes and the generator is already correct.

## Risks / Trade-offs

- **[Risk] Calendar clients may display TZID references differently** — some clients show times in the event's timezone rather than the viewer's. **Mitigation**: America/New_York is the correct timezone for Winchester, KY. This is the expected behavior — users see shift times in local (Eastern) time.
- **[Risk] Legacy shifts without times become less visible** — all-day events are visually prominent as banners; timed events are narrower blocks. **Mitigation**: Shifts without times are already a minority (all new shifts have times). The SUMMARY still includes the student name and shift type for visibility.

## Migraiton Plan

Single file deployment. No database changes. Calendar clients will pick up the new format on their next automatic refresh (typically every 15-60 minutes depending on client settings).

**Rollback**: Revert the format change in `ical.ts` — the old `VALUE=DATE` output is a strict subset of the new behavior.

## Open Questions

- Should the SUMMARY field be simplified to remove the time range now that the calendar client displays the time block visually? Leaving it as-is for now — useful in list/agenda views. Can revisit based on user feedback.
