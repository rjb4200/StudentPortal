## 1. New Component: Day Detail Modal

- [x] 1.1 Create `src/components/dashboard/day-detail.tsx` — Modal showing date, shift type, time range, and status with icon + text badge
- [x] 1.2 Implement read-only mode for terminal statuses (cancelled, rejected) with Close button only
- [x] 1.3 Implement Cancel button for non-terminal statuses (pending, approved) that calls `onCancel` callback
- [x] 1.4 Accept `schedule` object prop with all fields needed for display

## 2. New Component: Shift List View

- [x] 2.1 Create `src/components/dashboard/shift-list.tsx` — table showing all shifts sorted by date descending
- [x] 2.2 Render columns: Date, Type, Time, Status (with icon + text badge), Actions
- [x] 2.3 Show Cancel button on rows with non-terminal statuses (pending, approved) via `onCancel` callback
- [x] 2.4 Show no action button on terminal status rows (cancelled, rejected)

## 3. Enhance Calendar Grid

- [x] 3.1 Add status text labels with icons (⌛ Pending, ✓ Approved, — Cancelled, ✕ Rejected) in each cell below the time range
- [x] 3.2 Add `title="Past dates are unavailable for scheduling"` attribute on disabled past-date cells
- [x] 3.3 Add "Unavailable" entry to the legend (gray swatch + label)

## 4. Update Dashboard Page

- [x] 4.1 Add `viewMode` state (`'grid' | 'list'`) and Grid/List toggle buttons in the calendar header
- [x] 4.2 Render `shift-list.tsx` when `viewMode === 'list'` instead of CalendarGrid
- [x] 4.3 Add a persistent "[+ Request Shift]" CTA button that opens ShiftModal
- [x] 4.4 Change date click handler: existing shift click opens DayDetailModal instead of CancelShiftModal directly
- [x] 4.5 Wire DayDetailModal's Cancel button to close detail modal and open CancelShiftModal for the same shift
- [x] 4.6 Change `handleCancelShift`: if cancelTarget status is 'pending', remove from schedules array instead of marking cancelled

## 5. Verification

- [x] 5.1 Run `npm run build` to verify no TypeScript or build errors
- [x] 5.2 Verify Grid/List toggle switches views correctly
- [x] 5.3 Verify List view shows all shifts with correct status badges and Cancel buttons
- [x] 5.4 Verify clicking existing shift opens Day Detail modal with correct info
- [x] 5.5 Verify Day Detail Cancel button opens CancelShiftModal
- [x] 5.6 Verify pending self-cancellation clears the cell (removes from list/grid)
- [x] 5.7 Verify status text labels appear in grid cells with correct icons
- [x] 5.8 Verify past dates show unavailable tooltip
- [x] 5.9 Verify legend includes Unavailable entry
- [x] 5.10 Verify Request Shift CTA is always visible

