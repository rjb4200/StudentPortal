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

### Requirement: Department crew context on the student calendar
The monthly student scheduling calendar SHALL show the applicable department crew shift and on-duty Chief for every displayed date. Crew context SHALL remain secondary to the student's personal schedule status, time, and approval state.

#### Scenario: Student views a calendar month
- **WHEN** a student opens or navigates to a month in the dashboard calendar
- **THEN** every displayed date includes its applicable crew-shift context
- **AND** existing schedule status colors and labels remain visible for dates with personal rides

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
The admin daily-ops "Action Required" panel SHALL display pending schedule requests with Approve and Reject buttons. Approved schedules SHALL NOT appear in the Action Required panel. Instead, approved schedules SHALL be managed in the Shift Management section where the admin can view, filter, and cancel them. Student-initiated cancellations of approved shifts SHALL appear in the Action Required feed as Cancel Requests with a "Cancel Shift" action button.

#### Scenario: Pending shift shows approve and reject options
- **WHEN** an admin views the Action Required panel
- **THEN** pending schedules are displayed with "Approve" and "Reject" buttons

#### Scenario: Approved shift shown in shift management only
- **WHEN** an admin views the Action Required panel
- **THEN** approved shifts are not displayed; they appear only in the Shift Management section under the Approved tab

#### Scenario: Cancelling an approved shift from shift management
- **WHEN** an admin clicks "Cancel" on an approved shift in the Shift Management table and confirms
- **THEN** the shift status changes to `cancelled`, `cancelled_by` is set to `admin`, and the student receives a cancellation email

#### Scenario: Student-initiated cancellation in action required
- **WHEN** a student cancels an approved shift
- **THEN** a Cancel Request entry appears in the Action Required feed with an amber badge and a "Cancel Shift" button

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
The system SHALL display a calendar grid where students can click a date cell and select Day Shift, Extended Shift, or Custom with start and end times. Day Shift SHALL be 7:00 AM-7:00 PM. Extended Shift SHALL use the existing `full` schedule type and be 7:00 AM-10:00 PM. Custom requests SHALL be limited to 7:00 AM through 10:00 PM and end later than they start. Submitted requests SHALL immediately show as Pending with yellow/striped styling and display the time range in 12-hour AM/PM format. Approved shifts SHALL display solid crimson red with the time range.

#### Scenario: Request an Extended Shift
- **WHEN** a student selects Extended Shift and confirms
- **THEN** a pending schedule record is created with a 7:00 AM start and 10:00 PM end

#### Scenario: Reject after-hours request
- **WHEN** a caller submits a student schedule request outside the 0700-2200 window
- **THEN** the request is rejected before a schedule record is created

#### Scenario: View approved shift with time
- **WHEN** a student views the calendar and an admin has approved a previously requested shift
- **THEN** the date cell displays solid crimson red styling with the time range in 12-hour AM/PM format

#### Scenario: View rejected shift
- **WHEN** a student views the calendar and an admin has rejected a previously requested shift
- **THEN** the date cell displays the rejected state with appropriate styling

### Requirement: Discoverable shift scheduling action
The dashboard SHALL make shift scheduling discoverable through a prominent primary action for certified students in addition to calendar date selection. Students SHALL NOT need to know in advance that clicking a calendar date is the only way to request a shift.

#### Scenario: Primary schedule action is visible
- **WHEN** a certified student opens the dashboard
- **THEN** a prominent "Schedule a Shift" action is visible before or alongside the schedule section
- **AND** the action leads the student into the existing shift request flow

#### Scenario: Calendar date selection remains available
- **WHEN** a certified student clicks an eligible future date on the calendar
- **THEN** the existing shift request flow remains available for that date

#### Scenario: Pending student cannot schedule shifts
- **WHEN** a pending student views the dashboard
- **THEN** schedule request actions are not presented as available
- **AND** the dashboard explains that scheduling unlocks after approval

### Requirement: iCal feed includes time ranges
The system SHALL include the shift time range in iCal event summaries and descriptions when `start_time` and `end_time` are present on the schedule record.

#### Scenario: Subscribe to personal iCal feed with times
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling, and event summaries include the time range when available

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved with the time range

### Requirement: Cancel modal on existing shift click
When a student clicks a calendar date that already has a pending or approved shift, the system SHALL open a cancel confirmation modal instead of ignoring the click. The modal SHALL display the date, time range, current status, and a "Cancel Shift" button.

#### Scenario: Click on pending shift opens cancel modal
- **WHEN** a student clicks a date with a pending shift
- **THEN** a modal opens showing "Cancel Shift Request" with the date, time range, and a "Cancel Shift" button

#### Scenario: Click on approved shift opens cancel modal
- **WHEN** a student clicks a date with an approved shift
- **THEN** a modal opens showing "Cancel Shift" with the date, time range, and a "Cancel Shift" button

#### Scenario: Cancelled and rejected dates show no cancel option
- **WHEN** a student clicks a date with a cancelled or rejected shift
- **THEN** nothing happens (the date is already in a terminal state)
