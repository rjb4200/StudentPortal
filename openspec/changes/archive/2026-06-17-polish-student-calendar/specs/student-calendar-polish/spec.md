## ADDED Requirements

### Requirement: Grid and List view toggle
The calendar tab header SHALL include a view toggle with "Grid" and "List" buttons that switch between the month calendar grid and a sortable list of all shifts. The active view button SHALL be highlighted with crimson background.

#### Scenario: Switch to List view
- **WHEN** a student clicks the "List" button in the calendar tab header
- **THEN** the grid calendar is replaced by the shift list table and the "List" button is highlighted crimson

#### Scenario: Switch to Grid view
- **WHEN** a student clicks the "Grid" button while in List view
- **THEN** the list table is replaced by the month calendar grid and the "Grid" button is highlighted crimson

### Requirement: Shift list view
The List view SHALL display all of the student's shifts (past and future) in a table sorted by date descending. Each row SHALL show date, shift type, time range, and status (with icon + text badge). Rows with non-terminal statuses (pending, approved) SHALL include a Cancel action. Terminal statuses (cancelled, rejected) SHALL show the status with no action button.

#### Scenario: List shows all shifts
- **WHEN** a student switches to List view with a mix of past and future shifts
- **THEN** all shifts are displayed in date-descending order

#### Scenario: Cancel action on non-terminal shift
- **WHEN** a student views a pending or approved shift in the list
- **THEN** a Cancel button is displayed on that row

#### Scenario: No cancel action on terminal shift
- **WHEN** a student views a cancelled or rejected shift in the list
- **THEN** no Cancel button is displayed on that row

### Requirement: Day Detail modal
Clicking a date with an existing shift SHALL open a Day Detail modal instead of the CancelShiftModal directly. The detail modal SHALL display the date, shift type, time range, and status with an icon and text badge. For non-terminal shifts (pending, approved), the modal SHALL include a "Cancel Shift" button. For terminal shifts (cancelled, rejected), the modal SHALL be read-only with a Close button. The "Cancel Shift" button SHALL open the CancelShiftModal.

#### Scenario: Detail modal shows full shift info
- **WHEN** a student clicks a date with an approved Day shift
- **THEN** a modal displays "June 20, 2026", "Day Shift", "7:00 AM – 7:00 PM", and "✓ Approved" status badge

#### Scenario: Detail modal offers cancel for non-terminal shift
- **WHEN** the detail modal is open for a pending shift
- **THEN** a "Cancel Shift" button is visible

#### Scenario: Detail modal is read-only for terminal shift
- **WHEN** the detail modal is open for a cancelled shift
- **THEN** no Cancel button is displayed and only a Close button is available

#### Scenario: Cancel action opens CancelShiftModal
- **WHEN** a student clicks "Cancel Shift" in the detail modal for an approved shift
- **THEN** the CancelShiftModal opens with the shift's date, type, time, and status pre-filled

### Requirement: Accessible status indicators in grid cells
Each calendar grid cell with a shift SHALL display a status text label below the time range. The label SHALL include an icon and text (e.g., "⌛ Pending", "✓ Approved", "— Cancelled", "✕ Rejected") in addition to the background color. Past dates with no shift SHALL display a tooltip explaining they are unavailable.

#### Scenario: Pending shift cell shows text label
- **WHEN** a student views the calendar grid with a pending shift
- **THEN** the cell displays the time range followed by "⌛ Pending" in the status-appropriate color

#### Scenario: Approved shift cell shows text label
- **WHEN** a student views the calendar grid with an approved shift
- **THEN** the cell displays the time range followed by "✓ Approved" in white text on crimson background

#### Scenario: Past date shows unavailable tooltip
- **WHEN** a student hovers over or focuses on a past date cell
- **THEN** a tooltip displays "Past dates are unavailable for scheduling"

### Requirement: Enhanced calendar legend
The calendar legend SHALL include five entries: Pending, Approved, Cancelled, Rejected, and Unavailable. The Unavailable entry SHALL explain that past dates are disabled for scheduling.

#### Scenario: Legend shows all entries
- **WHEN** a student views the calendar grid
- **THEN** the legend displays color swatches and labels for Pending, Approved, Cancelled, Rejected, and Unavailable

### Requirement: Persistent Request Shift CTA
A "[+ Request Shift]" button SHALL be visible at all times in the calendar tab. When clicked, it SHALL open the ShiftModal.

#### Scenario: CTA visible in Grid view
- **WHEN** a student views the calendar in Grid mode
- **THEN** the "[+ Request Shift]" button is visible and clicking it opens the ShiftModal

#### Scenario: CTA visible in List view
- **WHEN** a student views the calendar in List mode
- **THEN** the "[+ Request Shift]" button is visible and clicking it opens the ShiftModal

### Requirement: Pending self-cancellation clears the date
When a student cancels their own pending shift, the date cell SHALL return to white (empty) instead of displaying the cancelled status. The cancelled shift record still exists in the database but is filtered out of the displayed schedules array.

#### Scenario: Student cancels pending shift clears cell
- **WHEN** a student cancels a pending shift via the CancelShiftModal
- **THEN** the date cell returns to white/empty appearance and the schedule is removed from the displayed list

#### Scenario: Student cancels approved shift shows cancelled
- **WHEN** a student cancels an approved shift via the CancelShiftModal
- **THEN** the date cell displays amber cancelled styling (existing behavior)

#### Scenario: Admin cancels a shift shows cancelled
- **WHEN** an admin cancels any shift (pending or approved)
- **THEN** the date cell displays amber cancelled styling (existing behavior unchanged)
