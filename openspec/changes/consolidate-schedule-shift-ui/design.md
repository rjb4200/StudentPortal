## Context

The dashboard `Schedule a Shift` button appears in 5 locations (hero command bar states A/B/C, schedule toolbar D, empty state E). All call `openScheduleRequest()` which auto-selects a date and opens the ShiftModal. The ShiftModal shows the date as a static title with no way to change it.

The student's class date window (`classStartDate` to `rideTimeEndDate`) is already loaded in the dashboard and passed to the CalendarGrid component for constraining available dates.

## Goals / Non-Goals

**Goals:**
- Remove the redundant toolbar button (D) from the schedule section
- Let students pick/change the date inside the ShiftModal

**Non-Goals:**
- Changing the hero command-state buttons (A, B, C) or empty-state button (E)
- Modifying the calendar grid or list views
- Changing shift type options, time selectors, or submission flow
- Adding any new dependencies

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Date picker | **Native `<input type="date">`** over mini-calendar or dropdowns | Zero new code for calendar logic; browser handles validation, formatting, mobile picker; single element |
| Constraint mechanism | `min={classStartDate}` / `max={rideTimeEndDate}` attributes | Browser-native, prevents invalid date submission before it reaches the API |
| Date sync | `onDateChange` callback prop on ShiftModal | Avoids changing the `onSubmit` signature; parent's existing `selectedDate` state stays the source of truth |
| Existing schedule check | Client-side `disabled`/`invalid` on dates with non-cancelled schedules | Prevents double-booking confusion; server-side validation still catches edge cases |
| Toolbar removal scope | Only the "Schedule a Shift" button; Calendar/List toggle stays | Other public pages (login, etc.) are unaffected |

## Risks / Trade-offs

- **Native date picker varies by browser/OS**: Chrome, Firefox, Safari, and mobile all render `<input type="date">` differently. → Acceptable; the element is standard and functional everywhere.
- **`min`/`max` attributes are advisory**: Some browsers let users type dates outside the range. → Server-side class window validation in `/api/schedule/request` already rejects out-of-window dates.
