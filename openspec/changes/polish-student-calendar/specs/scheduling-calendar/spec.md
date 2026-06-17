## MODIFIED Requirements

### Requirement: One-click shift request
Clicking a future date cell SHALL open a minimal modal with shift type selection: Full Shift, Day, or Custom. Clicking a date that already has a shift (pending or approved) SHALL open the Day Detail modal showing the shift's information and offering a Cancel action for non-terminal shifts. Clicking a cancelled or rejected date SHALL also open the Day Detail modal in read-only mode.

#### Scenario: Request a Day Shift
- **WHEN** a student clicks a future empty date, selects "Day Shift" from the ShiftModal, and confirms
- **THEN** a schedule record is created with `shift_type = 'day'`, `status = 'pending'`, and the date cell updates to pending styling with status text label

#### Scenario: Click existing shift opens detail modal
- **WHEN** a student clicks a date with a pending or approved shift
- **THEN** the Day Detail modal opens showing the shift's date, type, time, and status

#### Scenario: Click cancelled or rejected date opens read-only detail
- **WHEN** a student clicks a date with a cancelled or rejected shift
- **THEN** the Day Detail modal opens in read-only mode with no Cancel button

#### Scenario: Cannot request past dates
- **WHEN** a student clicks a date in the past with no existing shift
- **THEN** nothing happens and the date cell shows an unavailable tooltip

#### Scenario: Cancel shift request modal
- **WHEN** a student opens the shift type modal and clicks cancel or outside the modal
- **THEN** no schedule record is created and the date cell remains unchanged

### Requirement: Calendar grid UI
The system SHALL render a monthly calendar grid on the student dashboard. Each date cell SHALL be clickable for scheduling requests or viewing shift details. Date cells SHALL display color-coded background with a text status label (icon + text) for accessibility. Past dates SHALL be disabled with an unavailable tooltip. The calendar legend SHALL include Unavailable as a fifth entry.

#### Scenario: Calendar renders for current month
- **WHEN** a certified student loads the dashboard
- **THEN** the current month calendar is displayed with all existing schedule entries color-coded by status with text labels

#### Scenario: Pending shift cell shows gold background with text label
- **WHEN** a student views a date with a pending shift
- **THEN** the cell displays gold background with "⌛ Pending" text label and the time range

#### Scenario: Approved shift cell shows crimson background with text label
- **WHEN** a student views a date with an approved shift
- **THEN** the cell displays crimson background with "✓ Approved" text label and the time range

#### Scenario: Past date cell shows unavailable tooltip
- **WHEN** a student hovers over a past date cell with no shift
- **THEN** a tooltip displays "Past dates are unavailable for scheduling"

#### Scenario: Navigate to different month
- **WHEN** a student clicks the previous or next month navigation button
- **THEN** the calendar renders the selected month with any existing schedule entries

### Requirement: Cancel modal on existing shift click
When a student clicks a calendar date that already has a pending or approved shift, the system SHALL open the Day Detail modal instead of immediately opening the cancel confirmation modal. From the Day Detail modal, the student MAY click "Cancel Shift" to open the CancelShiftModal.

#### Scenario: Click on pending or approved shift opens detail modal
- **WHEN** a student clicks a date with a pending or approved shift
- **THEN** the Day Detail modal opens showing the shift's date, type, time range, and status with a "Cancel Shift" button

#### Scenario: Cancel button opens CancelShiftModal
- **WHEN** a student clicks "Cancel Shift" in the Day Detail modal
- **THEN** the CancelShiftModal opens pre-filled with the shift's information

#### Scenario: Cancelled and rejected dates show read-only detail
- **WHEN** a student clicks a date with a cancelled or rejected shift
- **THEN** the Day Detail modal opens in read-only mode with no Cancel button
