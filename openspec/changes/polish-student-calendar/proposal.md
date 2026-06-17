## Why

The student scheduling calendar is functional but basic — a 7-column grid with color-only status indicators, no mobile-friendly alternative view, no detail panel between clicking a date and the action modals, and no explanation for why past dates are disabled. Students who cancel their own pending requests see a cancelled marker on that day instead of the date returning to a clean available state. Closes #60.

## What Changes

- Add Grid / List view toggle in the calendar tab header
- Create a List view component showing all shifts (past + future) as a scrollable table with Cancel actions on non-terminal rows and status badges with icons
- Create a Day Detail modal that opens when clicking a date with an existing shift, showing shift type, time, status (with icon + text), and a Cancel action for non-terminal shifts
- Change click behavior: existing shift click opens the Detail modal instead of jumping directly to CancelShiftModal; Cancel action in the detail panel opens CancelShiftModal
- Add status text labels in grid cells (e.g., "⌛ Pending", "✓ Approved") alongside color background for accessible, non-color-dependent indicators
- Add tooltip on disabled past-date cells: "Past dates are unavailable for scheduling"
- Add "Unavailable" entry to the calendar legend explaining grayed-out past days
- Add a persistent "[+ Request Shift]" CTA button visible at all times in the calendar tab
- Change pending self-cancellation behavior: when a student cancels their own pending shift, the date cell returns to white (unmarked) instead of showing cancelled

## Capabilities

### New Capabilities
- `student-calendar-polish`: List/agenda view, Day Detail modal, accessible status indicators, persistent Request Shift CTA, unavailable day explanations

### Modified Capabilities
- `scheduling-calendar`: Modify calendar grid requirements — add status text labels, tooltip on past dates, legend entry for unavailable; modify cancel flow to route through Day Detail modal; change pending self-cancellation to clear the cell instead of marking it cancelled

## Impact

- New: `src/components/dashboard/shift-list.tsx` — list/agenda view component
- New: `src/components/dashboard/day-detail.tsx` — day detail modal component
- Modified: `src/components/dashboard/calendar-grid.tsx` — status text labels, tooltip, legend update
- Modified: `src/app/dashboard/page.tsx` — view toggle state, list rendering, detail panel state, CTA button, pending-cancel removal logic
- No API changes, no database changes, no new dependencies
