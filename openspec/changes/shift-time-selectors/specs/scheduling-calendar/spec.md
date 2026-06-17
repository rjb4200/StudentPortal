## MODIFIED Requirements

### Requirement: Calendar shift scheduling
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

### Requirement: Per-student iCal calendar feed
The system SHALL generate a unique iCal subscription URL for each student that displays all scheduled days. Days SHALL appear as pending once the student signs up and SHALL update to approved as each day is approved by an admin. iCal event summaries SHALL include the time range when available.

#### Scenario: Subscribe to personal iCal feed
- **WHEN** a student copies their unique iCal feed URL and subscribes in Google Calendar or Apple Calendar
- **THEN** all scheduled days appear as calendar events with pending/approved status reflected in the event styling, and event summaries include the time range

#### Scenario: Calendar feed updates on approval
- **WHEN** an admin approves a pending schedule request
- **THEN** the student's iCal feed reflects the change on the next calendar client refresh, showing the day as approved with the time range
