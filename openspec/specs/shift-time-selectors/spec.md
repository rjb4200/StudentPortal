# shift-time-selectors Specification

## Purpose
TBD - created by archiving change shift-time-selectors. Update Purpose after archive.
## Requirements
### Requirement: Shift signup with time selectors
The shift signup modal SHALL present three options: Day Shift (locked to 7:00 AM - 7:00 PM), Extended Shift (stored as `shift_type = 'full'` and locked to 7:00 AM - 10:00 PM), and Custom. Custom start and end dropdowns SHALL offer only times from 7:00 AM through 10:00 PM, SHALL default to a 0700 start, and SHALL require the end time to be later than the start time. Student-facing surfaces SHALL display times in 12-hour AM/PM format. Admin-facing surfaces SHALL display times in 24-hour format.

#### Scenario: Student selects Day Shift
- **WHEN** a student selects "Day Shift" in the signup modal and confirms
- **THEN** the schedule is created with `shift_type = 'day'`, `start_time = '7:00 AM'`, and `end_time = '7:00 PM'`

#### Scenario: Student selects Extended Shift
- **WHEN** a student selects "Extended Shift" in the signup modal and confirms
- **THEN** the schedule is created with `shift_type = 'full'`, `start_time = '7:00 AM'`, and `end_time = '10:00 PM'`

#### Scenario: Student selects Custom shift with default time
- **WHEN** a student selects "Custom", leaves the start dropdown at 0700, picks an end time, and confirms
- **THEN** the schedule is created with `shift_type = 'custom'` and the selected start and end times stored in 12-hour format

#### Scenario: Student attempts an overnight or after-2200 custom shift
- **WHEN** a student submits a custom start or end time outside 0700-2200, or an end time not later than the start time
- **THEN** the request is rejected

#### Scenario: Student selects Custom shift with modified start time
- **WHEN** a student selects "Custom" and changes the start dropdown to a time other than 0700
- **THEN** a nag text appears below the dropdown: "The shift starts at 0700. The best student experience would be to arrive at that time."

### Requirement: Night shift removed from student UI
The Night shift option SHALL be removed from the student-facing shift signup modal. The `night` value SHALL remain in the `shift_type` database enum so existing night-shift records are not broken.

#### Scenario: Night shift not shown to students
- **WHEN** a student opens the shift signup modal
- **THEN** only Day Shift, Full Shift, and Custom options are displayed

### Requirement: Time format by audience
Times SHALL be stored consistently in the database but displayed differently by audience. Student-facing surfaces (signup modal, calendar grid, emails to students) SHALL use 12-hour AM/PM format. Admin-facing surfaces (daily-ops panel) SHALL use 24-hour format.

#### Scenario: Student calendar cell shows AM/PM time
- **WHEN** a student views the calendar grid
- **THEN** approved shift cells display the time range in 12-hour AM/PM format (e.g., "7:00 AM")

#### Scenario: Admin panel shows 24-hour time
- **WHEN** an admin views the daily-ops schedule approval section
- **THEN** pending shift entries display the time range in 24-hour format (e.g., "0700–1900")

#### Scenario: Schedule email shows AM/PM time to student
- **WHEN** a student receives a schedule approval email
- **THEN** the email displays the time range in 12-hour AM/PM format

### Requirement: Custom dropdown 0700 bold styling
The Custom start time dropdown SHALL display "07:00" in bold text to emphasize the recommended arrival time.

#### Scenario: 0700 bold in dropdown
- **WHEN** a student opens the Custom start time dropdown
- **THEN** the "07:00" option is styled with bold font weight while all other options use normal weight
