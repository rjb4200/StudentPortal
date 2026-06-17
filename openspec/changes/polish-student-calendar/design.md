## Context

The student dashboard calendar tab (`src/app/dashboard/page.tsx`, 323 lines) renders a three-tab layout (Calendar / Preceptors / Messages). The Calendar tab shows a month grid via `CalendarGrid` and an iCal feed card in a 3:1 sidebar layout. Clicking an empty future date opens `ShiftModal`; clicking a date with a pending/approved shift opens `CancelShiftModal` directly; clicking a cancelled/rejected date does nothing. Past dates are disabled with no explanation.

The grid uses `date-fns` for calendar math and `abbreviated12` from `@/lib/time-formats` for time display. Status is conveyed solely by cell background color with a legend of four swatches. The modals (`ShiftModal`, `CancelShiftModal`) use the shared `Modal` component from `src/components/ui/modal.tsx`.

## Goals / Non-Goals

**Goals:**
- Add Grid/List view toggle with persistent "[+ Request Shift]" CTA
- Create a List view component showing all shifts as a sortable table
- Create a Day Detail modal as an intermediate step between date click and CancelShiftModal
- Add accessible status text labels (icon + text) in grid cells
- Add tooltip on past dates explaining unavailability
- Add "Unavailable" to the calendar legend
- Change pending self-cancellation to clear the cell instead of showing cancelled
- Keep admin-initiated cancellations unchanged (always show cancelled)

**Non-Goals:**
- Changing the iCal feed sidebar (stays as-is)
- Modifying the ShiftModal or CancelShiftModal internals
- Adding event listeners for calendar client sync
- Changing the Preceptors or Messages tabs
- Server-side changes or API modifications

## Decisions

### 1. Modal for Day Detail, not slide-over or inline

**Decision**: Use a centered Modal (reusing the existing `Modal` UI component) for the Day Detail panel.

**Alternatives considered**: Slide-over drawer, inline cell expansion.

**Rationale**: The Modal pattern already exists in this codebase for ShiftModal and CancelShiftModal. It works identically on mobile and desktop. The `Modal` component handles backdrop, focus trap, and close behavior out of the box.

### 2. List view as a separate component with local state

**Decision**: Create `shift-list.tsx` as a standalone client component that receives the `schedules` array and `onCancel` callback as props. The list sorts shifts by date descending within the component.

**Rationale**: Keeps the dashboard page's schedule logic centralized. The list component is purely presentational with its own internal sort/filter state (e.g., future toggle if added later).

### 3. Pending self-cancellation: filter out, don't mark

**Decision**: In `handleCancelShift`, when the cancel target has `status === 'pending'`, filter the schedule OUT of the `schedules` state array instead of updating it to `{ ...s, status: 'cancelled' }`.

```typescript
// Current:
setSchedules((prev) => prev.map((s) => s.id === cancelTarget.id ? { ...s, status: 'cancelled' } : s));

// New:
if (cancelTarget.status === 'pending') {
  setSchedules((prev) => prev.filter((s) => s.id !== cancelTarget.id));
} else {
  setSchedules((prev) => prev.map((s) => s.id === cancelTarget.id ? { ...s, status: 'cancelled' } : s));
}
```

**Rationale**: When a student withdraws their own unapproved request, there's no value in showing a canceled marker — the date should appear clean and available again. Admin cancellations still show "Cancelled" since they represent external action.

### 4. Status icon + text labels in cells

**Decision**: Add a small text span below the time range in each calendar cell showing the status with an icon:

| Status | Icon | Text | Color class |
|---|---|---|---|
| pending | ⌛ | Pending | `text-wfd-gold` |
| approved | ✓ | Approved | `text-white` (on crimson bg) |
| cancelled | — | Cancelled | `text-amber-800` |
| rejected | ✕ | Rejected | `text-gray-400` |

**Rationale**: Simple Unicode characters avoid adding an icon library. Combined with the existing background color, these provide dual-channel status communication (color + text) meeting WCAG 1.4.1.

### 5. Day Detail modal flow

**Decision**: The Day Detail modal (new component `day-detail.tsx`) receives the selected schedule as a prop and renders read-only info. When the user clicks "Cancel Shift", it calls back to the parent which closes the detail modal and opens the CancelShiftModal with the same schedule.

**Rationale**: Each modal does one thing. The Day Detail shows info and offers an action; the CancelShiftModal handles the cancellation flow. No cross-modal state sharing needed beyond the schedule identity.

## Risks / Trade-offs

- **[Risk] Grid cells may be too cramped with status text on mobile** — the `aspect-square` cells at 7-column layout already push limits. **Mitigation**: Use abbreviated text ("Pend", "Appr", "Canc", "Rej") and the smallest possible font. If still too tight, hide labels on screens below `sm` breakpoint and show only color + time. The List view is the primary mobile experience.
- **[Risk] Day Detail modal adds a click step before canceling** — users now need two clicks instead of one to cancel. **Mitigation**: The detail modal loads instantly with no async data fetch. The extra click gives users a chance to verify the shift before committing to cancel.

## Open Questions

- Should the List view default to showing only upcoming shifts with a toggle for all? Leaving as all-shifts for now per user direction.
