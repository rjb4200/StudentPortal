## Purpose

Define the calendar-based shift scheduling system for students to request, view, and manage clinical rotation shifts, including admin approval workflow and iCal feed generation.
## Requirements
### Requirement: Calendar grid UI
The system SHALL render a monthly calendar grid on the student dashboard. Each date cell SHALL be clickable for scheduling requests. Date cells SHALL display color-coded status: yellow/striped (`#D4AF37`) for pending, solid crimson (`#B61C20`) for approved, and a distinct style for rejected.

#### Scenario: Calendar renders for current month
- **WHEN** a certified student loads the dashboard
- **THEN** the current month calendar is displayed with all existing schedule entries color-coded by status

#### Scenario: Navigate to different month
- **WHEN** a student clicks the previous or next month navigation button
- **THEN** the calendar renders the selected month with any existing schedule entries

### Requirement: One-click shift request
Clicking a future date cell SHALL open a minimal modal with shift type selection: Full Shift, Day, or Night. Selecting a shift type and confirming SHALL immediately create a schedule record with status `pending`.

#### Scenario: Request a Full Shift
- **WHEN** a student clicks a future date, selects "Full Shift" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'full'`, `status = 'pending'`, and the date cell updates to yellow/striped styling

#### Scenario: Request a Day Shift
- **WHEN** a student clicks a future date, selects "Day" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'day'`, `status = 'pending'`

#### Scenario: Request a Night Shift
- **WHEN** a student clicks a future date, selects "Night" from the modal, and confirms
- **THEN** a schedule record is created with `shift_type = 'night'`, `status = 'pending'`

#### Scenario: Cannot request past dates
- **WHEN** a student clicks a date in the past
- **THEN** no modal opens and the date cell is non-interactive

#### Scenario: Cancel shift request modal
- **WHEN** a student opens the shift type modal and clicks cancel or outside the modal
- **THEN** no schedule record is created and the date cell remains unchanged

### Requirement: Admin approval workflow
The admin command center SHALL display pending schedule requests with Approve and Reject actions. The admin SHALL act on each request individually.

#### Scenario: Admin approves a schedule request
- **WHEN** an admin clicks "Approve" on a pending request
- **THEN** the schedule record's `status` changes to `approved`, the student's calendar cell updates to crimson red, the student's iCal feed regenerates, and a confirmation email is sent

#### Scenario: Admin rejects a schedule request
- **WHEN** an admin clicks "Reject" on a pending request
- **THEN** the schedule record's `status` changes to `rejected`, the student's calendar reflects the rejection, and a notification email is sent

### Requirement: iCal feed regeneration on state change
Any change to a schedule record's status SHALL trigger regeneration of the affected student's iCal feed and the aggregate feed.

#### Scenario: Feed regenerates on approval
- **WHEN** an admin approves a pending shift
- **THEN** the student's iCal feed and the aggregate feed are both regenerated with the updated status

#### Scenario: Feed regenerates on new request
- **WHEN** a student submits a new shift request
- **THEN** the student's iCal feed is regenerated to include the new pending entry

### Requirement: Schedule data isolation
RLS policies SHALL ensure students can only view and create their own schedule records. Admin users SHALL have full read and write access to all schedule records.

#### Scenario: Student queries only own schedules
- **WHEN** a student views their calendar
- **THEN** only schedule records where `student_id` matches their authenticated UUID are returned

#### Scenario: Admin queries all schedules
- **WHEN** an admin views the approval queue or aggregate calendar
- **THEN** all schedule records across all students are returned

### Requirement: Calendar shift scheduling with time selectors
The system SHALL display a calendar grid where students can click a date cell and select a shift type with start and end times from a modal. Day Shift and Full Shift are locked presets; Custom shift provides start/end time dropdowns. Submitted requests SHALL immediately show as "Pending" with yellow/striped styling and display the time range in 12-hour AM/PM format. Approved shifts SHALL display solid crimson red with the time range.

#### Scenario: Request a shift with time
- **WHEN** a student clicks a future date cell, selects "Day Shift", and confirms
- **THEN** a schedule record is created with `status = 'pending'`, `start_time = '7:00 AM'`, `end_time = '7:00 PM'`, and the date cell displays yellow/striped styling with "7:00 AM" below the date

#### Scenario: View approved shift with time
- **WHEN** a student views the calendar and an admin has approved a previously requested shift
- **THEN** the date cell displays solid crimson red styling with the time range in 12-hour AM/PM format

#### Scenario: View rejected shift
- **WHEN** a student views the calendar and an admin has rejected a previously requested shift
- **THEN** the date cell displays the rejected state with appropriate styling

### Requirement: iCal feed includes time ranges
The system SHALL include the shift time range in iCal event summaries and descriptions when `start_time` and `end_time` are present on the schedule record.

#### Scenario: Subscribe to personal iCal feed with times
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling, and event summaries include the time range when available

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved with the time range

