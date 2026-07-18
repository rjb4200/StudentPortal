## MODIFIED Requirements

### Requirement: Calendar grid UI
The system SHALL render a monthly calendar grid on the student dashboard. Each eligible date cell SHALL be clickable for scheduling requests. Date cells SHALL display color-coded status: yellow/striped (`#D4AF37`) for pending, solid crimson (`#B61C20`) for approved, a distinct style for rejected, and gray unavailable styling for globally blocked dates that do not contain the student's existing schedule.

#### Scenario: Calendar renders for current month
- **WHEN** a certified student loads the dashboard
- **THEN** the current month calendar is displayed with all existing schedule entries color-coded by status
- **AND** globally blocked unbooked dates are gray and unavailable

#### Scenario: Navigate to different month
- **WHEN** a student clicks the previous or next month navigation button
- **THEN** the calendar renders the selected month with any existing schedule entries and global blocked-date availability

#### Scenario: Existing schedule is on a blocked date
- **WHEN** a student has an existing pending or approved schedule on a globally blocked date
- **THEN** the cell preserves the personal schedule status and displays a separate blocked-day indicator
- **AND** the optional block reason is visible to the student when present

### Requirement: One-click shift request
Clicking an eligible future date cell SHALL open a minimal modal with shift type selection: Full Shift, Day, or Night. Selecting a shift type and confirming SHALL immediately create a schedule record with status `pending`. A globally blocked date is not eligible for the request flow.

#### Scenario: Request a Full Shift
- **WHEN** a student clicks an eligible future date, selects "Full Shift" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'full'`, `status = 'pending'`, and the date cell updates to yellow/striped styling

#### Scenario: Request a Day Shift
- **WHEN** a student clicks an eligible future date, selects "Day" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'day'`, `status = 'pending'`

#### Scenario: Request a Night Shift
- **WHEN** a student clicks an eligible future date, selects "Night" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'night'`, `status = 'pending'`

#### Scenario: Cannot request past dates
- **WHEN** a student clicks a date in the past
- **THEN** no modal opens and the date cell is non-interactive

#### Scenario: Cannot request a blocked date
- **WHEN** a student clicks a globally blocked date without an existing personal schedule
- **THEN** no modal opens and the date cell is non-interactive

#### Scenario: Block occurs while request modal is open
- **WHEN** a student submits a request after an admin has blocked the selected date
- **THEN** the request is rejected without creating a schedule and the dashboard displays an unavailable-date error

#### Scenario: Cancel shift request modal
- **WHEN** a student opens the shift type modal and clicks cancel or outside the modal
- **THEN** no schedule record is created and the date cell remains unchanged
