## Why

The dashboard has five different "Schedule a Shift" buttons calling the same function, with one appearing redundantly inside the schedule tab toolbar directly behind the modal it opens. Additionally, the shift request modal displays a read-only date with no way to change it — students must back out and use the calendar grid to pick a different date. These two UX issues create confusion and friction in the most common student workflow.

## What Changes

- Remove the "Schedule a Shift" button from the schedule section toolbar (leaves the Calendar/List toggle only)
- Add a native `<input type="date">` date picker to the shift request modal, constrained to the student's class ride-time window (`min`/`max`)
- The modal's internal `selectedDate` state syncs back to the parent via a new `onDateChange` callback prop
- Pass `schedules`, `classStartDate`, and `rideTimeEndDate` props to the ShiftModal for date validation context

## Capabilities

### New Capabilities

- `shift-modal-date-picker`: Native date input in the shift request modal with class window constraints

### Modified Capabilities

None. This is a UX/UI refinement with no requirement-level behavioral changes.

## Impact

- **Modified**: `src/app/dashboard/page.tsx` — remove toolbar button, pass new props to ShiftModal
- **Modified**: `src/components/dashboard/shift-modal.tsx` — add date picker, new props, internal date state
- No API, database, or dependency changes
